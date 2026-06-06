import type { ServiceTypeEntity } from "@domain/entities/serviceType.entity";
import type { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { eq } from "drizzle-orm";
import { injectable } from "tsyringe";
import { db } from "../connection";
import { ServiceTypeMapper } from "../mappers/serviceType.mapper";
import { serviceType } from "../schema";

@injectable()
export class ServiceTypeRepositoryImpl implements IServiceTypeRepository {
    async create(entity: ServiceTypeEntity): Promise<void> {
        const values = ServiceTypeMapper.toPersistence(entity); 
        await db.insert(serviceType).values(values);
    }

    async deleteById(id: string): Promise<void> {
        await db.delete(serviceType).where(eq(serviceType.id, id));
    }

    async findById(id: string): Promise<ServiceTypeEntity | null> {
        const result = (await db.select()
            .from(serviceType)
            .where(eq(serviceType.id, id)))?.[0]; 

        return result? ServiceTypeMapper.toDomain(result): null;
    }

    async save(entity: ServiceTypeEntity): Promise<void> {
        const {id, ...updatableData} = ServiceTypeMapper.toPersistence(entity);

        await db.update(serviceType)
            .set({
                ...updatableData
            })
            .where(eq(serviceType.id, id));
    }

    async search(): Promise<ServiceTypeEntity[]> {
        const rows = await db.select().from(serviceType);
        return rows.map(ServiceTypeMapper.toDomain);
    }
}