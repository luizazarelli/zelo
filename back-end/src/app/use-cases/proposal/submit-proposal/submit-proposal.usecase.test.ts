import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import { HireEntity } from '@domain/entities/hire.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import { SubmitProposalUsecase } from './submit-proposal.usecase'

const clientId = randomUUID()
const workerId = randomUUID()

function makeHire(status: 'negotiating' | 'accepted' | 'cancelled' = 'negotiating') {
    const h = HireEntity.restore({
        id: randomUUID(), clientId, workerId,
        serviceTypeId: randomUUID(), description: 'Serviço',
        status, createdAt: new Date(), updatedAt: new Date(),
    })
    return h
}

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

describe('SubmitProposalUsecase', () => {
    let hireRepo: InMemoryHireRepo
    let proposalRepo: InMemoryProposalRepo
    let usecase: SubmitProposalUsecase

    beforeEach(() => {
        hireRepo = new InMemoryHireRepo()
        proposalRepo = new InMemoryProposalRepo()
        usecase = new SubmitProposalUsecase(hireRepo, proposalRepo)
    })

    it('worker pode submeter contra-proposta depois que o cliente propôs', async () => {
        const hire = makeHire()
        await hireRepo.create(hire)
        const firstProposal = ProposalEntity.create({ hireId: hire.props.id, authorId: clientId, amount: 100, round: 1 })
        await proposalRepo.create(firstProposal)

        const result = await usecase.execute({ hireId: hire.props.id, authorId: workerId, amount: 120 })

        expect(result.round).toBe(2)
        expect(result.amount).toBe(120)
        expect(result.authorId).toBe(workerId)
    })

    it('lança NotYourTurn se o mesmo autor tenta propor duas vezes seguidas', async () => {
        const hire = makeHire()
        await hireRepo.create(hire)
        const firstProposal = ProposalEntity.create({ hireId: hire.props.id, authorId: workerId, amount: 100, round: 1 })
        await proposalRepo.create(firstProposal)

        await expect(
            usecase.execute({ hireId: hire.props.id, authorId: workerId, amount: 80 })
        ).rejects.toThrow('Não é sua vez de propor')
    })

    it('lança HireNotNegotiating se o hire não está em negociação', async () => {
        const hire = makeHire('accepted')
        await hireRepo.create(hire)

        await expect(
            usecase.execute({ hireId: hire.props.id, authorId: workerId, amount: 80 })
        ).rejects.toThrow('Contratação não está em negociação')
    })
})
