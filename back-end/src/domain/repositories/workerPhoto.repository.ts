import type { WorkerPhotoEntity } from '@domain/entities/workerPhoto.entity';

export interface IWorkerPhotoRepository {
    create(photo: WorkerPhotoEntity): Promise<void>;
    findByWorkerId(workerId: string): Promise<WorkerPhotoEntity[]>;
    findById(id: string): Promise<WorkerPhotoEntity | null>;
    countByWorkerId(workerId: string): Promise<number>;
    delete(id: string): Promise<void>;
}
