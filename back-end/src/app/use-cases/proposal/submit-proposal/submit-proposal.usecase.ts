import type BaseUsecase from '@application/use-cases/base.usecase'
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found'
import { HireNotNegotiating } from '@application/use-cases/proposal/_errors/hire-not-negotiating'
import { NotYourTurn } from '@application/use-cases/proposal/_errors/not-your-turn'
import { ProposalEntity } from '@domain/entities/proposal.entity'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { SubmitProposalInputDto } from './submit-proposal.input.dto'
import type { SubmitProposalOutputDto } from './submit-proposal.output.dto'

@injectable()
export class SubmitProposalUsecase implements BaseUsecase<SubmitProposalInputDto, SubmitProposalOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ hireId, authorId, amount }: SubmitProposalInputDto): Promise<SubmitProposalOutputDto> {
        const hire = await this.hireRepository.findById(hireId)
        if (!hire) throw new HireNotFound()
        if (hire.props.status !== 'negotiating') throw new HireNotNegotiating()

        const latest = await this.proposalRepository.findLatestByHireId(hireId)
        if (latest && latest.props.authorId === authorId) throw new NotYourTurn()

        const nextRound = latest ? latest.props.round + 1 : 1
        const proposal = ProposalEntity.create({ hireId, authorId, amount, round: nextRound })
        await this.proposalRepository.create(proposal)

        return {
            id: proposal.props.id,
            hireId: proposal.props.hireId,
            authorId: proposal.props.authorId,
            amount: proposal.props.amount,
            round: proposal.props.round,
            createdAt: proposal.props.createdAt,
        }
    }
}
