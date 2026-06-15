import type { MessageEntity } from '@domain/entities/message.entity';

export interface IMessageRepository {
    create(message: MessageEntity): Promise<void>;
    listByHireId(hireId: string): Promise<MessageEntity[]>;
}
