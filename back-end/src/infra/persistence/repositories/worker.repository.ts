import { ServiceTypeEntity } from "@domain/entities/serviceType.entity";
import { WorkerEntity } from "@domain/entities/worker.entity";
import { IWorkerRepository } from "@domain/repositories/worker.repository";
import { eq } from "drizzle-orm";
import { db, DbTransaction } from "../connection";
import { ServiceTypeMapper } from "../mappers/serviceType.mapper";
import { WorkerMapper } from "../mappers/worker.mapper";
import { worker, workerServiceType } from "../schema";

export class WorkerRepositoryImpl implements IWorkerRepository {
    private async persistServiceTypes(tx: DbTransaction, userId: string, serviceTypes: ServiceTypeEntity[]) {
        if (!serviceTypes || serviceTypes.length <= 0) {
            return; 
        }

        const serviceTypesToInsert = serviceTypes.map(serviceType => {
            const values = ServiceTypeMapper.toPersistence(serviceType);

            return {
                workerId: userId, 
                serviceTypeId: values.id
            }
        });
        
        await tx.insert(workerServiceType)
            .values(serviceTypesToInsert);
    }

    async findById(id: string): Promise<WorkerEntity | null> {
        const result = await db.query.worker.findFirst({
            where: {
                userId: id
            },
            with: {
                workerServiceType: {
                    with: {
                        serviceType: true
                    }
                }
            }
        });

        return result ? WorkerMapper.toDomain(result): null; 
    }

    async create(entity: WorkerEntity): Promise<void> {
        const {serviceTypes, ...rest} = WorkerMapper.toPersistence(entity);

        await db.transaction(async (tx) => {
            await tx.insert(worker)
                .values(rest);

            await this.persistServiceTypes(tx, rest.userId, serviceTypes);
        })
    }
    
    async save(entity: WorkerEntity): Promise<void> {
        const { userId, serviceTypes, ...updatableData } = WorkerMapper.toPersistence(entity); 

        await db.transaction(async (tx) => {
            await tx.update(worker)
                .set({
                    ...updatableData
                })
                .where(eq(worker.userId, userId));

            await tx.delete(workerServiceType)
                .where(eq(workerServiceType.workerId, userId));

            await this.persistServiceTypes(tx, userId, serviceTypes)            
        });
    }
}