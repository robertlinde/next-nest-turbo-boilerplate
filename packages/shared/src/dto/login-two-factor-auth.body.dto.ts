import {ApiProperty} from '@nestjs/swagger';
import {IsString, Length} from 'class-validator';

export class LoginTwoFactorAuthBodyDto {
  @IsString()
  @Length(6, 6)
  @ApiProperty({
    description: 'The 6-digit two-factor authentication code.',
    example: '123456',
  })
  code!: string;
}

export type LoginTwoFactorAuthBody = LoginTwoFactorAuthBodyDto;
