import type { IHireRepository } from '@domain/repositories/hire.repository'
import { mockHireEntity } from '@test/mocks/entities/hire.entity.mock'
import { mockHireRepository } from '@test/mocks/repositories/hire.repository.mock'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found'
import { UpdateHireStatusUsecase } from '@application/use-cases/hire/update-hire-status/update-hire-status.usecase'

describe('UpdateHireStatusUsecase — testes de unidade', () => {
    let hireRepo: IHireRepository
    let usecase: UpdateHireStatusUsecase

    beforeEach(() => {
        vi.clearAllMocks()
        hireRepo = mockHireRepository()
        usecase = new UpdateHireStatusUsecase(hireRepo)
    })

    it('deve aceitar uma contratação pendente', async () => {
        const hire = mockHireEntity({ status: 'pending' })
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)

        await usecase.execute({ hireId: hire.props.id, status: 'accepted' })

        expect(hire.props.status).toBe('accepted')
        expect(hireRepo.save).toHaveBeenCalledWith(hire)
    })

    it('deve concluir uma contratação aceita', async () => {
        const hire = mockHireEntity({ status: 'accepted' })
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)

        await usecase.execute({ hireId: hire.props.id, status: 'completed' })

        expect(hire.props.status).toBe('completed')
    })

    it('deve cancelar uma contratação', async () => {
        const hire = mockHireEntity({ status: 'pending' })
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)

        await usecase.execute({ hireId: hire.props.id, status: 'cancelled' })

        expect(hire.props.status).toBe('cancelled')
    })

    it('deve lançar HireNotFound se a contratação não existir', async () => {
        vi.mocked(hireRepo.findById).mockResolvedValue(null)

        await expect(
            usecase.execute({ hireId: 'id-inexistente', status: 'accepted' })
        ).rejects.toThrow(HireNotFound)
    })

    it('deve salvar a contratação após atualizar o status', async () => {
        const hire = mockHireEntity()
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)

        await usecase.execute({ hireId: hire.props.id, status: 'accepted' })

        expect(hireRepo.save).toHaveBeenCalledOnce()
    })
})
