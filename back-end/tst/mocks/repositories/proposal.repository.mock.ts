import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { vi } from 'vitest'

export function mockProposalRepository(): IProposalRepository {
    return {
        create: vi.fn().mockResolvedValue(undefined),
        listByHireId: vi.fn().mockResolvedValue([]),
        findLatestByHireId: vi.fn().mockResolvedValue(null),
    }
}
