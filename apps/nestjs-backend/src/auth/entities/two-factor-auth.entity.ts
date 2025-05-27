import {Entity, ManyToOne, Property, types} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity.ts';
import {User} from '../../users/entities/user.entity.ts';

@Entity()
export class TwoFactorAuth extends BaseEntity {
  @ManyToOne(() => User)
  user: User;

  @Property({type: types.string, nullable: false})
  code: string;

  constructor({user, code}: {user: User; code: string}) {
    super();
    this.user = user;
    this.code = code;
  }
}
