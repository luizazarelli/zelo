import { ApplicationError } from '@application/use-cases/_errors/applicationError';
import type BaseUsecase from '@application/use-cases/base.usecase';
import type { WorkerPhotoEntity } from '@domain/entities/workerPhoto.entity';
import type { IWorkerPhotoRepository } from '@domain/repositories/workerPhoto.repository';
import type { IWorkerRepository } from '@domain/repositories/worker.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { ListWorkerPhotosInputDto } from './list-worker-photos.input.dto';

@injectable()
export class ListWorkerPhotosUsecase implements BaseUsecase<ListWorkerPhotosInputDto, WorkerPhotoEntity[]> {
    constructor(
        @inject(INFRA.REPOSITORIES.WORKER)
        private readonly workerRepository: IWorkerRepository,
        @inject(INFRA.REPOSITORIES.WORKER_PHOTO)
        private readonly workerPhotoRepository: IWorkerPhotoRepository,
    ) {}

    async execute({ workerId }: ListWorkerPhotosInputDto): Promise<WorkerPhotoEntity[]> {
        const worker = await this.workerRepository.findById(workerId);
        if (!worker) throw new ApplicationError('Trabalhador não encontrado', 404);
        return this.workerPhotoRepository.findByWorkerId(workerId);
    }
}
