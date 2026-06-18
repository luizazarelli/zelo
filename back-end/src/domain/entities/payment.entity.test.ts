import { describe, it, expect } from 'vitest'
import { PaymentEntity } from './payment.entity'

const makeProps = () => ({
    hireId: 'hire-uuid',
    amount: 250.0,
})

describe('PaymentEntity — testes de unidade', () => {
    it('deve criar um pagamento com status pending e paidAt nulo', () => {
        const payment = PaymentEntity.create(makeProps())

        expect(payment.props.status).toBe('pending')
        expect(payment.props.paidAt).toBeNull()
        expect(payment.props.amount).toBe(250.0)
        expect(payment.props.id).toBeDefined()
    })

    it('deve registrar pagamento com sucesso (pending → paid)', () => {
        const payment = PaymentEntity.create(makeProps())
        payment.pay()

        expect(payment.props.status).toBe('paid')
        expect(payment.props.paidAt).toBeInstanceOf(Date)
    })

    it('deve registrar falha no pagamento (pending → failed)', () => {
        const payment = PaymentEntity.create(makeProps())
        payment.fail()

        expect(payment.props.status).toBe('failed')
        expect(payment.props.paidAt).toBeNull()
    })

    it('deve restaurar um pagamento a partir de dados persistidos', () => {
        const now = new Date()
        const payment = PaymentEntity.restore({
            id: 'pay-123',
            hireId: 'hire-123',
            amount: 100,
            status: 'paid',
            createdAt: now,
            paidAt: now,
        })

        expect(payment.props.status).toBe('paid')
        expect(payment.props.paidAt).toBe(now)
    })
})
