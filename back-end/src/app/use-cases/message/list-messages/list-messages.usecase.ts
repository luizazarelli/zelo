import type BaseUsecase from '@application/use-cases/base.usecase';
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found';
import { ApplicationError } from '@application/use-cases/_errors/applicationError';
import type { IHireRepository } from '@domain/repositories/hire.repository';
import type { IMessageRepository } from '@domain/repositories/message.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { ListMessagesInputDto } from './list-messages.input.dto';
import type { ListMessagesOutputDto } from './list-messages.output.dto';

@injectable()
export class ListMessagesUsecase implements BaseUsecase<ListMessagesInputDto, ListMessagesOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.MESSAGE)
        private readonly messageRepository: IMessageRepository,
    ) {}

    async execute({ hireId, requesterId }: ListMessagesInputDto): Promise<ListMessagesOutputDto> {
        const hire = await this.hireRepository.findById(hireId);
        if (!hire) throw new HireNotFound();

        const isParticipant = hire.props.clientId === requesterId || hire.props.workerId === requesterId;
        if (!isParticipant) throw new ApplicationError('Acesso não autorizado a esta conversa', 403);

        const msgs = await this.messageRepository.listByHireId(hireId);

        return {
            messages: msgs.map((m) => ({
                id: m.props.id,
                senderId: m.props.senderId,
                content: m.props.content,
                createdAt: m.props.createdAt,
            })),
        };
    }
}
