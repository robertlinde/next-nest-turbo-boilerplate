import {Injectable} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmEmail(username: string, email: string, confirmationLink: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Our Service',
      template: 'confirm-user',
      context: {
        username,
        confirmationLink,
      },
    });
  }

  async sendRequestPasswordResetEmail(email: string, username: string, passwordResetLink: string): Promise<void> {
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
