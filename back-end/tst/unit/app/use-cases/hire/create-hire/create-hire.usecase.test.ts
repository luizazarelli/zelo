import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { IWorkerRepository } from '@domain/repositories/worker.repository'
import { mockHireRepository } from '@test/mocks/repositories/hire.repository.mock'
import { mockProposalRepository } from '@test/mocks/repositories/proposal.repository.mock'
import { mockUserRepository } from '@test/mocks/repositories/user.repository.mock'
import { mockWorkerRepository } from '@test/mocks/repositories/worker.repository.mock'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error'
import { WorkerNotFound } from '@application/use-cases/worker/_errors/worker-not-found'
import { CreateHireUsecase } from '@application/use-cases/hire/create-hire/create-hire.usecase'

const input = {
    clientId: 'client-uuid',
    workerId: 'worker-uuid',
    serviceTypeId: 'service-uuid',
    description: 'Serviço de elétrica',
    amount: 150,
}

describe('CreateHireUsecase — testes de unidade', () => {
    let userRepo: IUserRepository
    let workerRepo: IWorkerRepository
    let hireRepo: IHireRepository
    let proposalRepo: IProposalRepository
    let usecase: CreateHireUsecase

    beforeEach(() => {
        vi.clearAllMocks()
        userRepo = mockUserRepository()
        workerRepo = mockWorkerRepository()
        hireRepo = mockHireRepository()
        proposalRepo = mockProposalRepository()
        usecase = new CreateHireUsecase(userRepo, workerRepo, hireRepo, proposalRepo)
    })

    it('deve criar uma contratação e retornar id e status negotiating', async () => {
        const result = await usecase.execute(input)

        expect(result.id).toBeDefined()
        expect(result.status).toBe('negotiating')
        expect(result.createdAt).toBeInstanceOf(Date)
        expect(result.proposalAmount).toBe(input.amount)
        expect(hireRepo.create).toHaveBeenCalledOnce()
        expect(proposalRepo.create).toHaveBeenCalledOnce()
    })

    it('deve lançar UserNotFound se o cliente não existir', async () => {
        vi.mocked(userRepo.findById).mockResolvedValue(null)

        await expect(usecase.execute(input)).rejects.toThrow(UserNotFound)
    })

    it('deve lançar WorkerNotFound se o profissional não existir', async () => {
        vi.mocked(workerRepo.findById).mockResolvedValue(null)

        await expect(usecase.execute(input)).rejects.toThrow(WorkerNotFound)
    })

    it('deve verificar cliente e profissional em paralelo', async () => {
        await usecase.execute(input)

        expect(userRepo.findById).toHaveBeenCalledWith(input.clientId)
        expect(workerRepo.findById).toHaveBeenCalledWith(input.workerId)
    })
})
