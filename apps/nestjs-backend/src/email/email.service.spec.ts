import {ConfigService} from '@nestjs/config';
import {Test, TestingModule} from '@nestjs/testing';
import {MailerService} from '@nestjs-modules/mailer';
import {mock, MockProxy} from 'jest-mock-extended';

import {ConfigKey} from '../config/config-key.enum';

import {EmailService} from './email.service';

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
    it('should call mailerService.sendMail when in production environment', async (): Promise<void> => {
      configService.get.mockImplementation((key: ConfigKey) => {
        if (key === ConfigKey.NODE_ENV) return 'production';
        return null;
      });

      const email = 'test@example.com';
      const confirmationLink = 'http://example.com/confirm';

      await service.sendConfirmEmail(email, confirmationLink);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Welcome to Our Service',
        template: 'confirm-user',
        context: {confirmationLink},
      });
    });

    it('should log a message when in development environment', async (): Promise<void> => {
      // Change the environment to simulate development
      configService.get.mockImplementation((key: ConfigKey) => {
        if (key === ConfigKey.NODE_ENV) return 'development';
        return null;
      });

      const email = 'test@example.com';
      const confirmationLink = 'http://example.com/confirm';

      const consoleSpy = jest.spyOn(console, 'log');
      await service.sendConfirmEmail(email, confirmationLink);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Sending welcome email to ${email} with confirmation link: ${confirmationLink}`,
      );
    });
  });

  describe('sendRequestPasswordResetEmail', () => {
    it('should call mailerService.sendMail when in production environment', async (): Promise<void> => {
      configService.get.mockImplementation((key: ConfigKey) => {
        if (key === ConfigKey.NODE_ENV) return 'production';
        return null;
      });

      const email = 'test@example.com';
      const username = 'testuser';
      const passwordResetLink = 'http://example.com/reset';

      await service.sendRequestPasswordResetEmail(email, username, passwordResetLink);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Password Reset Request',
        template: 'request-password-reset',
        context: {
          username,
          passwordResetLink,
        },
      });
    });

    it('should log a message when in development environment', async (): Promise<void> => {
      // Change the environment to simulate development
      configService.get.mockImplementation((key: ConfigKey) => {
        if (key === ConfigKey.NODE_ENV) return 'development';
        return null;
      });

      const email = 'test@example.com';
      const username = 'testuser';
      const passwordResetLink = 'http://example.com/reset';

      const consoleSpy = jest.spyOn(console, 'log');
      await service.sendRequestPasswordResetEmail(email, username, passwordResetLink);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Sending password reset email to ${email} for user ${username} with link: ${passwordResetLink}`,
      );
    });
  });

  describe('sendTwoFactorAuthCodeEmail', () => {
    it('should call mailerService.sendMail when in production environment', async (): Promise<void> => {
      configService.get.mockImplementation((key: ConfigKey) => {
        if (key === ConfigKey.NODE_ENV) return 'production';
        return null;
      });

      const email = 'test@example.com';
      const code = '123456';

      await service.sendTwoFactorAuthCodeEmail(email, code);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Your 2FA Code',
        template: 'two-factor-auth-code',
        context: {code},
      });
    });

    it('should log a message when in development environment', async (): Promise<void> => {
      // Change the environment to simulate development
      configService.get.mockImplementation((key: ConfigKey) => {
        if (key === ConfigKey.NODE_ENV) return 'development';
        return null;
      });

      const email = 'test@example.com';
      const code = '123456';

      const consoleSpy = jest.spyOn(console, 'log');
      await service.sendTwoFactorAuthCodeEmail(email, code);

      expect(consoleSpy).toHaveBeenCalledWith(`Sending 2FA code email to ${email} with code: ${code}`);
    });
  });
});
