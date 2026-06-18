import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import type { IWorkerRepository } from '@domain/repositories/worker.repository'
import { mockHireRepository } from '@test/mocks/repositories/hire.repository.mock'
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
}

describe('CreateHireUsecase — testes de unidade', () => {
    let userRepo: IUserRepository
    let workerRepo: IWorkerRepository
    let hireRepo: IHireRepository
    let usecase: CreateHireUsecase

    beforeEach(() => {
        vi.clearAllMocks()
        userRepo = mockUserRepository()
        workerRepo = mockWorkerRepository()
        hireRepo = mockHireRepository()
        usecase = new CreateHireUsecase(userRepo, workerRepo, hireRepo)
    })

    it('deve criar uma contratação e retornar id e status pending', async () => {
        const result = await usecase.execute(input)

        expect(result.id).toBeDefined()
        expect(result.status).toBe('pending')
        expect(result.createdAt).toBeInstanceOf(Date)
        expect(hireRepo.create).toHaveBeenCalledOnce()
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
