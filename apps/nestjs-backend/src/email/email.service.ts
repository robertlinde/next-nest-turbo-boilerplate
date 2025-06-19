import {Injectable} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';
import {AcceptedLanguages} from './types/accepted-languages.enum';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmEmail(
    language: AcceptedLanguages,
    username: string,
    email: string,
    confirmationLink: string,
  ): Promise<void> {
    let subject = '';
    switch (language) {
      case AcceptedLanguages.DE: {
        subject = 'Bitte bestätigen Sie Ihre E-Mail-Adresse';
        break;
      }

      case AcceptedLanguages.EN: {
        subject = 'Please confirm your email address';
        break;
      }
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
    language: AcceptedLanguages,
    email: string,
    username: string,
    passwordResetLink: string,
  ): Promise<void> {
    let subject = '';
    switch (language) {
      case AcceptedLanguages.DE: {
        subject = 'Passwort zurücksetzen';
        break;
      }

      case AcceptedLanguages.EN: {
        subject = 'Reset Your Password';
        break;
      }
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

  async sendTwoFactorAuthCodeEmail(language: AcceptedLanguages, email: string, code: string): Promise<void> {
    let subject = '';
    switch (language) {
      case AcceptedLanguages.DE: {
        subject = 'Ihr 2FA Code';
        break;
      }

      case AcceptedLanguages.EN: {
        subject = 'Your 2FA Code';
        break;
      }
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
}
