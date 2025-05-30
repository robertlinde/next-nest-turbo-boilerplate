import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {Request, Response} from 'express';
import {mock, mockDeep, DeepMockProxy} from 'jest-mock-extended';
import {ConfigKey} from '../config/config-key.enum';
import {User} from '../users/entities/user.entity';
import {oneMinute, oneWeek} from '../utils/time.util';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {LoginCredentialsBodyDto} from './dto/login-credentials.body.dto';
import {LoginTwoFactorAuthBodyDto} from './dto/login-two-factor-auth.body.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: DeepMockProxy<AuthService>;
  let configService: DeepMockProxy<ConfigService>;

  const mockResponse = (): Response => {
    const response = mock<Response>();
    response.cookie.mockReturnThis();
    response.clearCookie.mockReturnThis();
    return response;
  };

  const mockRequest = (cookies = {}): Request => mock<Request>({cookies});

  const mockUser = new User({
    email: 'test@example.com',
    password: 'hashed-password',
    username: 'tester',
    confirmationCode: '',
  });

  beforeEach(async () => {
    authService = mockDeep<AuthService>();
    configService = mockDeep<ConfigService>();

    // Default configuration for environment
    configService.get.mockImplementation((key: ConfigKey) => {
      if (key === ConfigKey.NODE_ENV) return 'development';
      return null;
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should validate credentials and set 2FA cookie', async () => {
      const loginDto: LoginCredentialsBodyDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const response = mockResponse();
      const twoFactorAuthHashedId = 'mock-2fa-hashed-id';

      authService.validateUserCredentials.mockResolvedValue(twoFactorAuthHashedId);

      await controller.login(loginDto, response);

      expect(authService.validateUserCredentials).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(response.cookie).toHaveBeenCalledWith('two_factor_auth', twoFactorAuthHashedId, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: oneMinute * 15,
      });
    });
  });

  describe('login2fa', () => {
    it('should validate 2FA code and set access and refresh token cookies', async () => {
      const login2faDto: LoginTwoFactorAuthBodyDto = {
        code: '123456',
      };
      const twoFactorAuthHashedId = 'mock-2fa-hashed-id';
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const req = mockRequest({two_factor_auth: twoFactorAuthHashedId});
      const response = mockResponse();
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';

      authService.validateTwoFactorAuth.mockResolvedValue(mockUser);
      authService.generateAccessToken.mockResolvedValue(accessToken);
      authService.generateRefreshToken.mockResolvedValue(refreshToken);

      await controller.login2fa(login2faDto, req, response);

      expect(authService.validateTwoFactorAuth).toHaveBeenCalledWith(twoFactorAuthHashedId, '123456');
      expect(authService.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(authService.generateRefreshToken).toHaveBeenCalledWith(mockUser);

      expect(response.cookie).toHaveBeenCalledWith('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: oneMinute * 15,
      });

      expect(response.cookie).toHaveBeenCalledWith('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: oneWeek,
      });
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and update cookies', async () => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const req = mockRequest({refresh_token: 'old-refresh-token'});
      const response = mockResponse();
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      authService.refreshTokens.mockResolvedValue({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      await controller.refresh(req, response);

      expect(authService.refreshTokens).toHaveBeenCalledWith('old-refresh-token');
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token');

      expect(response.cookie).toHaveBeenCalledWith('access_token', newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: oneMinute * 15,
      });

      expect(response.cookie).toHaveBeenCalledWith('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: oneWeek,
      });
    });
  });

  describe('logout', () => {
    it('should clear auth cookies', async () => {
      const response = mockResponse();

      await controller.logout(response);

      expect(response.clearCookie).toHaveBeenCalledWith('access_token');
      expect(response.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('environment configuration', () => {
    it('should set secure cookies in production environment', async () => {
      // Create a new instance with production environment
      const prodConfigService = mockDeep<ConfigService>();
      prodConfigService.get.mockImplementation((key: ConfigKey) => {
        if (key === ConfigKey.NODE_ENV) return 'production';
        return null;
      });

      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: authService,
          },
          {
            provide: ConfigService,
            useValue: prodConfigService,
          },
        ],
      }).compile();

      const productionController = module.get<AuthController>(AuthController);

      const loginDto: LoginCredentialsBodyDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const response = mockResponse();
      const twoFactorAuthHashedId = 'mock-2fa-hashed-id';

      authService.validateUserCredentials.mockResolvedValue(twoFactorAuthHashedId);

      await productionController.login(loginDto, response);

      expect(response.cookie).toHaveBeenCalledWith('two_factor_auth', twoFactorAuthHashedId, {
        httpOnly: true,
        secure: true, // Should be true in production
        sameSite: 'lax',
        maxAge: oneMinute * 15,
      });
    });
  });
});
