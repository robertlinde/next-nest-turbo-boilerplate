import {Injectable} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  // Add email methods here as needed
  // Example:
  // async sendWelcomeEmail(language: AcceptedLanguages, email: string, name: string): Promise<void> {
  //   // Implementation here
  // }
}
