import type BaseUsecase from '@application/use-cases/base.usecase'
import type { IHireRepository } from '@domain/repositories/hire.repository'
import type { IProposalRepository } from '@domain/repositories/proposal.repository'
import type { IUserRepository } from '@domain/repositories/user.repository'
import { INFRA } from '@infra/tokens'
import { inject, injectable } from 'tsyringe'
import type { ListHiresInputDto } from './list-hires.input.dto'
import type { ListHiresOutputDto } from './list-hires.output.dto'

@injectable()
export class ListHiresUsecase implements BaseUsecase<ListHiresInputDto, ListHiresOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.USER)
        private readonly userRepository: IUserRepository,
        @inject(INFRA.REPOSITORIES.PROPOSAL)
        private readonly proposalRepository: IProposalRepository,
    ) {}

    async execute({ userId, role, status }: ListHiresInputDto): Promise<ListHiresOutputDto> {
        const hires = role === 'client'
            ? await this.hireRepository.listByClientId(userId, status)
            : await this.hireRepository.listByWorkerId(userId, status)

        const userIds = [...new Set([
            ...hires.map((h) => h.props.clientId),
            ...hires.map((h) => h.props.workerId),
        ])]
        const users = await this.userRepository.searchByIds(userIds)
        const userMap = new Map(users.map((u) => [u.props.id, { name: u.props.name, photo: u.props.profilePicture ?? null }]))

        const latestProposals = await Promise.all(
            hires.map(h => this.proposalRepository.findLatestByHireId(h.props.id))
        )

        return {
            hires: hires.map((h, i) => ({
                id: h.props.id,
                clientId: h.props.clientId,
                clientName: userMap.get(h.props.clientId)?.name ?? 'Cliente',
                clientPhotoUrl: userMap.get(h.props.clientId)?.photo ?? null,
                workerId: h.props.workerId,
                workerName: userMap.get(h.props.workerId)?.name ?? 'Profissional',
                workerPhotoUrl: userMap.get(h.props.workerId)?.photo ?? null,
                serviceTypeId: h.props.serviceTypeId,
                description: h.props.description,
                status: h.props.status,
                createdAt: h.props.createdAt,
                latestProposalAmount: latestProposals[i]?.props.amount ?? null,
                latestProposalAuthorId: latestProposals[i]?.props.authorId ?? null,
            })),
        }
    }
}
