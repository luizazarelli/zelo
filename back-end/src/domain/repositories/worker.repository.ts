import type { WorkerEntity } from "@domain/entities/worker.entity";

export interface IWorkerRepository {
	save(worker: WorkerEntity): Promise<void>;
	create(worker: WorkerEntity): Promise<void>;
	findById(id: string): Promise<WorkerEntity | null>;
	search(filters?: {
		serviceTypes?: string[];
		page?: number;
	}): Promise<WorkerEntity[]>;
}
