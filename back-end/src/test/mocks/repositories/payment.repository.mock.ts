import type { IPaymentRepository } from '@domain/repositories/payment.repository'
import { vi } from 'vitest'
import { mockPaymentEntity } from '../entities/payment.entity.mock'

export function mockPaymentRepository(): IPaymentRepository {
    return {
        create: vi.fn().mockResolvedValue(undefined),
        save: vi.fn().mockResolvedValue(undefined),
        findById: vi.fn().mockResolvedValue(mockPaymentEntity()),
        findByHireId: vi.fn().mockResolvedValue(null),
    }
}
