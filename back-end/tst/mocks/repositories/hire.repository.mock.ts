import type { IHireRepository } from '@domain/repositories/hire.repository'
import { vi } from 'vitest'
import { mockHireEntity } from '../entities/hire.entity.mock'

export function mockHireRepository(): IHireRepository {
    return {
        create: vi.fn().mockResolvedValue(undefined),
        save: vi.fn().mockResolvedValue(undefined),
        findById: vi.fn().mockResolvedValue(mockHireEntity()),
        listByClientId: vi.fn().mockResolvedValue([mockHireEntity()]),
        listByWorkerId: vi.fn().mockResolvedValue([mockHireEntity()]),
    }
}
