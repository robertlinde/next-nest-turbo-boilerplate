import {PrimaryKey, Property, types} from '@mikro-orm/core';
import {v4 as uuidv4} from 'uuid';

export abstract class BaseEntity {
  @PrimaryKey({type: types.uuid})
  id = uuidv4();

  @Property({onCreate: () => new Date(), type: types.datetime, columnType: 'timestamp'})
  createdAt = new Date();

  @Property({onUpdate: () => new Date(), type: types.datetime, columnType: 'timestamp'})
  updatedAt = new Date();
}
