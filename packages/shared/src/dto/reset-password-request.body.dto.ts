import {ApiProperty} from '@nestjs/swagger';
import {IsEmail} from 'class-validator';

export class ResetPasswordRequestBodyDto {
  @IsEmail()
  @ApiProperty({
    description: 'The email address of the user requesting the password reset.',
    example: 'user@example.com',
  })
  email!: string;
}

export type ResetPasswordRequestBody = ResetPasswordRequestBodyDto;
