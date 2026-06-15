import { PaymentEntity, type PaymentStatus } from '@domain/entities/payment.entity';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { payment } from '../schema';

export class PaymentMapper {
    static toDomain(model: InferSelectModel<typeof payment>): PaymentEntity {
        return PaymentEntity.restore({
            id: model.id,
            hireId: model.hireId,
            amount: model.amount,
            status: model.status as PaymentStatus,
            createdAt: model.createdAt,
            paidAt: model.paidAt,
        });
    }

    static toPersistence(entity: PaymentEntity): InferInsertModel<typeof payment> {
        const { id, hireId, amount, status, createdAt, paidAt } = entity.props;
        return { id, hireId, amount, status, createdAt, paidAt };
    }
}
