import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsStrongPassword, MaxLength} from 'class-validator';

export class ResetPasswordConfirmBodyDto {
  @IsString()
  @ApiProperty({
    description: 'The reset token sent to the user for confirming the password reset.',
    example: 'resetToken123',
  })
  token!: string;

  @IsStrongPassword()
  @MaxLength(128)
  @ApiProperty({
    description: 'The new password the user wants to set.',
    example: 'NewP@ssw0rd!',
  })
  password!: string;
}

export type ResetPasswordConfirmBody = ResetPasswordConfirmBodyDto;
