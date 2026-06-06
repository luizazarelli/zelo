import type { ServiceTypeEntity } from "@domain/entities/serviceType.entity";
import type { WorkerEntity } from "@domain/entities/worker.entity";
import type { IWorkerRepository } from "@domain/repositories/worker.repository";
import { eq, inArray } from "drizzle-orm";
import { type DbTransaction, db } from "../connection";
import { ServiceTypeMapper } from "../mappers/serviceType.mapper";
import { WorkerMapper } from "../mappers/worker.mapper";
import { worker, workerServiceType } from "../schema";

export class WorkerRepositoryImpl implements IWorkerRepository {
	private async persistServiceTypes(
		tx: DbTransaction,
		userId: string,
		serviceTypes: ServiceTypeEntity[],
	) {
		if (!serviceTypes || serviceTypes.length <= 0) {
			return;
		}

		const serviceTypesToInsert = serviceTypes.map((serviceType) => {
			const values = ServiceTypeMapper.toPersistence(serviceType);

			return {
				workerId: userId,
				serviceTypeId: values.id,
			};
		});

		await tx.insert(workerServiceType).values(serviceTypesToInsert);
	}

	async findById(id: string): Promise<WorkerEntity | null> {
		const result = await db.query.worker.findFirst({
			where: {
				userId: id,
			},
			with: {
				workerServiceType: {
					with: {
						serviceType: true,
					},
				},
			},
		});

		return result ? WorkerMapper.toDomain(result) : null;
	}

	async create(entity: WorkerEntity): Promise<void> {
		const { serviceTypes, ...rest } = WorkerMapper.toPersistence(entity);

		await db.transaction(async (tx) => {
			await tx.insert(worker).values(rest);

			await this.persistServiceTypes(tx, rest.userId, serviceTypes);
		});
	}

	async save(entity: WorkerEntity): Promise<void> {
		const { userId, serviceTypes, ...updatableData } =
			WorkerMapper.toPersistence(entity);

		await db.transaction(async (tx) => {
			await tx
				.update(worker)
				.set({
					...updatableData,
				})
				.where(eq(worker.userId, userId));

			await tx
				.delete(workerServiceType)
				.where(eq(workerServiceType.workerId, userId));

			await this.persistServiceTypes(tx, userId, serviceTypes);
		});
	}

	async search(filters?: {
		serviceTypes?: string[];
		page?: number;
	}): Promise<WorkerEntity[]> {
		const pageSize = 100;
		const page = filters?.page && filters?.page > 0 ? filters?.page : 1;
		const serviceTypeIds = filters?.serviceTypes ?? [];

		const result = await db.query.worker.findMany({
			where: serviceTypeIds.length > 0
				? {
						RAW: inArray(
							worker.userId,
							db
								.select({ workerId: workerServiceType.workerId })
								.from(workerServiceType)
								.where(inArray(workerServiceType.serviceTypeId, serviceTypeIds)),
						),
					}
				: undefined,
			with: {
				workerServiceType: {
					with: {
						serviceType: true,
					},
				},
			},
			limit: pageSize,
			offset: (page - 1) * pageSize,
		});

		return result.map(WorkerMapper.toDomain);
	}
}
