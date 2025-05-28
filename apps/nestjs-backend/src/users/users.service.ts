import {Buffer} from 'node:buffer';
import {EntityManager} from '@mikro-orm/postgresql';
import {GoneException, Injectable, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Cron} from '@nestjs/schedule';
import {v4 as uuidv4} from 'uuid';
import {ConfigKey} from '../config/config-key.enum';
import {CryptoService} from '../crypto/crypto.service';
import {EmailService} from '../email/email.service';
import {oneDay, oneHour} from '../utils/time.util';
import {User} from './entities/user.entity';
import {UserStatus} from './types/user-status.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly em: EntityManager,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 * * * *') // every hour, on the hour
  async removeExpiredPendingUsers(): Promise<void> {
    const threshold = new Date(Date.now() - oneDay);

    const {affectedRows} = await this.em
      .createQueryBuilder(User)
      .delete()
      .where({
        status: UserStatus.CONFIRMATION_PENDING,
        createdAt: {$lt: threshold},
      })
      .execute();

    if (affectedRows > 0) {
      console.log(`Removed ${affectedRows} expired pending users`);
    }
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.em.findOne(User, {id: userId});
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.em.findOne(User, {email});
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.em.findOne(User, {username});
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async createUser(email: string, password: string, username: string): Promise<User> {
    // Base64url encode the confirmation code -> this will prevent problems with special characters in the URL, e.g. + and /
    const confirmationCode = Buffer.from(await this.cryptoService.hash(uuidv4())).toString('base64url');
    const hashedPassword = await this.cryptoService.hash(password);

    const userEntity = new User({
      email,
      password: hashedPassword,
      username,
      confirmationCode,
    });

    const confirmationLink = `${this.configService.get<string>(ConfigKey.FRONTEND_HOST)}/confirm?token=${userEntity.confirmationCode}`;
    await this.emailService.sendConfirmEmail(username, email, confirmationLink);

    await this.em.persistAndFlush(userEntity);

    return userEntity;
  }

  async confirmUser(confirmationCode: string): Promise<User> {
    const user = await this.em.findOne(User, {confirmationCode});

    // if the user is not found, throw an error
    if (!user) {
      throw new NotFoundException(`User with confirmation code ${confirmationCode} not found`);
    }

    if (user.status === UserStatus.ACTIVE) {
      return user;
    }

    // if the confirmation code is older than 24 hours, delete the user and throw an error
    if (new Date(user.createdAt).getTime() + oneDay < Date.now()) {
      await this.em.removeAndFlush(user);
      throw new GoneException(`Confirmation code ${confirmationCode} expired`);
    }

    user.status = UserStatus.ACTIVE;
    await this.em.persistAndFlush(user);
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);

    await this.em.removeAndFlush(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    let user: User | undefined;

    try {
      user = await this.getUserByEmail(email);
    } catch {
      return; // don't leak user existence
    }

    const resetToken = Buffer.from(await this.cryptoService.hash(uuidv4())).toString('base64url');
    user.passwordResetToken = resetToken;
    user.passwordResetTokenCreatedAt = new Date(Date.now());

    const resetLink = `${this.configService.get<string>(ConfigKey.FRONTEND_HOST)}/reset-password?token=${resetToken}`;
    await this.emailService.sendRequestPasswordResetEmail(email, user.username, resetLink);

    await this.em.persistAndFlush(user);
  }

  async confirmPasswordReset(resetToken: string, newPassword: string): Promise<void> {
    const user = await this.em.findOne(User, {passwordResetToken: resetToken});

    // if the user is not found, throw an error
    if (!user) {
      throw new NotFoundException(`User with reset token ${resetToken} not found`);
    }

    // if the reset token is older than 1 hour, delete the user and throw an error
    if (
      user.passwordResetTokenCreatedAt &&
      new Date(user.passwordResetTokenCreatedAt).getTime() + 2 * oneHour < Date.now()
    ) {
      throw new GoneException(`Reset token ${resetToken} expired`);
    }

    // reset tokens
    user.passwordResetToken = undefined;
    user.passwordResetTokenCreatedAt = undefined;

    user.password = await this.cryptoService.hash(newPassword);
    await this.em.persistAndFlush(user);
  }

  async updateUser(userId: string, email?: string, username?: string, password?: string): Promise<User> {
    const user = await this.getUserById(userId);

    if (email) {
      user.email = email;
    }

    if (username) {
      user.username = username;
    }

    if (password) {
      user.password = await this.cryptoService.hash(password);
    }

    await this.em.persistAndFlush(user);
    return user;
  }
}
