import { randomUUID } from 'node:crypto'
import { HireEntity } from '@domain/entities/hire.entity'

export function mockHireEntity(overrides?: Partial<{
    id: string
    status: 'pending' | 'accepted' | 'completed' | 'cancelled'
}>): HireEntity {
    const now = new Date()
    return HireEntity.restore({
        id: overrides?.id ?? randomUUID(),
        clientId: randomUUID(),
        workerId: randomUUID(),
        serviceTypeId: randomUUID(),
        description: 'Serviço de teste',
        status: overrides?.status ?? 'pending',
        createdAt: now,
        updatedAt: now,
    })
}
