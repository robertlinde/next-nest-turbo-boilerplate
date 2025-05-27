import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {CryptoModule} from 'src/crypto/crypto.module.ts';
import {EmailModule} from 'src/email/email.module.ts';
import {UsersModule} from 'src/users/users.module.ts';
import {AuthController} from './auth.controller.ts';
import {AuthService} from './auth.service.ts';
import {JwtStrategy} from './jwt.strategy.ts';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [UsersModule, JwtModule, CryptoModule, ConfigModule, PassportModule, EmailModule, JwtModule.register({})],
})
export class AuthModule {}
