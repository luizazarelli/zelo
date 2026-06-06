import { ServiceTypeEntity } from "@domain/entities/serviceType.entity";

export interface IServiceTypeRepository {
    create(serviceType: ServiceTypeEntity): Promise<void>;
    save(serviceType: ServiceTypeEntity): Promise<void>;
    findById(id: string): Promise<ServiceTypeEntity | null>;
    deleteById(id: string): Promise<void>;
    search(): Promise<ServiceTypeEntity[]>;
}
