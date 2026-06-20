import { WorkerPhotoEntity } from '@domain/entities/workerPhoto.entity';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { workerPhotos } from '../schema';

export class WorkerPhotoMapper {
    static toDomain(row: InferSelectModel<typeof workerPhotos>): WorkerPhotoEntity {
        return WorkerPhotoEntity.restore({
            id: row.id,
            workerId: row.workerId,
            url: row.url,
            position: row.position,
            createdAt: row.createdAt,
        });
    }

    static toPersistence(photo: WorkerPhotoEntity): InferInsertModel<typeof workerPhotos> {
        return {
            id: photo.props.id,
            workerId: photo.props.workerId,
            url: photo.props.url,
            position: photo.props.position,
            createdAt: photo.props.createdAt,
        };
    }
}
