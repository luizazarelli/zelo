import { ServiceTypeEntity } from "@domain/entities/serviceType.entity";

export function mockServiceTypeEntity(): ServiceTypeEntity {
    return ServiceTypeEntity.create({
        name: "Test",
        description: "Description"
    });
}