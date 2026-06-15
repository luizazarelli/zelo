import type { HireEntity } from '@domain/entities/hire.entity';
import type { IHireRepository } from '@domain/repositories/hire.repository';
import { and, eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';
import { db } from '../connection';
import { HireMapper } from '../mappers/hire.mapper';
import { hire } from '../schema';

@injectable()
export class HireRepositoryImpl implements IHireRepository {
    async create(entity: HireEntity): Promise<void> {
        const values = HireMapper.toPersistence(entity);
        await db.insert(hire).values(values);
    }

    async save(entity: HireEntity): Promise<void> {
        const { id, ...data } = HireMapper.toPersistence(entity);
        await db.update(hire).set(data).where(eq(hire.id, id));
    }

    async findById(id: string): Promise<HireEntity | null> {
        const row = (await db.select().from(hire).where(eq(hire.id, id)))?.[0];
        return row ? HireMapper.toDomain(row) : null;
    }

    async listByClientId(clientId: string, status?: string): Promise<HireEntity[]> {
        const rows = await db.select().from(hire).where(
            status
                ? and(eq(hire.clientId, clientId), eq(hire.status, status))
                : eq(hire.clientId, clientId)
        );
        return rows.map(HireMapper.toDomain);
    }

    async listByWorkerId(workerId: string, status?: string): Promise<HireEntity[]> {
        const rows = await db.select().from(hire).where(
            status
                ? and(eq(hire.workerId, workerId), eq(hire.status, status))
                : eq(hire.workerId, workerId)
        );
        return rows.map(HireMapper.toDomain);
    }
}
