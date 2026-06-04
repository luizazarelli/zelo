import { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { vi } from "vitest";
import { mockServiceTypeEntity } from "../entities/serviceType.entity.mock";

export function mockServiceTypeRepository(): IServiceTypeRepository {
    return {
        create: vi.fn().mockResolvedValue(mockServiceTypeEntity()),
        deleteById: vi.fn(),
        findById: vi.fn().mockResolvedValue(mockServiceTypeEntity()),
        save: vi.fn()
    }
}