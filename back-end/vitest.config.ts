import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const testEnv = {
    NODE_ENV: 'test',
    POSTGRES_PASSWORD: 'test',
    POSTGRES_USER: 'test',
    POSTGRES_DB: 'test',
    POSTGRES_HOST: 'localhost',
    JWT_SECRET: 'test-secret-key',
    FRONTEND_DOMAIN: 'http://localhost:5173',
};

export default defineConfig({
    test: {
        projects: [
            {
                plugins: [tsconfigPaths()],
                test: {
                    name: 'unit',
                    include: [
                        './tst/unit/**/*.test.ts',
                    ],
                    setupFiles: ['./vitest.setup.ts'],
                    env: testEnv,
                },
            },
            {
                plugins: [tsconfigPaths()],
                test: {
                    name: 'integration',
                    include: ['./tst/integration/**/*.integration.test.ts'],
                    setupFiles: ['./vitest.setup.ts'],
                    env: testEnv,
                },
            },
        ],
    },
});
