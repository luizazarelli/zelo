import { ServiceTypeEntity } from "@domain/entities/serviceType.entity";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { serviceType } from "../schema";

export class ServiceTypeMapper {
    static toDomain(model: InferSelectModel<typeof serviceType>): ServiceTypeEntity {
        const { description, name, id } = model; 
        return ServiceTypeEntity.restore({
            id, name, description
        })
    }

    static toPersistence(domain: ServiceTypeEntity): InferInsertModel<typeof serviceType> {
        const {id, name, description} = domain.props;

        return {
            id, name, description
        }
    }
}