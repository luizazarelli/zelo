import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Config } from 'src/common/env.config';

const connectionString = `postgresql://${Config.env.POSTGRES_USER}:${Config.env.POSTGRES_PASSWORD}@${Config.env.POSTGRES_HOST}:${Config.env.POSTGRES_PORT}/${Config.env.POSTGRES_DB}`;
const pool = new Pool({ connectionString, max: 10 });
export const db = drizzle(pool);
