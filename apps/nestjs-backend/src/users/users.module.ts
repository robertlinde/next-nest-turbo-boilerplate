import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {CryptoModule} from 'src/crypto/crypto.module.ts';
import {EmailModule} from 'src/email/email.module.ts';
import {UsersController} from './users.controller.ts';
import {UsersService} from './users.service.ts';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [CryptoModule, EmailModule, ConfigModule],
})
export class UsersModule {}
