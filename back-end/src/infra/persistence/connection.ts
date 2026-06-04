import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Config } from 'src/common/env.config';
import { relations } from './schema';

const connectionString = `postgresql://${Config.env.POSTGRES_USER}:${Config.env.POSTGRES_PASSWORD}@${Config.env.POSTGRES_HOST}:${Config.env.POSTGRES_PORT}/${Config.env.POSTGRES_DB}`;
const pool = new Pool({ connectionString, max: 10 });

export const db = drizzle({client: pool, relations});
export type DbInstance = typeof db;
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]