import { describe, it, expect } from 'vitest'
import { ProposalEntity } from '@domain/entities/proposal.entity'

const makeProps = () => ({
    hireId: 'hire-uuid',
    authorId: 'author-uuid',
    amount: 150.00,
    round: 1,
})

describe('ProposalEntity — testes de unidade', () => {
    it('deve criar uma proposta com id e createdAt gerados', () => {
        const p = ProposalEntity.create(makeProps())
        expect(p.props.id).toBeDefined()
        expect(p.props.createdAt).toBeInstanceOf(Date)
        expect(p.props.amount).toBe(150.00)
        expect(p.props.round).toBe(1)
    })

    it('deve restaurar uma proposta a partir de dados persistidos', () => {
        const now = new Date()
        const p = ProposalEntity.restore({ id: 'p-1', hireId: 'h-1', authorId: 'a-1', amount: 200, round: 2, createdAt: now })
        expect(p.props.id).toBe('p-1')
        expect(p.props.round).toBe(2)
    })
})
