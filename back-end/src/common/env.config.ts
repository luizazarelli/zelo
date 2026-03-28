import z from 'zod';

const envSchema = z.object({
    NODE_ENV: z
        .enum(['production', 'development', 'test'])
        .default('development'),
    HTTP_PORT: z.coerce.number().default(8000),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_DB: z.string(),
    POSTGRES_HOST: z.string().default('localhost'),
    POSTGRES_PORT: z.coerce.number().positive().default(5432),
    MAX_SESSIONS: z.int().default(3),
    JWT_SECRET: z.string(),
    FRONTEND_DOMAIN: z.string(),
});

class EnvConfig {
    private parsedEnv: z.infer<typeof envSchema>;

    constructor() {
        const parsed = envSchema.safeParse(process.env);
        if (!parsed.success) {
            console.error('❌ Variáveis de ambiente inválidas:');
            console.error(JSON.stringify(z.treeifyError(parsed.error)));
            process.exit(1);
        }

        this.parsedEnv = parsed.data;
    }

    get env(): z.infer<typeof envSchema> {
        return this.parsedEnv;
    }
}

export const Config = new EnvConfig();
