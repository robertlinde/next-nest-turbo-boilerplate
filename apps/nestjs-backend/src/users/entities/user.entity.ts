import {Cascade, Entity, Enum, OneToMany, Property, types, Unique} from '@mikro-orm/core';
import {TwoFactorAuth} from '../../auth/entities/two-factor-auth.entity';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {UserStatus} from '../types/user-status.enum';

@Entity()
export class User extends BaseEntity {
  @Property({type: types.string, nullable: false})
  @Unique()
  email: string;

  @Property({type: types.string, nullable: false})
  password: string;

  @Property({type: types.string, nullable: false})
  @Unique()
  username: string;

  @Property({type: types.string, nullable: false})
  confirmationCode: string;

  @Enum(() => UserStatus)
  status: UserStatus;

  @Property({type: types.string, nullable: true})
  passwordResetToken?: string | undefined;

  @Property({type: types.datetime, columnType: 'timestamp', nullable: true})
  passwordResetTokenCreatedAt?: Date | undefined;

  @OneToMany(() => TwoFactorAuth, (twoFactorAuth) => twoFactorAuth.user, {
    cascade: [Cascade.REMOVE],
    nullable: true,
  })
  twoFactorAuth?: TwoFactorAuth[];

  constructor({
    email,
    password,
    username,
    confirmationCode,
  }: {
    email: string;
    password: string;
    username: string;
    confirmationCode: string;
  }) {
    super();
    this.email = email;
    this.password = password;
    this.username = username;
    this.confirmationCode = confirmationCode;
    this.status = UserStatus.CONFIRMATION_PENDING;
  }
}
