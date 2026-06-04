import { UserNotFound } from "@application/use-cases/_errors/userNotFound.error";
import BaseUsecase from "@application/use-cases/base.usecase";
import { WorkerEntity } from "@domain/entities/worker.entity";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IWorkerRepository } from "@domain/repositories/worker.repository";
import { INFRA } from "@infra/tokens";
import { inject, injectable } from "tsyringe";
import { UserIsAlreadyWorker } from "./create-worker.error";
import { CreateWorkerInputDto } from "./create-worker.input.dto";

@injectable()
export class CreateWorkerUsecase implements BaseUsecase<CreateWorkerInputDto, void> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private readonly userRepository: IUserRepository,
        @inject(INFRA.REPOSITORIES.WORKER)
        private readonly workerRepository: IWorkerRepository
    ) {}

    async execute({ userId, description, workingSince }: CreateWorkerInputDto): Promise<void> {
        const userWorker = await this.workerRepository.findById(userId);
        if (userWorker) throw new UserIsAlreadyWorker();

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UserNotFound(); 
        }

        const worker = WorkerEntity.create({
            userId,
            description,
            workingSince,
            serviceTypes: []
        });

        await this.workerRepository.create(worker)
    }
}