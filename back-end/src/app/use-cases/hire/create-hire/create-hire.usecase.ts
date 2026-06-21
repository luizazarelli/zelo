import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error'
import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireEntity } from '@domain/entities/hire.entity'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import { WorkerNotFound } from '@application/use-cases/worker/_errors/worker-not-found'
import type { IWorkerRepository } from '@domain/repositories/worker.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { CreateHireInputDto } from './create-hire.input.dto'
import type { CreateHireOutputDto } from './create-hire.output.dto'

@injectable()
export class CreateHireUsecase implements BaseUsecase<CreateHireInputDto, CreateHireOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private readonly userRepository: IUserRepository,
        @inject(INFRA.REPOSITORIES.WORKER)
        private readonly workerRepository: IWorkerRepository,
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ clientId, workerId, serviceTypeId, description, amount }: CreateHireInputDto): Promise<CreateHireOutputDto> {
        const [client, worker] = await Promise.all([
            this.userRepository.findById(clientId),
            this.workerRepository.findById(workerId),
        ])
        if (!client) throw new UserNotFound()
        if (!worker) throw new WorkerNotFound()

        const hireEntity = HireEntity.create({ clientId, workerId, serviceTypeId, description })
        await this.hireRepository.create(hireEntity)

        const proposalEntity = ProposalEntity.create({
            hireId: hireEntity.props.id,
            authorId: clientId,
            amount,
            round: 1,
        })
        await this.proposalRepository.create(proposalEntity)

        return {
            id: hireEntity.props.id,
            status: hireEntity.props.status,
            createdAt: hireEntity.props.createdAt,
            proposalAmount: amount,
        }
    }
}
