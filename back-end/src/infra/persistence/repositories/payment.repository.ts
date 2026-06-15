import type { PaymentEntity } from '@domain/entities/payment.entity';
import type { IPaymentRepository } from '@domain/repositories/payment.repository';
import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';
import { db } from '../connection';
import { PaymentMapper } from '../mappers/payment.mapper';
import { payment } from '../schema';

@injectable()
export class PaymentRepositoryImpl implements IPaymentRepository {
    async create(entity: PaymentEntity): Promise<void> {
        const values = PaymentMapper.toPersistence(entity);
        await db.insert(payment).values(values);
    }

    async save(entity: PaymentEntity): Promise<void> {
        const { id, ...data } = PaymentMapper.toPersistence(entity);
        await db.update(payment).set(data).where(eq(payment.id, id));
    }

    async findById(id: string): Promise<PaymentEntity | null> {
        const row = (await db.select().from(payment).where(eq(payment.id, id)))?.[0];
        return row ? PaymentMapper.toDomain(row) : null;
    }

    async findByHireId(hireId: string): Promise<PaymentEntity | null> {
        const row = (await db.select().from(payment).where(eq(payment.hireId, hireId)))?.[0];
        return row ? PaymentMapper.toDomain(row) : null;
    }
}
