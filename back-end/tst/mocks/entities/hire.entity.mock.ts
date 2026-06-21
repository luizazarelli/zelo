import { randomUUID } from 'node:crypto'
import { HireEntity, type HireStatus } from '@domain/entities/hire.entity'

export function mockHireEntity(overrides?: Partial<{
    id: string
    status: HireStatus
}>): HireEntity {
    const now = new Date()
    return HireEntity.restore({
        id: overrides?.id ?? randomUUID(),
        clientId: randomUUID(),
        workerId: randomUUID(),
        serviceTypeId: randomUUID(),
        description: 'Serviço de teste',
        status: overrides?.status ?? 'negotiating',
        createdAt: now,
        updatedAt: now,
    })
}
