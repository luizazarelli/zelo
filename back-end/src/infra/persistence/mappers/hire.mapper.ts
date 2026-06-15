import { HireEntity, type HireStatus } from '@domain/entities/hire.entity';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { hire } from '../schema';

export class HireMapper {
    static toDomain(model: InferSelectModel<typeof hire>): HireEntity {
        return HireEntity.restore({
            id: model.id,
            clientId: model.clientId,
            workerId: model.workerId,
            serviceTypeId: model.serviceTypeId,
            description: model.description,
            status: model.status as HireStatus,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        });
    }

    static toPersistence(entity: HireEntity): InferInsertModel<typeof hire> {
        const { id, clientId, workerId, serviceTypeId, description, status, createdAt, updatedAt } = entity.props;
        return { id, clientId, workerId, serviceTypeId, description, status, createdAt, updatedAt };
    }
}
