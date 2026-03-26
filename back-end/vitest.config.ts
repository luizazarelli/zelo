import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: [
            {
                plugins: [tsconfigPaths()],
                test: {
                    name: 'unit',
                    include: ['./src/app/**/*.test.ts'],
                    setupFiles: ['./vitest.setup.ts'],
                },
            },
        ],
    },
});
