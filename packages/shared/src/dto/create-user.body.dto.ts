import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsString, IsStrongPassword, MaxLength, MinLength} from 'class-validator';

export class CreateUserBodyDto {
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({
    description: 'The email address of the user.',
    example: 'user@example.com',
  })
  email!: string;

  @IsString()
  @IsStrongPassword()
  @MaxLength(128)
  @ApiProperty({
    description: 'The password for the user account.',
    example: 'Str0ngP@ssw0rd!',
  })
  password!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty({
    description: 'The username of the user.',
    example: 'username123',
  })
  username!: string;
}

export type CreateUserBody = CreateUserBodyDto;
