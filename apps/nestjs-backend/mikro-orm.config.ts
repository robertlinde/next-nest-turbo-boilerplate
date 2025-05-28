import {Migrator} from '@mikro-orm/migrations';
import {defineConfig, PostgreSqlDriver} from '@mikro-orm/postgresql';
// eslint-disable-next-line import-x/no-unassigned-import
import 'dotenv/config';

const mikroOrmConfig = defineConfig({
  entities: ['dist/**/entities/*.entity.js'],
  entitiesTs: ['src/**/entities/*.entity.ts'], // for TypeScript src folder
  driver: PostgreSqlDriver,
  dbName: process.env.POSTGRES_DB_NAME,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  debug: process.env.POSTGRES_DEBUG_MODE === 'true',
  timezone: process.env.POSTGRES_TIMEZONE,
  extensions: [Migrator],
});
export default mikroOrmConfig;
