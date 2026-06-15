import type { MessageEntity } from '@domain/entities/message.entity';
import type { IMessageRepository } from '@domain/repositories/message.repository';
import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';
import { db } from '../connection';
import { MessageMapper } from '../mappers/message.mapper';
import { message } from '../schema';

@injectable()
export class MessageRepositoryImpl implements IMessageRepository {
    async create(entity: MessageEntity): Promise<void> {
        const values = MessageMapper.toPersistence(entity);
        await db.insert(message).values(values);
    }

    async listByHireId(hireId: string): Promise<MessageEntity[]> {
        const rows = await db.select().from(message).where(eq(message.hireId, hireId));
        return rows.map(MessageMapper.toDomain);
    }
}
