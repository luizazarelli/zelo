import { defineConfig } from 'drizzle-kit';

const url = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

export default defineConfig({
    out: './drizzle',
    schema: './src/infra/persistence/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url,
    },
});
