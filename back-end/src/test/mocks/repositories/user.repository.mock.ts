import { IUserRepository } from '@domain/repositories/user.repository';
import { vi } from 'vitest';
import { mockUserEntity } from '../entities/user.entity.mock';

export function mockUserRepository(): IUserRepository {
    return {
        create: vi.fn().mockResolvedValue(mockUserEntity()),
        findByEmail: vi.fn().mockResolvedValue(mockUserEntity()),
        findById: vi.fn().mockResolvedValue(mockUserEntity()),
        update: vi.fn().mockResolvedValue(null),
    };
}
