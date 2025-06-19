import {Injectable, NotAcceptableException} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';

// eslint-disable-next-line @typescript-eslint/naming-convention
const ALLOWED_LANGUAGES = ['en', 'de'];

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmEmail(language: string, username: string, email: string, confirmationLink: string): Promise<void> {
    this.validateLanguage(language);

    let subject = '';
    if (language === 'de') {
      subject = 'Willkommen bei unserem Service';
    } else if (language === 'en') {
      subject = 'Welcome to Our Service';
    }

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: `confirm-user_${language}`,
      context: {
        username,
        confirmationLink,
      },
    });
  }

  async sendRequestPasswordResetEmail(
    language: string,
    email: string,
    username: string,
    passwordResetLink: string,
  ): Promise<void> {
    this.validateLanguage(language);

    let subject = '';
    if (language === 'de') {
      subject = 'Passwort zurücksetzen';
    } else if (language === 'en') {
      subject = 'Password Reset Request';
    }

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: `request-password-reset_${language}`,
      context: {
        username,
        passwordResetLink,
      },
    });
  }

  async sendTwoFactorAuthCodeEmail(language: string, email: string, code: string): Promise<void> {
    this.validateLanguage(language);

    let subject = '';
    if (language === 'de') {
      subject = 'Ihr 2FA Code';
    } else if (language === 'en') {
      subject = 'Your 2FA Code';
    }

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: `two-factor-auth-code_${language}`,
      context: {
        code,
      },
    });
  }

  private validateLanguage(language: string): void {
    if (!ALLOWED_LANGUAGES.includes(language)) {
      throw new NotAcceptableException(
        `Language ${language} is not supported. Allowed languages are: ${ALLOWED_LANGUAGES.join(', ')}`,
      );
    }
  }
}
