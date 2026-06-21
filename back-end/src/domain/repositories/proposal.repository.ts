import type { ProposalEntity } from '@domain/entities/proposal.entity'

export interface IProposalRepository {
    create(proposal: ProposalEntity): Promise<void>
    listByHireId(hireId: string): Promise<ProposalEntity[]>
    findLatestByHireId(hireId: string): Promise<ProposalEntity | null>
}
