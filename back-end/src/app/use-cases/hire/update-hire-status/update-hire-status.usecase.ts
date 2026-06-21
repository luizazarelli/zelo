import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { UpdateHireStatusInputDto } from './update-hire-status.input.dto'

@injectable()
export class UpdateHireStatusUsecase implements BaseUsecase<UpdateHireStatusInputDto, void> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
    ) {}

    async execute({ hireId, status }: UpdateHireStatusInputDto): Promise<void> {
        const hire = await this.hireRepository.findById(hireId)
        if (!hire) throw new HireNotFound()

        if (status === 'completed') hire.complete()
        else hire.cancel()

        await this.hireRepository.save(hire)
    }
}
