import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error';
import { UploadUserPhotoUsecase } from '@application/use-cases/user/upload-user-photo/upload-user-photo.usecase';
import type { IUserRepository } from '@domain/repositories/user.repository';
import { mockUserEntity } from '@test/mocks/entities/user.entity.mock';
import { mockUserRepository } from '@test/mocks/repositories/user.repository.mock';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('fs/promises', () => ({
    mkdir: vi.fn(),
    unlink: vi.fn(),
    writeFile: vi.fn(),
}));

describe('UploadUserPhotoUsecase - testes de unidade', () => {
    let userRepository: IUserRepository;
    let usecase: UploadUserPhotoUsecase;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(unlink).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        userRepository = mockUserRepository();
        usecase = new UploadUserPhotoUsecase(userRepository);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('deve falhar quando o usuario nao existe', async () => {
        vi.mocked(userRepository.findById).mockResolvedValue(null);

        await expect(
            usecase.execute({
                userId: '550e8400-e29b-41d4-a716-446655440000',
                fileBuffer: Buffer.from('foto'),
                originalName: 'perfil.png',
            }),
        ).rejects.toThrow(UserNotFound);

        expect(writeFile).not.toHaveBeenCalled();
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('deve salvar a foto e atualizar o usuario', async () => {
        const user = mockUserEntity();
        const fileBuffer = Buffer.from('foto');
        vi.mocked(userRepository.findById).mockResolvedValue(user);
        vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

        const result = await usecase.execute({
            userId: user.props.id,
            fileBuffer,
            originalName: 'perfil.png',
        });

        const filename = `${user.props.id}-1700000000000.png`;
        const expectedUrl = `/uploads/profiles/${filename}`;
        expect(mkdir).toHaveBeenCalledWith(
            path.join(process.cwd(), 'uploads', 'profiles'),
            { recursive: true },
        );
        expect(writeFile).toHaveBeenCalledWith(
            path.join(process.cwd(), 'uploads', 'profiles', filename),
            fileBuffer,
        );
        expect(userRepository.update).toHaveBeenCalledWith(user);
        expect(user.props.profilePicture).toBe(expectedUrl);
        expect(result.url).toBe(expectedUrl);
    });

    it('deve remover a foto anterior ao salvar a nova', async () => {
        const user = mockUserEntity();
        const oldUrl = '/uploads/profiles/foto-antiga.jpg';
        user.updateProfilePicture(oldUrl);
        vi.mocked(userRepository.findById).mockResolvedValue(user);

        await usecase.execute({
            userId: user.props.id,
            fileBuffer: Buffer.from('nova-foto'),
            originalName: 'nova-foto.jpg',
        });

        expect(unlink).toHaveBeenCalledWith(path.join(process.cwd(), oldUrl));
        expect(user.props.profilePicture).not.toBe(oldUrl);
    });
});
