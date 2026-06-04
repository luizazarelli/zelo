import { WorkerEntity } from "@domain/entities/worker.entity";

export interface IWorkerRepository {
    save(worker: WorkerEntity): Promise<void>; 
    create(worker: WorkerEntity): Promise<void>;
    findById(id: string): Promise<WorkerEntity | null>;
}