import { IRefreshTokenRepository } from '@domain/repositories/refreshToken.repository';
import { vi } from 'vitest';
import { mockRefreshTokenEntity } from '../entities/refreshToken.entity.mock';

export function mockRefreshTokenRepository(): IRefreshTokenRepository {
    return {
        create: vi.fn().mockResolvedValue(mockRefreshTokenEntity),
        getByUserId: vi.fn().mockResolvedValue(mockRefreshTokenEntity),
        revokeAllUserTokens: vi.fn(),
        save: vi.fn(),
    };
}
