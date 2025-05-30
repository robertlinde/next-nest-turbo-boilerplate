import {Controller, Post, Body, Res, Req, HttpCode, HttpStatus} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ApiResponse, ApiTags, ApiOperation} from '@nestjs/swagger';
import {Throttle} from '@nestjs/throttler';
import type {Response, Request} from 'express';
import {ConfigKey} from '../config/config-key.enum';
import {oneMinute, oneWeek} from '../utils/time.util';
import {AuthService} from './auth.service';
import {Public} from './decorators/public.decorator';
import {LoginCredentialsBodyDto} from './dto/login-credentials.body.dto';
import {LoginTwoFactorAuthBodyDto} from './dto/login-two-factor-auth.body.dto';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ACCESS_TOKEN_COOKIE_KEY = 'access_token';
// eslint-disable-next-line @typescript-eslint/naming-convention
const REFRESH_TOKEN_COOKIE_KEY = 'refresh_token';

// eslint-disable-next-line @typescript-eslint/naming-convention
const TWO_FACTOR_AUTH_COOKIE_KEY = 'two_factor_auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login/credentials')
  @Public()
  @Throttle({default: {ttl: oneMinute, limit: 5}})
  @ApiOperation({
    summary: 'Login with credentials and issue 2FA code',
    description:
      'This endpoint accepts user credentials (email and password) and issues a 2FA code for further authentication.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, 2FA code issued.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
  })
  async login(@Body() loginDto: LoginCredentialsBodyDto, @Res({passthrough: true}) response: Response): Promise<void> {
    const twoFactorAuthHashedId = await this.authService.validateUserCredentials(loginDto.email, loginDto.password);

    response.cookie(TWO_FACTOR_AUTH_COOKIE_KEY, twoFactorAuthHashedId, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneMinute * 15, // 15 minutes
    });
  }

  @Post('login/2fa')
  @Public()
  @Throttle({default: {ttl: oneMinute, limit: 5}})
  @ApiOperation({
    summary: 'Login with 2FA code and generate tokens',
    description: 'This endpoint verifies the provided 2FA code and generates access and refresh tokens for the user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, tokens generated.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid 2FA code.',
  })
  async login2fa(
    @Body() body: LoginTwoFactorAuthBodyDto,
    @Req() req: Request,
    @Res({passthrough: true}) response: Response,
  ): Promise<void> {
    const {code} = body;
    const twoFactorAuthHashedId = req.cookies[TWO_FACTOR_AUTH_COOKIE_KEY] as string;
    const user = await this.authService.validateTwoFactorAuth(twoFactorAuthHashedId, code);

    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    response.cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneMinute * 15, // 15 minutes
    });

    response.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneWeek,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Refresh access and refresh tokens',
    description: 'This endpoint refreshes the access and refresh tokens using the provided refresh token.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token.',
  })
  async refresh(@Req() req: Request, @Res({passthrough: true}) response: Response): Promise<void> {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_KEY] as string;
    const {accessToken, refreshToken: newRefreshToken} = await this.authService.refreshTokens(refreshToken);

    response.clearCookie(REFRESH_TOKEN_COOKIE_KEY);

    response.cookie(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneMinute * 15, // 15 minutes
    });

    response.cookie(REFRESH_TOKEN_COOKIE_KEY, newRefreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>(ConfigKey.NODE_ENV) === 'production',
      sameSite: 'lax',
      maxAge: oneWeek,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout and clear authentication cookies',
    description: 'This endpoint clears the access and refresh tokens from the cookies and logs out the user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged out successfully.',
  })
  async logout(@Res({passthrough: true}) response: Response): Promise<void> {
    response.clearCookie(ACCESS_TOKEN_COOKIE_KEY);
    response.clearCookie(REFRESH_TOKEN_COOKIE_KEY);
  }
}
