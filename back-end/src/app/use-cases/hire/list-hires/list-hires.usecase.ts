import type BaseUsecase from '@application/use-cases/base.usecase';
import type { IHireRepository } from '@domain/repositories/hire.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { ListHiresInputDto } from './list-hires.input.dto';
import type { ListHiresOutputDto } from './list-hires.output.dto';

@injectable()
export class ListHiresUsecase implements BaseUsecase<ListHiresInputDto, ListHiresOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
    ) {}

    async execute({ userId, role, status }: ListHiresInputDto): Promise<ListHiresOutputDto> {
        const hires = role === 'client'
            ? await this.hireRepository.listByClientId(userId, status)
            : await this.hireRepository.listByWorkerId(userId, status);

        return {
            hires: hires.map((h) => ({
                id: h.props.id,
                clientId: h.props.clientId,
                workerId: h.props.workerId,
                serviceTypeId: h.props.serviceTypeId,
                description: h.props.description,
                status: h.props.status,
                createdAt: h.props.createdAt,
            })),
        };
    }
}
