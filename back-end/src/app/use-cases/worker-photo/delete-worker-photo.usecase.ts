import { ApplicationError } from '@application/use-cases/_errors/applicationError';
import type BaseUsecase from '@application/use-cases/base.usecase';
import type { IWorkerPhotoRepository } from '@domain/repositories/workerPhoto.repository';
import { INFRA } from '@infra/tokens';
import { unlink } from 'fs/promises';
import path from 'path';
import { inject, injectable } from 'tsyringe';
import type { DeleteWorkerPhotoInputDto } from './delete-worker-photo.input.dto';

@injectable()
export class DeleteWorkerPhotoUsecase implements BaseUsecase<DeleteWorkerPhotoInputDto, void> {
    constructor(
        @inject(INFRA.REPOSITORIES.WORKER_PHOTO)
        private readonly workerPhotoRepository: IWorkerPhotoRepository,
    ) {}

    async execute({ photoId, workerId }: DeleteWorkerPhotoInputDto): Promise<void> {
        const photo = await this.workerPhotoRepository.findById(photoId);
        if (!photo) throw new ApplicationError('Foto não encontrada', 404);
        if (photo.props.workerId !== workerId) throw new ApplicationError('Não autorizado', 403);

        const filePath = path.join(process.cwd(), photo.props.url);
        unlink(filePath).catch(() => {});

        await this.workerPhotoRepository.delete(photoId);
    }
}
