/**
 * Testes de Integração — Ciclo de vida de uma contratação
 *
 * Diferença em relação aos testes de unidade:
 *   - Não usam vi.fn() (sem mocks)
 *   - Os repositórios são implementações reais em memória
 *   - Validam que os use cases integram corretamente entre si
 */
import type { HireEntity } from '@domain/entities/hire.entity'
import { PaymentEntity } from '@domain/entities/payment.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IPaymentRepository } from '@domain/repositories/payment.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { IWorkerRepository } from '@domain/repositories/worker.repository'
import UserEntity from '@domain/entities/user.entity'
import { WorkerEntity } from '@domain/entities/worker.entity'
import { CreateHireUsecase } from '@application/use-cases/hire/create-hire/create-hire.usecase'
import { UpdateHireStatusUsecase } from '@application/use-cases/hire/update-hire-status/update-hire-status.usecase'
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

class InMemoryPaymentRepository implements IPaymentRepository {
    private data = new Map<string, PaymentEntity>()

    async create(payment: PaymentEntity) { this.data.set(payment.props.id, payment) }
    async save(payment: PaymentEntity) { this.data.set(payment.props.id, payment) }
    async findById(id: string) { return this.data.get(id) ?? null }
    async findByHireId(hireId: string) {
        return [...this.data.values()].find(p => p.props.hireId === hireId) ?? null
    }
}

describe('Integração — ciclo completo de contratação', () => {
    let userRepo: InMemoryUserRepository
    let workerRepo: InMemoryWorkerRepository
    let hireRepo: InMemoryHireRepository
    let paymentRepo: InMemoryPaymentRepository

    let createHire: CreateHireUsecase
    let updateHireStatus: UpdateHireStatusUsecase
    let processPayment: ProcessPaymentUsecase

    let clientId: string
    let workerId: string
    const serviceTypeId = randomUUID()

    beforeEach(async () => {
        userRepo = new InMemoryUserRepository()
        workerRepo = new InMemoryWorkerRepository()
        hireRepo = new InMemoryHireRepository()
        paymentRepo = new InMemoryPaymentRepository()

        createHire = new CreateHireUsecase(userRepo, workerRepo, hireRepo)
        updateHireStatus = new UpdateHireStatusUsecase(hireRepo)
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

    it('fluxo completo: criar → aceitar → pagar', async () => {
        const hire = await createHire.execute({
            clientId,
            workerId,
            serviceTypeId,
            description: 'Instalação elétrica',
        })
        expect(hire.status).toBe('pending')

        await updateHireStatus.execute({ hireId: hire.id, status: 'accepted' })
        const hireAfterAccept = await hireRepo.findById(hire.id)
        expect(hireAfterAccept?.props.status).toBe('accepted')

        const payment = await processPayment.execute({ hireId: hire.id, amount: 450 })
        expect(payment.status).toBe('paid')
        expect(payment.amount).toBe(450)

        const hireAfterPayment = await hireRepo.findById(hire.id)
        expect(hireAfterPayment?.props.status).toBe('completed')
    })

    it('não deve processar pagamento se a contratação estiver pendente', async () => {
        const hire = await createHire.execute({
            clientId,
            workerId,
            serviceTypeId,
            description: 'Pintura',
        })

        await expect(
            processPayment.execute({ hireId: hire.id, amount: 100 })
        ).rejects.toThrow('A contratação precisa estar aceita para prosseguir')
    })

    it('não deve pagar duas vezes a mesma contratação (HireAlreadyPaid)', async () => {
        const hire = await createHire.execute({
            clientId,
            workerId,
            serviceTypeId,
            description: 'Encanamento',
        })
        await updateHireStatus.execute({ hireId: hire.id, status: 'accepted' })

        // Insere um pagamento diretamente no repositório para simular
        // um pagamento já existente sem alterar o status da contratação
        const pagamentoExistente = PaymentEntity.create({ hireId: hire.id, amount: 200 })
        pagamentoExistente.pay()
        await paymentRepo.create(pagamentoExistente)

        await expect(
            processPayment.execute({ hireId: hire.id, amount: 200 })
        ).rejects.toThrow('Esta contratação já possui um pagamento registrado')
    })
})
