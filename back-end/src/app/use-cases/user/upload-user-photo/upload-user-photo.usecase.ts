import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error';
import type BaseUsecase from '@application/use-cases/base.usecase';
import type { IUserRepository } from '@domain/repositories/user.repository';
import { INFRA } from '@infra/tokens';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { inject, injectable } from 'tsyringe';
import type { UploadUserPhotoInputDto } from './upload-user-photo.input.dto';

interface UploadUserPhotoOutput {
    url: string;
}

@injectable()
export class UploadUserPhotoUsecase implements BaseUsecase<UploadUserPhotoInputDto, UploadUserPhotoOutput> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({ userId, fileBuffer, originalName }: UploadUserPhotoInputDto): Promise<UploadUserPhotoOutput> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new UserNotFound();

        const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
        await mkdir(uploadsDir, { recursive: true });

        const ext = path.extname(originalName) || '.jpg';
        const filename = `${userId}-${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        await writeFile(filePath, fileBuffer);

        const oldUrl = user.props.profilePicture;
        if (oldUrl) {
            const oldFilePath = path.join(process.cwd(), oldUrl);
            unlink(oldFilePath).catch(() => {});
        }

        const url = `/uploads/profiles/${filename}`;
        user.updateProfilePicture(url);
        await this.userRepository.update(user);

        return { url };
    }
}
