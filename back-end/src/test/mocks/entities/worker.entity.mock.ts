import { randomUUID } from "node:crypto";
import type { ServiceTypeEntity } from "@domain/entities/serviceType.entity";
import { WorkerEntity } from "@domain/entities/worker.entity";

export function mockWorkerEntity(overrides?: {
	userId?: string;
	serviceTypes?: ServiceTypeEntity[];
}): WorkerEntity {
	return WorkerEntity.create({
		description: "Description",
		serviceTypes: overrides?.serviceTypes ?? [],
		userId: overrides?.userId ?? randomUUID(),
		workingSince: new Date(),
	});
}
