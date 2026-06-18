import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IPaymentRepository } from '@domain/repositories/payment.repository'
import { mockHireEntity } from 'src/test/mocks/entities/hire.entity.mock'
import { mockPaymentEntity } from 'src/test/mocks/entities/payment.entity.mock'
import { mockHireRepository } from 'src/test/mocks/repositories/hire.repository.mock'
import { mockPaymentRepository } from 'src/test/mocks/repositories/payment.repository.mock'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HireNotFound } from '../../hire/_errors/hire-not-found'
import { HireNotAccepted } from '../../hire/_errors/hire-not-accepted'
import { HireAlreadyPaid } from '../_errors/hire-already-paid'
import { ProcessPaymentUsecase } from './process-payment.usecase'

describe('ProcessPaymentUsecase — testes de unidade', () => {
    let hireRepo: IHireRepository
    let paymentRepo: IPaymentRepository
    let usecase: ProcessPaymentUsecase

    beforeEach(() => {
        vi.clearAllMocks()
        hireRepo = mockHireRepository()
        paymentRepo = mockPaymentRepository()
        usecase = new ProcessPaymentUsecase(hireRepo, paymentRepo)
    })

    it('deve processar pagamento de uma contratação aceita', async () => {
        const hire = mockHireEntity({ status: 'accepted' })
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)
        vi.mocked(paymentRepo.findByHireId).mockResolvedValue(null)

        const result = await usecase.execute({ hireId: hire.props.id, amount: 300 })

        expect(result.status).toBe('paid')
        expect(result.amount).toBe(300)
        expect(result.paidAt).toBeInstanceOf(Date)
    })

    it('deve marcar a contratação como completed após o pagamento', async () => {
        const hire = mockHireEntity({ status: 'accepted' })
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)
        vi.mocked(paymentRepo.findByHireId).mockResolvedValue(null)

        await usecase.execute({ hireId: hire.props.id, amount: 150 })

        expect(hire.props.status).toBe('completed')
        expect(hireRepo.save).toHaveBeenCalledWith(hire)
    })

    it('deve lançar HireNotFound se a contratação não existir', async () => {
        vi.mocked(hireRepo.findById).mockResolvedValue(null)

        await expect(
            usecase.execute({ hireId: 'id-inexistente', amount: 100 })
        ).rejects.toThrow(HireNotFound)
    })

    it('deve lançar HireNotAccepted se a contratação ainda estiver pendente', async () => {
        const hire = mockHireEntity({ status: 'pending' })
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)

        await expect(
            usecase.execute({ hireId: hire.props.id, amount: 100 })
        ).rejects.toThrow(HireNotAccepted)
    })

    it('deve lançar HireAlreadyPaid se já houver pagamento registrado', async () => {
        const hire = mockHireEntity({ status: 'accepted' })
        vi.mocked(hireRepo.findById).mockResolvedValue(hire)
        vi.mocked(paymentRepo.findByHireId).mockResolvedValue(mockPaymentEntity(hire.props.id))

        await expect(
            usecase.execute({ hireId: hire.props.id, amount: 100 })
        ).rejects.toThrow(HireAlreadyPaid)
    })
})
