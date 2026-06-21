import type { HireEntity } from '@domain/entities/hire.entity'
import { PaymentEntity } from '@domain/entities/payment.entity'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IPaymentRepository } from '@domain/repositories/payment.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { IWorkerRepository } from '@domain/repositories/worker.repository'
import UserEntity from '@domain/entities/user.entity'
import { WorkerEntity } from '@domain/entities/worker.entity'
import { CreateHireUsecase } from '@application/use-cases/hire/create-hire/create-hire.usecase'
import { SubmitProposalUsecase } from '@application/use-cases/proposal/submit-proposal/submit-proposal.usecase'
import { AcceptProposalUsecase } from '@application/use-cases/proposal/accept-proposal/accept-proposal.usecase'
import { ProcessPaymentUsecase } from '@application/use-cases/payment/process-payment/process-payment.usecase'
import { describe, beforeEach, it, expect } from 'vitest'
import { randomUUID } from 'node:crypto'

class InMemoryUserRepository implements IUserRepository {
    private data = new Map<string, UserEntity>()
    async create(user: UserEntity) { this.data.set(user.props.id, user) }
    async update(user: UserEntity) { this.data.set(user.props.id, user) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async findByEmail(email: string) {
        return [...this.data.values()].find(u => u.props.email === email) ?? null
    }
    async searchByIds(ids: string[]) {
        return ids.flatMap(id => { const u = this.data.get(id); return u ? [u] : [] })
    }
}

class InMemoryWorkerRepository implements IWorkerRepository {
    private data = new Map<string, WorkerEntity>()
    async create(worker: WorkerEntity) { this.data.set(worker.props.userId, worker) }
    async save(worker: WorkerEntity) { this.data.set(worker.props.userId, worker) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async search() { return [...this.data.values()] }
}

class InMemoryHireRepository implements IHireRepository {
    private data = new Map<string, HireEntity>()
    async create(hire: HireEntity) { this.data.set(hire.props.id, hire) }
    async save(hire: HireEntity) { this.data.set(hire.props.id, hire) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async listByClientId(clientId: string) {
        return [...this.data.values()].filter(h => h.props.clientId === clientId)
    }
    async listByWorkerId(workerId: string) {
        return [...this.data.values()].filter(h => h.props.workerId === workerId)
    }
}

class InMemoryProposalRepository implements IProposalRepository {
    private data: ProposalEntity[] = []
    async create(p: ProposalEntity) { this.data.push(p) }
    async listByHireId(hireId: string) { return this.data.filter(p => p.props.hireId === hireId) }
    async findLatestByHireId(hireId: string) {
        const list = this.data.filter(p => p.props.hireId === hireId)
        return list.sort((a, b) => b.props.round - a.props.round)[0] ?? null
    }
}

class InMemoryPaymentRepository implements IPaymentRepository {
    private data = new Map<string, PaymentEntity>()
    async create(payment: PaymentEntity) { this.data.set(payment.props.id, payment) }
    async save(payment: PaymentEntity) { this.data.set(payment.props.id, payment) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async findByHireId(hireId: string) {
        return [...this.data.values()].find(p => p.props.hireId === hireId) ?? null
    }
}

describe('Integração — ciclo completo de contratação com negociação', () => {
    let userRepo: InMemoryUserRepository
    let workerRepo: InMemoryWorkerRepository
    let hireRepo: InMemoryHireRepository
    let proposalRepo: InMemoryProposalRepository
    let paymentRepo: InMemoryPaymentRepository

    let createHire: CreateHireUsecase
    let submitProposal: SubmitProposalUsecase
    let acceptProposal: AcceptProposalUsecase
    let processPayment: ProcessPaymentUsecase

    let clientId: string
    let workerId: string
    const serviceTypeId = randomUUID()

    beforeEach(async () => {
        userRepo = new InMemoryUserRepository()
        workerRepo = new InMemoryWorkerRepository()
        hireRepo = new InMemoryHireRepository()
        proposalRepo = new InMemoryProposalRepository()
        paymentRepo = new InMemoryPaymentRepository()

        createHire = new CreateHireUsecase(userRepo, workerRepo, hireRepo, proposalRepo)
        submitProposal = new SubmitProposalUsecase(hireRepo, proposalRepo)
        acceptProposal = new AcceptProposalUsecase(hireRepo, proposalRepo)
        processPayment = new ProcessPaymentUsecase(hireRepo, paymentRepo)

        const client = UserEntity.create({
            name: 'Cliente Teste',
            email: 'cliente@uel.br',
            phone: '43999999999',
            password: 'hash',
        })
        clientId = client.props.id
        await userRepo.create(client)

        const worker = WorkerEntity.create({
            userId: randomUUID(),
            description: 'Eletricista experiente',
            workingSince: new Date('2018-01-01'),
            serviceTypes: [],
        })
        workerId = worker.props.userId
        await workerRepo.create(worker)
    })

    it('fluxo direto: cliente propõe → worker aceita → paga', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Instalação elétrica',
            amount: 450,
        })
        expect(hire.status).toBe('negotiating')
        expect(hire.proposalAmount).toBe(450)

        const { agreedAmount } = await acceptProposal.execute({ hireId: hire.id, acceptorId: workerId })
        expect(agreedAmount).toBe(450)

        const hireAfterAccept = await hireRepo.findById(hire.id)
        expect(hireAfterAccept?.props.status).toBe('accepted')

        const payment = await processPayment.execute({ hireId: hire.id, amount: agreedAmount })
        expect(payment.status).toBe('paid')
        expect(payment.amount).toBe(450)
    })

    it('fluxo com contra-proposta: cliente → worker counter → cliente aceita', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Pintura completa',
            amount: 300,
        })

        const counter = await submitProposal.execute({ hireId: hire.id, authorId: workerId, amount: 380 })
        expect(counter.round).toBe(2)

        const { agreedAmount } = await acceptProposal.execute({ hireId: hire.id, acceptorId: clientId })
        expect(agreedAmount).toBe(380)
    })

    it('múltiplas rodadas de negociação', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Reforma completa do banheiro',
            amount: 500,
        })

        await submitProposal.execute({ hireId: hire.id, authorId: workerId, amount: 700 })
        await submitProposal.execute({ hireId: hire.id, authorId: clientId, amount: 600 })
        const final = await submitProposal.execute({ hireId: hire.id, authorId: workerId, amount: 650 })
        expect(final.round).toBe(4)

        const { agreedAmount } = await acceptProposal.execute({ hireId: hire.id, acceptorId: clientId })
        expect(agreedAmount).toBe(650)
    })

    it('não deve processar pagamento se a contratação está em negociação', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Serviço de pintura',
            amount: 100,
        })

        await expect(
            processPayment.execute({ hireId: hire.id, amount: 100 })
        ).rejects.toThrow('A contratação precisa estar aceita para prosseguir')
    })

    it('não deve pagar duas vezes a mesma contratação', async () => {
        const hire = await createHire.execute({
            clientId, workerId, serviceTypeId,
            description: 'Encanamento completo',
            amount: 200,
        })
        await acceptProposal.execute({ hireId: hire.id, acceptorId: workerId })

        const pagamentoExistente = PaymentEntity.create({ hireId: hire.id, amount: 200 })
        pagamentoExistente.pay()
        await paymentRepo.create(pagamentoExistente)

        await expect(
            processPayment.execute({ hireId: hire.id, amount: 200 })
        ).rejects.toThrow('Esta contratação já possui um pagamento registrado')
    })
})
