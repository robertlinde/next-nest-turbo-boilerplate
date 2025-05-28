import {ApiProperty} from '@nestjs/swagger';
import {User} from '../entities/user.entity';

export class MeDto {
  @ApiProperty({
    description: 'The unique identifier of the user.',
    example: 'd53a4f08-3ff9-4d88-b010-89f6b0e0c2da',
  })
  id: string;

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

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
  }
}
