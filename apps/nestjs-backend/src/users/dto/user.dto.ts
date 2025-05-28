import {ApiProperty} from '@nestjs/swagger';
import {User} from '../entities/user.entity';
import {UserStatus} from '../types/user-status.enum';

export class UserDto {
  @ApiProperty({
    description: 'The unique identifier of the user.',
    example: 'd53a4f08-3ff9-4d88-b010-89f6b0e0c2da',
  })
  id: string;

  @ApiProperty({
    description: 'The date and time when the user was created.',
    example: '2025-05-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the user was last updated.',
    example: '2025-05-01T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'The email address of the user.',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The username of the user.',
    example: 'username123',
  })
  username: string;

  @ApiProperty({
    description: 'The current status of the user (e.g., active, inactive).',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  constructor(user: User) {
    this.id = user.id;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.email = user.email;
    this.username = user.username;
    this.status = user.status;
  }
}
