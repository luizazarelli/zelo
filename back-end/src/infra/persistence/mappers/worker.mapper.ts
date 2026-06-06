import type { ServiceTypeEntity } from "@domain/entities/serviceType.entity";
import { WorkerEntity } from "@domain/entities/worker.entity";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { serviceType, worker, workerServiceType } from "../schema";
import { ServiceTypeMapper } from "./serviceType.mapper";

type WorkerModelWithServiceType = InferSelectModel<typeof worker> & {
	workerServiceType: (InferSelectModel<typeof workerServiceType> & {
		serviceType: InferSelectModel<typeof serviceType> | null;
	})[];
};

// biome-ignore lint/complexity/noStaticOnlyClass: <>
export class WorkerMapper {
	static toDomain(workerModel: WorkerModelWithServiceType): WorkerEntity {
		const { createdAt, description, userId, workingSince } = workerModel;
		const serviceTypes = workerModel.workerServiceType
			.map((workerServiceType) => workerServiceType.serviceType)
			.filter((serviceType) => !!serviceType);

		return WorkerEntity.restore({
			serviceTypes: serviceTypes.map(ServiceTypeMapper.toDomain),
			createdAt,
			description,
			userId,
			workingSince,
		});
	}

	static toPersistence(
		entity: WorkerEntity,
	): InferInsertModel<typeof worker> & { serviceTypes: ServiceTypeEntity[] } {
		const { userId, workingSince, createdAt, description, serviceTypes } =
			entity.props;

		return {
			userId,
			workingSince,
			createdAt,
			description,
			serviceTypes,
		};
	}
}
