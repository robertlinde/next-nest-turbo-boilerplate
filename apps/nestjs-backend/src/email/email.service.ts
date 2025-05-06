import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {MailerService} from '@nestjs-modules/mailer';

import {ConfigKey} from '../config/config-key.enum';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendConfirmEmail(email: string, confirmationLink: string): Promise<void> {
    if (this.configService.get<string>(ConfigKey.NODE_ENV) === 'development') {
      console.log(`Sending welcome email to ${email} with confirmation link: ${confirmationLink}`);
      return;
    }

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our Service',
      template: 'confirm-user',
      context: {
        confirmationLink,
      },
    });
  }

  async sendRequestPasswordResetEmail(email: string, username: string, passwordResetLink: string): Promise<void> {
    if (this.configService.get<string>(ConfigKey.NODE_ENV) === 'development') {
      console.log(`Sending password reset email to ${email} for user ${username} with link: ${passwordResetLink}`);
      return;
    }

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: 'request-password-reset',
      context: {
        username,
        passwordResetLink,
      },
    });
  }

  async sendTwoFactorAuthCodeEmail(email: string, code: string): Promise<void> {
    if (this.configService.get<string>(ConfigKey.NODE_ENV) === 'development') {
      console.log(`Sending 2FA code email to ${email} with code: ${code}`);
      return;
    }

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your 2FA Code',
      template: 'two-factor-auth-code',
      context: {
        code,
      },
    });
  }
}
