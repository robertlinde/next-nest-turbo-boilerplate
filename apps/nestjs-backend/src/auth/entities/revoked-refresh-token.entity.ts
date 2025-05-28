import {Entity, Property, types} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';

@Entity()
export class RevokedRefreshToken extends BaseEntity {
  @Property({type: types.string, nullable: false, unique: true})
  token: string;

  constructor({token}: {token: string}) {
    super();
    this.token = token;
  }
}
