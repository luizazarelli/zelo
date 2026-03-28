import { IHashProvider } from '@domain/providers/hash.provider';
import { vi } from 'vitest';

export function mockHashProvider(): IHashProvider {
    return {
        compare: vi.fn(),
        hash: vi.fn(),
    };
}
