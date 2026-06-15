import { MessageEntity } from '@domain/entities/message.entity';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { message } from '../schema';

export class MessageMapper {
    static toDomain(model: InferSelectModel<typeof message>): MessageEntity {
        return MessageEntity.restore({
            id: model.id,
            hireId: model.hireId,
            senderId: model.senderId,
            content: model.content,
            createdAt: model.createdAt,
        });
    }

    static toPersistence(entity: MessageEntity): InferInsertModel<typeof message> {
        const { id, hireId, senderId, content, createdAt } = entity.props;
        return { id, hireId, senderId, content, createdAt };
    }
}
