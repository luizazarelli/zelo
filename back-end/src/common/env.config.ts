import z from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["production", "development", "test"]).default("development"),
    HTTP_PORT: z.coerce.number().default(8000), 
})

class EnvConfig {
    private parsedEnv: any;

    constructor() {
        const parsed = envSchema.safeParse(process.env);
        if (!parsed.success) {
            console.error('❌ Variáveis de ambiente inválidas:')
            console.error(JSON.stringify(z.treeifyError(parsed.error)))
            process.exit(1)
        }

        this.parsedEnv = parsed.data;
    }

    get env(): z.infer<typeof envSchema> {
        return this.parsedEnv;
    }
}

export const Config = new EnvConfig()