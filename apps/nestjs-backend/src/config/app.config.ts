import {ConfigKey} from './config-key.enum';

const appConfig = (): Record<ConfigKey, unknown> => ({
  [ConfigKey.NODE_ENV]: process.env.NODE_ENV,
  [ConfigKey.FRONTEND_HOST]: process.env.HOST,
  [ConfigKey.PORT]: process.env.PORT,
  [ConfigKey.ENABLE_SWAGGER]: Boolean(process.env.ENABLE_SWAGGER === 'true'),

  [ConfigKey.POSTGRES_TIMEZONE]: process.env.POSTGRES_TIMEZONE,
  [ConfigKey.POSTGRES_DB_NAME]: process.env.POSTGRES_DB_NAME,
  [ConfigKey.POSTGRES_PASSWORD]: process.env.POSTGRES_PASSWORD,
  [ConfigKey.POSTGRES_PORT]: Number(process.env.POSTGRES_PORT),
  [ConfigKey.POSTGRES_HOST]: process.env.POSTGRES_HOST,
  [ConfigKey.POSTGRES_USER]: process.env.POSTGRES_USER,
  [ConfigKey.POSTGRES_DEBUG_MODE]: Boolean(process.env.POSTGRES_DEBUG_MODE === 'true'),

  [ConfigKey.JWT_ACCESS_SECRET]: process.env.JWT_ACCESS_SECRET,
  [ConfigKey.JWT_REFRESH_SECRET]: process.env.JWT_REFRESH_SECRET,

  [ConfigKey.MAILDEV_WEB_PORT]: Number(process.env.MAILDEV_WEB_PORT),
  [ConfigKey.MAIL_HOST]: process.env.MAIL_HOST,
  [ConfigKey.MAIL_PORT]: Number(process.env.MAIL_PORT),
  [ConfigKey.MAIL_USER]: process.env.MAIL_USER,
  [ConfigKey.MAIL_PASS]: process.env.MAIL_PASS,
});

export default appConfig;
