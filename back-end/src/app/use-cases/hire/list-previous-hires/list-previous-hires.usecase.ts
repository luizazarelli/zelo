import type BaseUsecase from '@application/use-cases/base.usecase';
import type { IHireRepository } from '@domain/repositories/hire.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { ListPreviousHiresInputDto } from './list-previous-hires.input.dto';
import type { ListPreviousHiresOutputDto } from './list-previous-hires.output.dto';

@injectable()
export class ListPreviousHiresUsecase implements BaseUsecase<ListPreviousHiresInputDto, ListPreviousHiresOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
    ) {}

    async execute({ userId, role }: ListPreviousHiresInputDto): Promise<ListPreviousHiresOutputDto> {
        const hires = role === 'client'
            ? await this.hireRepository.listByClientId(userId, 'completed')
            : await this.hireRepository.listByWorkerId(userId, 'completed');

        return {
            hires: hires.map((h) => ({
                id: h.props.id,
                clientId: h.props.clientId,
                workerId: h.props.workerId,
                serviceTypeId: h.props.serviceTypeId,
                description: h.props.description,
                createdAt: h.props.createdAt,
            })),
        };
    }
}
