/* eslint-disable unicorn/no-thenable */

import * as Joi from 'joi';
import {ConfigKey} from './config-key.enum';

const validationSchemaMap: Record<ConfigKey, Joi.Schema> = {
  [ConfigKey.NODE_ENV]: Joi.string().valid('development', 'staging', 'production').required(),
  [ConfigKey.FRONTEND_HOST]: Joi.string().default('localhost'),
  [ConfigKey.PORT]: Joi.number().min(0).max(65_535).default(4000),
  [ConfigKey.ENABLE_SWAGGER]: Joi.boolean().optional().default(true),

  [ConfigKey.POSTGRES_TIMEZONE]: Joi.string().default('UTC'),
  [ConfigKey.POSTGRES_DB_NAME]: Joi.string().required(),
  [ConfigKey.POSTGRES_PASSWORD]: Joi.string().required(),
  [ConfigKey.POSTGRES_PORT]: Joi.number().min(0).max(65_535).default(5432),
  [ConfigKey.POSTGRES_USER]: Joi.string().required(),
  [ConfigKey.POSTGRES_HOST]: Joi.string().required(),
  [ConfigKey.POSTGRES_DEBUG_MODE]: Joi.boolean().optional().default(false),

  [ConfigKey.JWT_ACCESS_SECRET]: Joi.string().required(),
  [ConfigKey.JWT_REFRESH_SECRET]: Joi.string().required(),

  [ConfigKey.MAILDEV_WEB_PORT]: Joi.number().min(0).max(65_535).default(1080).when(ConfigKey.NODE_ENV, {
    is: 'development',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  [ConfigKey.MAIL_HOST]: Joi.string().required(),

  [ConfigKey.MAIL_PORT]: Joi.number().min(0).max(65_535).default(587).required(),

  [ConfigKey.MAIL_USER]: Joi.string().optional(),

  [ConfigKey.MAIL_PASS]: Joi.string().optional(),
};

export default Joi.object(validationSchemaMap);
