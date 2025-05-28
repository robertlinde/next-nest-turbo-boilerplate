import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {CryptoModule} from 'src/crypto/crypto.module';
import {EmailModule} from 'src/email/email.module';
import {UsersModule} from 'src/users/users.module';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {JwtStrategy} from './jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [UsersModule, JwtModule, CryptoModule, ConfigModule, PassportModule, EmailModule, JwtModule.register({})],
})
export class AuthModule {}
