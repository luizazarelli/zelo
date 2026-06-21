import { describe, it, expect } from 'vitest'
import { HireEntity } from '@domain/entities/hire.entity'

const makeProps = () => ({
    clientId: 'client-uuid',
    workerId: 'worker-uuid',
    serviceTypeId: 'service-uuid',
    description: 'Serviço de elétrica',
})

describe('HireEntity — testes de unidade', () => {
    it('deve criar uma contratação com status negotiating', () => {
        const hire = HireEntity.create(makeProps())
        expect(hire.props.status).toBe('negotiating')
        expect(hire.props.id).toBeDefined()
        expect(hire.props.clientId).toBe('client-uuid')
        expect(hire.props.createdAt).toBeInstanceOf(Date)
    })

    it('deve aceitar uma contratação (negotiating → accepted)', () => {
        const hire = HireEntity.create(makeProps())
        hire.accept()
        expect(hire.props.status).toBe('accepted')
    })

    it('deve concluir uma contratação (accepted → completed)', () => {
        const hire = HireEntity.create(makeProps())
        hire.accept()
        hire.complete()
        expect(hire.props.status).toBe('completed')
    })

    it('deve cancelar uma contratação', () => {
        const hire = HireEntity.create(makeProps())
        hire.cancel()
        expect(hire.props.status).toBe('cancelled')
    })

    it('deve restaurar uma contratação a partir de dados persistidos', () => {
        const now = new Date()
        const hire = HireEntity.restore({
            id: 'hire-123',
            clientId: 'c1',
            workerId: 'w1',
            serviceTypeId: 's1',
            description: 'Pintura',
            status: 'accepted',
            createdAt: now,
            updatedAt: now,
        })
        expect(hire.props.id).toBe('hire-123')
        expect(hire.props.status).toBe('accepted')
    })
})
