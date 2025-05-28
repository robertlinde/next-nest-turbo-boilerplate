import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {CryptoModule} from 'src/crypto/crypto.module';
import {EmailModule} from 'src/email/email.module';
import {UsersController} from './users.controller';
import {UsersService} from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [CryptoModule, EmailModule, ConfigModule],
})
export class UsersModule {}
