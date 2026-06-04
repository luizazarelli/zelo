import { ServiceTypeEntity } from "@domain/entities/serviceType.entity";
import { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { INFRA } from "@infra/tokens";
import { inject, injectable } from "tsyringe";
import { InvalidServiceTypeName } from "./create-service-type.error";
import { CreateServiceTypeInputDto } from "./create-service-type.input.dto";
import { CreateServiceTypeOutputDto } from "./create-service-type.output.dto";
import BaseUsecase from "@application/use-cases/base.usecase";

@injectable()
export class CreateServiceTypeUseCase implements BaseUsecase<CreateServiceTypeInputDto, CreateServiceTypeOutputDto> {
    constructor(
        @inject(INFRA.REPOSITORIES.SERVICE_TYPE)
        private readonly serviceTypeRepository: IServiceTypeRepository
    ) {}
    
    async execute({name, description: desc}: CreateServiceTypeInputDto): Promise<CreateServiceTypeOutputDto> {
        const description = !desc ? "": desc;
        const normalizedName = name.trim();
        if (normalizedName.length <= 5)
            throw new InvalidServiceTypeName();
        
        const serviceType = ServiceTypeEntity.create({
            name, 
            description: description || ""
        });

        await this.serviceTypeRepository.create(serviceType)

        return {
            id: serviceType.props.id,
            name, 
            description
        }
    }
}