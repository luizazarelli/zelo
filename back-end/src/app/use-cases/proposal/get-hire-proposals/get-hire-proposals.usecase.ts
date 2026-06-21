import type BaseUsecase from '@application/use-cases/base.usecase'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { GetHireProposalsInputDto } from './get-hire-proposals.input.dto'
import type { GetHireProposalsOutputDto } from './get-hire-proposals.output.dto'

@injectable()
export class GetHireProposalsUsecase implements BaseUsecase<GetHireProposalsInputDto, GetHireProposalsOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ hireId }: GetHireProposalsInputDto): Promise<GetHireProposalsOutputDto> {
        const proposals = await this.proposalRepository.listByHireId(hireId)
        return {
            proposals: proposals.map(p => ({
                id: p.props.id,
                hireId: p.props.hireId,
                authorId: p.props.authorId,
                amount: p.props.amount,
                round: p.props.round,
                createdAt: p.props.createdAt,
            })),
        }
    }
}
