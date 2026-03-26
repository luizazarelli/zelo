import { drizzle } from 'drizzle-orm/node-postgres';
import { Config } from 'src/common/env.config';

export const db = drizzle(
    `postgresql://${Config.env.POSTGRES_USER}:${Config.env.POSTGRES_PASSWORD}@localhost:5432/${Config.env.POSTGRES_DB}`
);
