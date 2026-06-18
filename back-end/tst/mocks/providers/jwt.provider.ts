import { IJwtProvider } from '@domain/providers/jwt.provider';
import { vi } from 'vitest';

export function mockJwtProvider<
    Payload extends object,
>(): IJwtProvider<Payload> {
    return {
        sign: vi.fn(),
        verify: vi.fn(),
    };
}
