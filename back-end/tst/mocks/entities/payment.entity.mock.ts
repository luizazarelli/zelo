import { randomUUID } from 'node:crypto'
import { PaymentEntity } from '@domain/entities/payment.entity'

export function mockPaymentEntity(hireId?: string): PaymentEntity {
    return PaymentEntity.restore({
        id: randomUUID(),
        hireId: hireId ?? randomUUID(),
        amount: 200,
        status: 'paid',
        createdAt: new Date(),
        paidAt: new Date(),
    })
}
