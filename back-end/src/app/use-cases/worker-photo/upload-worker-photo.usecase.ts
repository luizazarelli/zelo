import type BaseUsecase from '@application/use-cases/base.usecase';
import { WorkerNotFound } from '@application/use-cases/worker/_errors/worker-not-found';
import type { IWorkerPhotoRepository } from '@domain/repositories/workerPhoto.repository';
import type { IWorkerRepository } from '@domain/repositories/worker.repository';
import { WorkerPhotoEntity } from '@domain/entities/workerPhoto.entity';
import { INFRA } from '@infra/tokens';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { inject, injectable } from 'tsyringe';
import type { UploadWorkerPhotoInputDto } from './upload-worker-photo.input.dto';

interface UploadWorkerPhotoOutput {
    id: string;
    url: string;
    position: number;
}

@injectable()
export class UploadWorkerPhotoUsecase implements BaseUsecase<UploadWorkerPhotoInputDto, UploadWorkerPhotoOutput> {
    constructor(
        @inject(INFRA.REPOSITORIES.WORKER)
        private readonly workerRepository: IWorkerRepository,
        @inject(INFRA.REPOSITORIES.WORKER_PHOTO)
        private readonly workerPhotoRepository: IWorkerPhotoRepository,
    ) {}

    async execute({ workerId, fileBuffer, originalName }: UploadWorkerPhotoInputDto): Promise<UploadWorkerPhotoOutput> {
        const worker = await this.workerRepository.findById(workerId);
        if (!worker) throw new WorkerNotFound();

        const uploadsDir = path.join(process.cwd(), 'uploads', 'workers');
        await mkdir(uploadsDir, { recursive: true });

        const ext = path.extname(originalName) || '.jpg';
        const filename = `${workerId}-${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        await writeFile(filePath, fileBuffer);

        const count = await this.workerPhotoRepository.countByWorkerId(workerId);
        const url = `/uploads/workers/${filename}`;

        const photo = WorkerPhotoEntity.create({ workerId, url, position: count });
        await this.workerPhotoRepository.create(photo);

        return { id: photo.props.id, url, position: photo.props.position };
    }
}
