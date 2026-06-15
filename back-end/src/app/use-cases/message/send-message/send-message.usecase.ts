import type BaseUsecase from '@application/use-cases/base.usecase';
import { HireNotFound } from '@application/use-cases/hire/_errors/hire-not-found';
import { MessageEntity } from '@domain/entities/message.entity';
import type { IHireRepository } from '@domain/repositories/hire.repository';
import type { IMessageRepository } from '@domain/repositories/message.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { SendMessageInputDto } from './send-message.input.dto';
import type { SendMessageOutputDto } from './send-message.output.dto';
import { ApplicationError } from '@application/use-cases/_errors/applicationError';

@injectable()
export class SendMessageUsecase implements BaseUsecase<SendMessageInputDto, SendMessageOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.HIRE)
        private readonly hireRepository: IHireRepository,
        @inject(INFRA.REPOSITORIES.MESSAGE)
        private readonly messageRepository: IMessageRepository,
    ) {}

    async execute({ hireId, senderId, content }: SendMessageInputDto): Promise<SendMessageOutputDto> {
        const hire = await this.hireRepository.findById(hireId);
        if (!hire) throw new HireNotFound();

        const isParticipant = hire.props.clientId === senderId || hire.props.workerId === senderId;
        if (!isParticipant) throw new ApplicationError('Apenas participantes da contratação podem enviar mensagens', 403);

        const msg = MessageEntity.create({ hireId, senderId, content });
        await this.messageRepository.create(msg);

        return {
            id: msg.props.id,
            hireId: msg.props.hireId,
            senderId: msg.props.senderId,
            content: msg.props.content,
            createdAt: msg.props.createdAt,
        };
    }
}
