import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength, MinLength} from 'class-validator';

export class UpdateUserBodyDto {
  @IsEmail()
  @MaxLength(100)
  @IsOptional()
  @ApiProperty({
    description: 'The new email address for the user (optional).',
    example: 'newemail@example.com',
    required: false,
  })
  email?: string;

  @IsString()
  @IsStrongPassword()
  @MaxLength(128)
  @IsOptional()
  @ApiProperty({
    description: 'The new password for the user (optional).',
    example: 'NewP@ssw0rd!',
    required: false,
  })
  password?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsOptional()
  @ApiProperty({
    description: 'The new username for the user (optional).',
    example: 'newusername123',
    required: false,
  })
  username?: string;
}

export type UpdateUserBody = UpdateUserBodyDto;
