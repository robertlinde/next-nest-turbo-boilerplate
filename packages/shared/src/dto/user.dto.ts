import {type UserStatus} from '../types/user-status.enum';

export class UserDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  username: string;
  status: UserStatus;

  constructor({
    id,
    createdAt,
    updatedAt,
    email,
    username,
    status,
  }: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    username: string;
    status: UserStatus;
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.email = email;
    this.username = username;
    this.status = status;
  }
}
