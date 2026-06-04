import { IWorkerRepository } from "@domain/repositories/worker.repository";
import { vi } from "vitest";
import { mockWorkerEntity } from "../entities/worker.entity.mock";

export function mockWorkerRepository(): IWorkerRepository {
    return {
        findById: vi.fn().mockResolvedValue(mockWorkerEntity()),
        save: vi.fn(),
        create: vi.fn().mockResolvedValue(mockWorkerEntity())
    }
}