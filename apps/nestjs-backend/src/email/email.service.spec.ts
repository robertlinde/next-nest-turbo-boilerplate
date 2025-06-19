import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {MailerService} from '@nestjs-modules/mailer';
import {mock, MockProxy} from 'jest-mock-extended';
import {EmailService} from './email.service';
import {AcceptedLanguages} from './types/accepted-languages.enum';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MockProxy<MailerService>;
  let configService: MockProxy<ConfigService>;

  beforeEach(async (): Promise<void> => {
    mailerService = mock<MailerService>();
    configService = mock<ConfigService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {provide: MailerService, useValue: mailerService},
        {provide: ConfigService, useValue: configService},
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendConfirmEmail', () => {
    it('should call mailerService.sendMail with English subject and template', async (): Promise<void> => {
      const email = 'test@example.com';
      const confirmationLink = 'http://example.com/confirm';
      const username = 'testuser';

      await service.sendConfirmEmail(AcceptedLanguages.EN, username, email, confirmationLink);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Please confirm your email address',
        template: `confirm-user_${AcceptedLanguages.EN}`,
        context: {username, confirmationLink},
      });
    });

    it('should call mailerService.sendMail with German subject and template', async (): Promise<void> => {
      const email = 'test@example.com';
      const confirmationLink = 'http://example.com/confirm';
      const username = 'testuser';

      await service.sendConfirmEmail(AcceptedLanguages.DE, username, email, confirmationLink);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
        template: `confirm-user_${AcceptedLanguages.DE}`,
        context: {username, confirmationLink},
      });
    });
  });

  describe('sendRequestPasswordResetEmail', () => {
    it('should call mailerService.sendMail with English subject and template', async (): Promise<void> => {
      const email = 'test@example.com';
      const username = 'testuser';
      const passwordResetLink = 'http://example.com/reset';

      await service.sendRequestPasswordResetEmail(AcceptedLanguages.EN, email, username, passwordResetLink);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Reset Your Password',
        template: `request-password-reset_${AcceptedLanguages.EN}`,
        context: {
          username,
          passwordResetLink,
        },
      });
    });

    it('should call mailerService.sendMail with German subject and template', async (): Promise<void> => {
      const email = 'test@example.com';
      const username = 'testuser';
      const passwordResetLink = 'http://example.com/reset';

      await service.sendRequestPasswordResetEmail(AcceptedLanguages.DE, email, username, passwordResetLink);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Passwort zurücksetzen',
        template: `request-password-reset_${AcceptedLanguages.DE}`,
        context: {
          username,
          passwordResetLink,
        },
      });
    });
  });

  describe('sendTwoFactorAuthCodeEmail', () => {
    it('should call mailerService.sendMail with English subject and template', async (): Promise<void> => {
      const email = 'test@example.com';
      const code = '123456';

      await service.sendTwoFactorAuthCodeEmail(AcceptedLanguages.EN, email, code);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Your 2FA Code',
        template: `two-factor-auth-code_${AcceptedLanguages.EN}`,
        context: {code},
      });
    });

    it('should call mailerService.sendMail with German subject and template', async (): Promise<void> => {
      const email = 'test@example.com';
      const code = '123456';

      await service.sendTwoFactorAuthCodeEmail(AcceptedLanguages.DE, email, code);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Ihr 2FA Code',
        template: `two-factor-auth-code_${AcceptedLanguages.DE}`,
        context: {code},
      });
    });
  });
});
