import {EntityManager, QueryBuilder} from '@mikro-orm/postgresql';
import {ConflictException, GoneException, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {mock, MockProxy} from 'jest-mock-extended';
import {ConfigKey} from '../config/config-key.enum';
import {CryptoService} from '../crypto/crypto.service';
import {EmailService} from '../email/email.service';
import {oneDay, oneHour, oneMinute} from '../utils/time.util';
import {User} from './entities/user.entity';
import {UserStatus} from './types/user-status.enum';
import {UsersService} from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let em: MockProxy<EntityManager>;
  let cryptoService: MockProxy<CryptoService>;
  let emailService: MockProxy<EmailService>;
  let configService: MockProxy<ConfigService>;
  let mockQueryBuilder: jest.Mocked<QueryBuilder<User>>;

  beforeEach(async (): Promise<void> => {
    // Create main mocks
    em = mock<EntityManager>();
    cryptoService = mock<CryptoService>();
    emailService = mock<EmailService>();
    configService = mock<ConfigService>();

    // Create mock query builder manually instead of using mockDeep
    mockQueryBuilder = {
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({affectedRows: 3}),
    } as unknown as jest.Mocked<QueryBuilder<User>>;

    // Setup default behaviors
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    em.createQueryBuilder.mockReturnValue(mockQueryBuilder as unknown as QueryBuilder<object, string>);
    cryptoService.hash.mockResolvedValue('hashed-value');
    configService.get.mockImplementation((key: ConfigKey) => {
      if (key === ConfigKey.FRONTEND_HOST) return 'http://localhost';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {provide: EntityManager, useValue: em},
        {provide: CryptoService, useValue: cryptoService},
        {provide: EmailService, useValue: emailService},
        {provide: ConfigService, useValue: configService},
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create and return a user and send a confirmation email', async (): Promise<void> => {
      em.persistAndFlush.mockImplementation(async (user: User) => {
        user.id = '1';
      });

      const user = await service.createUser('test@example.com', 'password123', 'tester');

      expect(user).toHaveProperty('confirmationCode');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('tester');
      expect(em.persistAndFlush).toHaveBeenCalled();
      expect(cryptoService.hash).toHaveBeenCalledWith('password123');
      expect(emailService.sendConfirmEmail).toHaveBeenCalledWith(
        'tester',
        'test@example.com',
        expect.stringContaining('/confirm?token='),
      );
    });

    it('should throw ConflictException if user already exists', async (): Promise<void> => {
      em.persistAndFlush.mockRejectedValueOnce(
        new ConflictException('duplicate key value violates unique constraint "users_email_key"'),
      );

      await expect(service.createUser('test@example.com', 'password123', 'tester')).rejects.toThrow(ConflictException);

      expect(em.persistAndFlush).toHaveBeenCalled();
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: '',
        confirmationCode: 'mock-confirm-code',
      });

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('test@example.com');
      expect(result).toBe(mockUser);
      expect(em.findOne).toHaveBeenCalledWith(User, {email: 'test@example.com'});
    });

    it('should throw NotFoundException if user is not found', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);

      await expect(service.getUserByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      expect(em.findOne).toHaveBeenCalledWith(User, {email: 'nonexistent@example.com'});
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: '',
        confirmationCode: 'mock-confirm-code',
      });
      mockUser.id = 'user-123';

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-123');
      expect(result).toBe(mockUser);
      expect(em.findOne).toHaveBeenCalledWith(User, {id: 'user-123'});
    });

    it('should throw NotFoundException if user is not found', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);

      await expect(service.getUserById('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(em.findOne).toHaveBeenCalledWith(User, {id: 'nonexistent-id'});
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user by username', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: 'tester',
        confirmationCode: 'mock-confirm-code',
      });

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByUsername('tester');
      expect(result).toBe(mockUser);
      expect(em.findOne).toHaveBeenCalledWith(User, {username: 'tester'});
    });

    it('should throw NotFoundException if user is not found', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);

      await expect(service.getUserByUsername('nonexistent')).rejects.toThrow(NotFoundException);
      expect(em.findOne).toHaveBeenCalledWith(User, {username: 'nonexistent'});
    });
  });

  describe('confirmUser', () => {
    it('should activate the user if within time limit', async (): Promise<void> => {
      const createdAt = new Date(Date.now() - oneMinute * 30); // 30 minutes ago
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: '',
        confirmationCode: 'abc',
      });

      mockUser.status = UserStatus.CONFIRMATION_PENDING;
      mockUser.createdAt = createdAt;

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.confirmUser('abc');

      expect(result.status).toBe(UserStatus.ACTIVE);
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should return user if already active', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: '',
        confirmationCode: 'abc',
      });

      mockUser.status = UserStatus.ACTIVE;

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.confirmUser('abc');

      expect(result).toBe(mockUser);
      expect(em.persistAndFlush).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if code is invalid', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);

      await expect(service.confirmUser('invalid')).rejects.toThrow(NotFoundException);
      expect(em.findOne).toHaveBeenCalledWith(User, {confirmationCode: 'invalid'});
    });

    it('should remove and throw if code is expired', async (): Promise<void> => {
      const oldDate = new Date(Date.now() - 2 * oneDay); // 48 hours ago
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: '',
        confirmationCode: 'abc',
      });

      mockUser.createdAt = oldDate;
      mockUser.status = UserStatus.CONFIRMATION_PENDING;

      em.findOne.mockResolvedValue(mockUser);

      await expect(service.confirmUser('abc')).rejects.toThrow(GoneException);
      expect(em.removeAndFlush).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: '',
        confirmationCode: 'mock-confirm-code',
      });
      mockUser.id = 'user-123';

      em.findOne.mockResolvedValue(mockUser);

      await service.deleteUser('user-123');

      expect(em.findOne).toHaveBeenCalledWith(User, {id: 'user-123'});
      expect(em.removeAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user is not found', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token and send email', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: '',
        username: 'tester',
        confirmationCode: '',
      });

      em.findOne.mockResolvedValue(mockUser);

      await service.requestPasswordReset('test@example.com');

      expect(mockUser.passwordResetToken).toBeDefined();
      expect(mockUser.passwordResetTokenCreatedAt).toBeDefined();
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
      expect(emailService.sendRequestPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        'tester',
        expect.stringContaining('/reset-password?token='),
      );
    });

    it('should not throw if user is not found', async (): Promise<void> => {
      em.findOne.mockRejectedValue(new NotFoundException());

      await service.requestPasswordReset('nonexistent@example.com');

      expect(emailService.sendRequestPasswordResetEmail).not.toHaveBeenCalled();
      expect(em.persistAndFlush).not.toHaveBeenCalled();
    });
  });

  describe('confirmPasswordReset', () => {
    it('should reset password with valid token', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'old-password',
        username: 'tester',
        confirmationCode: '',
      });

      mockUser.passwordResetToken = 'valid-token';
      mockUser.passwordResetTokenCreatedAt = new Date(Date.now() - oneHour); // 1 hour ago

      em.findOne.mockResolvedValue(mockUser);

      await service.confirmPasswordReset('valid-token', 'new-password');

      expect(mockUser.password).toBe('hashed-value');
      expect(mockUser.passwordResetToken).toBeUndefined();
      expect(mockUser.passwordResetTokenCreatedAt).toBeUndefined();
      expect(cryptoService.hash).toHaveBeenCalledWith('new-password');
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if token is invalid', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);

      await expect(service.confirmPasswordReset('invalid-token', 'new-password')).rejects.toThrow(NotFoundException);
    });

    it('should throw GoneException if token is expired', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'old-password',
        username: 'tester',
        confirmationCode: '',
      });

      mockUser.passwordResetToken = 'expired-token';
      // Set to 3 hours ago (beyond 2 hour limit)
      mockUser.passwordResetTokenCreatedAt = new Date(Date.now() - 3 * oneHour);

      em.findOne.mockResolvedValue(mockUser);

      await expect(service.confirmPasswordReset('expired-token', 'new-password')).rejects.toThrow(GoneException);
    });
  });

  describe('updateUser', () => {
    it('should update user email', async (): Promise<void> => {
      const mockUser = new User({
        email: 'old@example.com',
        password: 'password',
        username: 'oldname',
        confirmationCode: '',
      });
      mockUser.id = 'user-123';

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.updateUser('user-123', 'new@example.com');

      expect(result.email).toBe('new@example.com');
      expect(result.username).toBe('oldname'); // unchanged
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should update user username', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'password',
        username: 'oldname',
        confirmationCode: '',
      });
      mockUser.id = 'user-123';

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.updateUser('user-123', undefined, 'newname');

      expect(result.email).toBe('test@example.com'); // unchanged
      expect(result.username).toBe('newname');
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should update user password', async (): Promise<void> => {
      const mockUser = new User({
        email: 'test@example.com',
        password: 'old-password',
        username: 'username',
        confirmationCode: '',
      });
      mockUser.id = 'user-123';

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.updateUser('user-123', undefined, undefined, 'new-password');

      expect(result.password).toBe('hashed-value');
      expect(cryptoService.hash).toHaveBeenCalledWith('new-password');
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should update multiple user fields', async (): Promise<void> => {
      const mockUser = new User({
        email: 'old@example.com',
        password: 'old-password',
        username: 'oldname',
        confirmationCode: '',
      });
      mockUser.id = 'user-123';

      em.findOne.mockResolvedValue(mockUser);

      const result = await service.updateUser('user-123', 'new@example.com', 'newname', 'new-password');

      expect(result.email).toBe('new@example.com');
      expect(result.username).toBe('newname');
      expect(result.password).toBe('hashed-value');
      expect(cryptoService.hash).toHaveBeenCalledWith('new-password');
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user is not found', async (): Promise<void> => {
      em.findOne.mockResolvedValue(null);

      await expect(service.updateUser('nonexistent-id', 'new@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeExpiredPendingUsers', () => {
    it('should remove expired pending users', async (): Promise<void> => {
      mockQueryBuilder.execute.mockResolvedValue({affectedRows: 3});

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.removeExpiredPendingUsers();

      expect(em.createQueryBuilder).toHaveBeenCalledWith(User);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        status: UserStatus.CONFIRMATION_PENDING,
        createdAt: {$lt: expect.any(Date)}, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Removed 3 expired pending users');

      consoleSpy.mockRestore();
    });

    it('should not log if no expired pending users are removed', async (): Promise<void> => {
      mockQueryBuilder.execute.mockResolvedValue({affectedRows: 0});

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.removeExpiredPendingUsers();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
