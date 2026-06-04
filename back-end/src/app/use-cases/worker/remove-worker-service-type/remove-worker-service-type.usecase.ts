import BaseUsecase from "@application/use-cases/base.usecase";
import { IServiceTypeRepository } from "@domain/repositories/serviceType.repository";
import { IWorkerRepository } from "@domain/repositories/worker.repository";
import { INFRA } from "@infra/tokens";
import { inject, injectable } from "tsyringe";
import { ServiceTypeNotFound } from "../_errors/service-type-not-found";
import { WorkerNotFound } from "../_errors/worker-not-found";
import { RemoveWorkerServiceTypeInputDto } from "./remove-worker-service-type.input.dto";

@injectable()
export class RemoveWorkerServiceTypeUseCase implements BaseUsecase<RemoveWorkerServiceTypeInputDto, void> {
    constructor(
        @inject(INFRA.REPOSITORIES.WORKER)
        private readonly workerRepository: IWorkerRepository,
        @inject(INFRA.REPOSITORIES.SERVICE_TYPE)
        private readonly serviceType: IServiceTypeRepository
    ) {}

    async execute({serviceTypeId, workerId}: RemoveWorkerServiceTypeInputDto): Promise<void> {
        const [worker, serviceType] = await Promise.all([
            this.workerRepository.findById(workerId),
            this.serviceType.findById(serviceTypeId)
        ])
        if (!worker) throw new WorkerNotFound();
        if (!serviceType) throw new ServiceTypeNotFound();
        
        worker.removeServiceType(serviceType);
        await this.workerRepository.save(worker)
    }
}