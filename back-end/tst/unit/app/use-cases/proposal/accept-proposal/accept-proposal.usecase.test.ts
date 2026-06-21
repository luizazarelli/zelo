import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import { HireEntity } from '@domain/entities/hire.entity'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { AcceptProposalUsecase } from '@application/use-cases/proposal/accept-proposal/accept-proposal.usecase'

const clientId = randomUUID()
const workerId = randomUUID()

class InMemoryHireRepo implements IHireRepository {
    private data = new Map<string, HireEntity>()
    async create(h: HireEntity) { this.data.set(h.props.id, h) }
    async save(h: HireEntity) { this.data.set(h.props.id, h) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async listByClientId(cId: string) { return [...this.data.values()].filter(h => h.props.clientId === cId) }
    async listByWorkerId(wId: string) { return [...this.data.values()].filter(h => h.props.workerId === wId) }
}

class InMemoryProposalRepo implements IProposalRepository {
    private data: ProposalEntity[] = []
    async create(p: ProposalEntity) { this.data.push(p) }
    async listByHireId(hireId: string) { return this.data.filter(p => p.props.hireId === hireId) }
    async findLatestByHireId(hireId: string) {
        const list = this.data.filter(p => p.props.hireId === hireId)
        return list.sort((a, b) => b.props.round - a.props.round)[0] ?? null
    }
}

describe('AcceptProposalUsecase', () => {
    let hireRepo: InMemoryHireRepo
    let proposalRepo: InMemoryProposalRepo
    let usecase: AcceptProposalUsecase

    beforeEach(() => {
        hireRepo = new InMemoryHireRepo()
        proposalRepo = new InMemoryProposalRepo()
        usecase = new AcceptProposalUsecase(hireRepo, proposalRepo)
    })

    it('worker pode aceitar proposta do cliente e hire fica accepted', async () => {
        const hire = HireEntity.restore({
            id: randomUUID(), clientId, workerId,
            serviceTypeId: randomUUID(), description: 'Serviço',
            status: 'negotiating', createdAt: new Date(), updatedAt: new Date(),
        })
        await hireRepo.create(hire)
        await proposalRepo.create(ProposalEntity.create({ hireId: hire.props.id, authorId: clientId, amount: 150, round: 1 }))

        const result = await usecase.execute({ hireId: hire.props.id, acceptorId: workerId })

        expect(result.agreedAmount).toBe(150)
        const updated = await hireRepo.findById(hire.props.id)
        expect(updated?.props.status).toBe('accepted')
    })

    it('lança NotYourTurn se o autor da última proposta tenta aceitar a própria proposta', async () => {
        const hire = HireEntity.restore({
            id: randomUUID(), clientId, workerId,
            serviceTypeId: randomUUID(), description: 'Serviço',
            status: 'negotiating', createdAt: new Date(), updatedAt: new Date(),
        })
        await hireRepo.create(hire)
        await proposalRepo.create(ProposalEntity.create({ hireId: hire.props.id, authorId: clientId, amount: 150, round: 1 }))

        await expect(
            usecase.execute({ hireId: hire.props.id, acceptorId: clientId })
        ).rejects.toThrow('Não é sua vez de aceitar')
    })
})
