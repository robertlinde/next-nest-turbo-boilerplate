import {EntityManager, QueryBuilder} from '@mikro-orm/postgresql';
import {ForbiddenException, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {Test, TestingModule} from '@nestjs/testing';
import {mock, MockProxy} from 'jest-mock-extended';
import {ConfigKey} from '../config/config-key.enum';
import {CryptoService} from '../crypto/crypto.service';
import {EmailService} from '../email/email.service';
import {User} from '../users/entities/user.entity';
import {UserStatus} from '../users/types/user-status.enum';
import {UsersService} from '../users/users.service';
import {AuthService} from './auth.service';
import {RevokedRefreshToken} from './entities/revoked-refresh-token.entity';
import {TwoFactorAuth} from './entities/two-factor-auth.entity';

describe('AuthService', () => {
  let service: AuthService;

  let em: MockProxy<EntityManager>;
  let usersService: MockProxy<UsersService>;
  let jwtService: MockProxy<JwtService>;
  let cryptoService: MockProxy<CryptoService>;
  let emailService: MockProxy<EmailService>;
  let configService: MockProxy<ConfigService>;

  let mockQueryBuilder: jest.Mocked<QueryBuilder<RevokedRefreshToken>>;

  beforeEach(async (): Promise<void> => {
    em = mock<EntityManager>();
    usersService = mock<UsersService>();
    jwtService = mock<JwtService>();
    cryptoService = mock<CryptoService>();
    emailService = mock<EmailService>();
    configService = mock<ConfigService>();

    mockQueryBuilder = {
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({affectedRows: 3}),
    } as unknown as jest.Mocked<QueryBuilder<RevokedRefreshToken>>;

    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    em.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as QueryBuilder<object, string>);

    jwtService.sign.mockReturnValue('mock-token');
    cryptoService.hash.mockResolvedValue('hashed-value');
    cryptoService.generateRandomCode.mockReturnValue('123456');
    configService.get.mockImplementation((key: ConfigKey) => {
      if (key === ConfigKey.JWT_ACCESS_SECRET) return 'access-secret';
      if (key === ConfigKey.JWT_REFRESH_SECRET) return 'refresh-secret';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {provide: EntityManager, useValue: em},
        {provide: UsersService, useValue: usersService},
        {provide: JwtService, useValue: jwtService},
        {provide: CryptoService, useValue: cryptoService},
        {provide: EmailService, useValue: emailService},
        {provide: ConfigService, useValue: configService},
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUserCredentials', () => {
    it('should validate user credentials and return 2FA id', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });
      mockUser.status = UserStatus.ACTIVE;

      usersService.getUserByEmail.mockResolvedValue(mockUser);
      cryptoService.compare.mockResolvedValue(true);
      em.persistAndFlush.mockImplementation(async (twoFactorAuth: TwoFactorAuth) => {
        twoFactorAuth.id = 'test-2fa-id';
      });

      const result = await service.validateUserCredentials('test@example.com', 'password123');

      expect(result).toEqual('hashed-value');
      expect(usersService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(cryptoService.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(em.persistAndFlush).toHaveBeenCalled();
      expect(emailService.sendTwoFactorAuthCodeEmail).toHaveBeenCalledWith('test@example.com', '123456');
      expect(cryptoService.hash).toHaveBeenCalledWith('test-2fa-id');
    });

    it('should throw UnauthorizedException if user is not found', async (): Promise<void> => {
      usersService.getUserByEmail.mockRejectedValue(new Error('User not found'));

      await expect(service.validateUserCredentials('nonexistent@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user status is CONFIRMATION_PENDING', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });
      mockUser.status = UserStatus.CONFIRMATION_PENDING;

      usersService.getUserByEmail.mockResolvedValue(mockUser);

      await expect(service.validateUserCredentials('test@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException if user status is BLOCKED', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });
      mockUser.status = UserStatus.BLOCKED;

      usersService.getUserByEmail.mockResolvedValue(mockUser);

      await expect(service.validateUserCredentials('test@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException if password does not match', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });
      mockUser.status = UserStatus.ACTIVE;

      usersService.getUserByEmail.mockResolvedValue(mockUser);
      cryptoService.compare.mockResolvedValue(false);

      await expect(service.validateUserCredentials('test@example.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(cryptoService.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    });
  });

  describe('validateTwoFactorAuth', () => {
    it('should validate 2FA code and return user', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });

      const mockTwoFactorAuth = new TwoFactorAuth({
        user: mockUser,
        code: '123456',
      });
      mockTwoFactorAuth.id = '2fa-id';
      mockTwoFactorAuth.createdAt = new Date();

      em.find.mockResolvedValue([mockTwoFactorAuth]);
      cryptoService.compare.mockResolvedValue(true);

      const result = await service.validateTwoFactorAuth('hashed-2fa-id', '123456');

      expect(result).toBe(mockUser);
      expect(em.find).toHaveBeenCalled();
      expect(cryptoService.compare).toHaveBeenCalledWith('2fa-id', 'hashed-2fa-id');
      expect(em.removeAndFlush).toHaveBeenCalledWith(mockTwoFactorAuth);
    });

    it('should throw UnauthorizedException if 2FA id is missing', async (): Promise<void> => {
      await expect(service.validateTwoFactorAuth('', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if no matching 2FA entry is found', async (): Promise<void> => {
      em.find.mockResolvedValue([]);

      await expect(service.validateTwoFactorAuth('hashed-2fa-id', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if 2FA entry has expired', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });

      const mockTwoFactorAuth = new TwoFactorAuth({
        user: mockUser,
        code: '123456',
      });
      mockTwoFactorAuth.id = '2fa-id';

      // Set creation date to 20 minutes ago (beyond 15 min expiry threshold)
      const oldDate = new Date(Date.now() - 20 * 60 * 1000);
      mockTwoFactorAuth.createdAt = oldDate;

      em.find.mockResolvedValue([]);

      await expect(service.validateTwoFactorAuth('hashed-2fa-id', '123456')).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if found entries don't match the hashed 2FA id", async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });

      const mockTwoFactorAuth = new TwoFactorAuth({
        user: mockUser,
        code: '123456',
      });
      mockTwoFactorAuth.id = '2fa-id';
      mockTwoFactorAuth.createdAt = new Date();

      // Return a valid entry for the code check
      em.find.mockResolvedValue([mockTwoFactorAuth]);

      // But make the ID comparison always fail
      cryptoService.compare.mockResolvedValue(false);

      await expect(service.validateTwoFactorAuth('wrong-hashed-2fa-id', '123456')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(em.find).toHaveBeenCalled();
      expect(cryptoService.compare).toHaveBeenCalledWith('2fa-id', 'wrong-hashed-2fa-id');
      expect(em.removeAndFlush).not.toHaveBeenCalled();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token for a user', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });
      mockUser.id = 'user-id';

      const result = await service.generateAccessToken(mockUser);

      expect(result).toBe('mock-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {sub: 'user-id'},
        {
          secret: 'access-secret',
          expiresIn: '15m',
        },
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token for a user', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });
      mockUser.id = 'user-id';

      const result = await service.generateRefreshToken(mockUser);

      expect(result).toBe('mock-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {sub: 'user-id'},
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        },
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens for a valid refresh token', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'hashed-password',
        username: 'tester',
        confirmationCode: 'code',
      });
      mockUser.id = 'user-id';

      // No revoked token exists
      em.findOne.mockResolvedValue(null);

      // JWT verification succeeds
      jwtService.verifyAsync.mockResolvedValue({sub: 'user-id'});

      // User exists
      usersService.getUserById.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
      });
      expect(em.findOne).toHaveBeenCalledWith(RevokedRefreshToken, {token: 'valid-refresh-token'});
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'refresh-secret',
      });
      expect(usersService.getUserById).toHaveBeenCalledWith('user-id');
      expect(em.persistAndFlush).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if refresh token is revoked', async (): Promise<void> => {
      const mockRevokedToken = new RevokedRefreshToken({token: 'revoked-token'});
      em.findOne.mockResolvedValue(mockRevokedToken);

      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(ForbiddenException);
      expect(em.findOne).toHaveBeenCalledWith(RevokedRefreshToken, {token: 'revoked-token'});
    });

    it('should throw ForbiddenException if JWT verification fails', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user does not exist', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);
      jwtService.verifyAsync.mockResolvedValue({sub: 'nonexistent-user-id'});
      usersService.getUserById.mockRejectedValueOnce(new NotFoundException(`User with id not found`));

      await expect(service.refreshTokens('valid-token-invalid-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeExpiredTwoFactorAuth', () => {
    it('should remove expired two factor auth codes', async (): Promise<void> => {
      const mockExecuteResult = {affectedRows: 5};

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockExecuteResult),
      };

      // eslint-disable-next-line @typescript-eslint/no-restricted-types
      em.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as QueryBuilder<object, string>);

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.removeExpiredTwoFactorAuth();

      expect(em.createQueryBuilder).toHaveBeenCalledWith(TwoFactorAuth);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        createdAt: {$lt: expect.any(Date)}, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Removed 5 expired pending two factor auth codes');

      consoleSpy.mockRestore();
    });

    it('should not log if no expired two factor auth codes are removed', async (): Promise<void> => {
      const mockExecuteResult = {affectedRows: 0};

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockExecuteResult),
      };

      // eslint-disable-next-line @typescript-eslint/no-restricted-types
      em.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as QueryBuilder<object, string>);

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.removeExpiredTwoFactorAuth();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('removeExpiredRevokedRefreshTokens', () => {
    it('should remove expired revoked refresh tokens', async (): Promise<void> => {
      const mockExecuteResult = {affectedRows: 3};

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockExecuteResult),
      };

      // eslint-disable-next-line @typescript-eslint/no-restricted-types
      em.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as QueryBuilder<object, string>);

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.removeExpiredRevokedRefreshTokens();

      expect(em.createQueryBuilder).toHaveBeenCalledWith(RevokedRefreshToken);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        createdAt: {$lt: expect.any(Date)}, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Removed 3 expired revoked refresh tokens');

      consoleSpy.mockRestore();
    });

    it('should not log if no expired revoked refresh tokens are removed', async (): Promise<void> => {
      const mockExecuteResult = {affectedRows: 0};

      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockExecuteResult),
      };

      // eslint-disable-next-line @typescript-eslint/no-restricted-types
      em.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as QueryBuilder<object, string>);

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.removeExpiredRevokedRefreshTokens();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
