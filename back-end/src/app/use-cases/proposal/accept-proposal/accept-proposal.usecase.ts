import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found'
import { HireNotNegotiating } from '@application/use-cases/proposal/_errors/hire-not-negotiating'
import { NotYourTurnToAccept } from '@application/use-cases/proposal/_errors/not-your-turn-to-accept'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { AcceptProposalInputDto } from './accept-proposal.input.dto'
import type { AcceptProposalOutputDto } from './accept-proposal.output.dto'

@injectable()
export class AcceptProposalUsecase implements BaseUsecase<AcceptProposalInputDto, AcceptProposalOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ hireId, acceptorId }: AcceptProposalInputDto): Promise<AcceptProposalOutputDto> {
        const hire = await this.hireRepository.findById(hireId)
        if (!hire) throw new HireNotFound()
        if (hire.props.status !== 'negotiating') throw new HireNotNegotiating()

        const latest = await this.proposalRepository.findLatestByHireId(hireId)
        if (!latest || latest.props.authorId === acceptorId) throw new NotYourTurnToAccept()

        hire.accept()
        await this.hireRepository.save(hire)

        return { agreedAmount: latest.props.amount }
    }
}
