import {EntityManager} from '@mikro-orm/postgresql';
import {Injectable, UnauthorizedException, ForbiddenException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {Cron} from '@nestjs/schedule';
import {ConfigKey} from '../config/config-key.enum';
import {CryptoService} from '../crypto/crypto.service';
import {EmailService} from '../email/email.service';
import {User} from '../users/entities/user.entity';
import {UserStatus} from '../users/types/user-status.enum';
import {UsersService} from '../users/users.service';
import {oneDay, oneMinute} from '../utils/time.util';
import {RevokedRefreshToken} from './entities/revoked-refresh-token.entity';
import {TwoFactorAuth} from './entities/two-factor-auth.entity';

@Injectable()
export class AuthService {
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
  ) {}

  @Cron('0 * * * *') // every hour, on the hour
  async removeExpiredTwoFactorAuth(): Promise<void> {
    const threshold = new Date(Date.now() - oneMinute * 15);

    const {affectedRows} = await this.em
      .createQueryBuilder(TwoFactorAuth)
      .delete()
      .where({
        createdAt: {$lt: threshold},
      })
      .execute();

    if (affectedRows > 0) {
      console.log(`Removed ${affectedRows} expired pending two factor auth codes`);
    }
  }

  @Cron('0 * * * *') // every hour, on the hour
  async removeExpiredRevokedRefreshTokens(): Promise<void> {
    const threshold = new Date(Date.now() - 7 * oneDay);

    const {affectedRows} = await this.em
      .createQueryBuilder(RevokedRefreshToken)
      .delete()
      .where({
        createdAt: {$lt: threshold},
      })
      .execute();

    if (affectedRows > 0) {
      console.log(`Removed ${affectedRows} expired revoked refresh tokens`);
    }
  }

  async validateUserCredentials(email: string, password: string): Promise<string> {
    let user: User | undefined;

    try {
      user = await this.usersService.getUserByEmail(email);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.CONFIRMATION_PENDING) {
      throw new UnauthorizedException('User is not confirmed');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('User is blocked');
    }

    const isMatch = await this.cryptoService.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const twoFactorAuth = new TwoFactorAuth({
      user,
      code: this.cryptoService.generateRandomCode(),
    });

    await this.em.persistAndFlush(twoFactorAuth);

    await this.emailService.sendTwoFactorAuthCodeEmail(user.email, twoFactorAuth.code);

    const twoFactorAuthCode = await this.cryptoService.hash(twoFactorAuth.id);

    return twoFactorAuthCode;
  }

  async validateTwoFactorAuth(twoFactorAuthHashedId: string, code: string): Promise<User> {
    if (!twoFactorAuthHashedId) {
      throw new UnauthorizedException('Invalid two-factor authentication id');
    }

    const expiryThreshold = new Date(Date.now() - oneMinute * 15);

    const entriesWithMatchingCode = await this.em.find(
      TwoFactorAuth,
      {
        code,
        createdAt: {$gte: expiryThreshold},
      },
      {populate: ['user']},
    );

    let matching2FaEntry;
    try {
      matching2FaEntry = await Promise.any(
        entriesWithMatchingCode.map(async (entry) => {
          const isEntry = await this.cryptoService.compare(entry.id, twoFactorAuthHashedId);
          if (isEntry) return entry;
          throw new Error('no-match');
        }),
      );
    } catch {
      // Handle the case where Promise.any rejects (all promises rejected)
      matching2FaEntry = undefined;
    }

    if (!matching2FaEntry || !matching2FaEntry.user) {
      throw new UnauthorizedException('Invalid two-factor authentication code or id');
    }

    await this.em.removeAndFlush(matching2FaEntry);
    return matching2FaEntry.user;
  }

  async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.sign(
      {sub: user.id},
      {
        secret: this.configService.get<string>(ConfigKey.JWT_ACCESS_SECRET),
        expiresIn: '15m',
      },
    );
  }

  async generateRefreshToken(user: User): Promise<string> {
    return this.jwtService.sign(
      {sub: user.id},
      {
        secret: this.configService.get<string>(ConfigKey.JWT_REFRESH_SECRET),
        expiresIn: '7d',
      },
    );
  }

  async refreshTokens(refreshToken: string): Promise<{accessToken: string; refreshToken: string}> {
    const revokedToken = await this.em.findOne(RevokedRefreshToken, {token: refreshToken});

    if (revokedToken) {
      throw new ForbiddenException('Refresh token has been revoked');
    }

    try {
      const payload: {sub: string} = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>(ConfigKey.JWT_REFRESH_SECRET),
      });

      const user = await this.usersService.getUserById(payload.sub);

      const revokedRefreshToken = new RevokedRefreshToken({token: refreshToken});

      await this.em.persistAndFlush(revokedRefreshToken);

      return {
        accessToken: await this.generateAccessToken(user),
        refreshToken: await this.generateRefreshToken(user),
      };
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}
