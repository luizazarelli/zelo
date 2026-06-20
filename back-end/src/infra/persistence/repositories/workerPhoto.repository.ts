import type { WorkerPhotoEntity } from '@domain/entities/workerPhoto.entity';
import type { IWorkerPhotoRepository } from '@domain/repositories/workerPhoto.repository';
import { count, eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';
import { db } from '../connection';
import { WorkerPhotoMapper } from '../mappers/workerPhoto.mapper';
import { workerPhotos } from '../schema';

@injectable()
export class WorkerPhotoRepositoryImpl implements IWorkerPhotoRepository {
    async create(photo: WorkerPhotoEntity): Promise<void> {
        await db.insert(workerPhotos).values(WorkerPhotoMapper.toPersistence(photo));
    }

    async findByWorkerId(workerId: string): Promise<WorkerPhotoEntity[]> {
        const rows = await db
            .select()
            .from(workerPhotos)
            .where(eq(workerPhotos.workerId, workerId))
            .orderBy(workerPhotos.position);
        return rows.map(WorkerPhotoMapper.toDomain);
    }

    async findById(id: string): Promise<WorkerPhotoEntity | null> {
        const row = (await db.select().from(workerPhotos).where(eq(workerPhotos.id, id)))?.[0];
        return row ? WorkerPhotoMapper.toDomain(row) : null;
    }

    async countByWorkerId(workerId: string): Promise<number> {
        const result = await db
            .select({ value: count() })
            .from(workerPhotos)
            .where(eq(workerPhotos.workerId, workerId));
        return result[0]?.value ?? 0;
    }

    async delete(id: string): Promise<void> {
        await db.delete(workerPhotos).where(eq(workerPhotos.id, id));
    }
}
