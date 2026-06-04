import { WorkerEntity } from "@domain/entities/worker.entity";
import { randomUUID } from "crypto";

export function mockWorkerEntity(): WorkerEntity {
    return WorkerEntity.create({
        description: "Description",
        serviceTypes: [], 
        userId: randomUUID(),
        workingSince: new Date()
    });
}