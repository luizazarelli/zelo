import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error';
import { UpdateUserUsecase } from '@application/use-cases/user/update-user/update-user.usecase';
import type { IUserRepository } from '@domain/repositories/user.repository';
import { mockUserEntity } from '@test/mocks/entities/user.entity.mock';
import { mockUserRepository } from '@test/mocks/repositories/user.repository.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('UpdateUserUsecase - testes de unidade', () => {
    let userRepository: IUserRepository;
    let usecase: UpdateUserUsecase;

    beforeEach(() => {
        vi.clearAllMocks();
        userRepository = mockUserRepository();
        usecase = new UpdateUserUsecase(userRepository);
    });

    it('deve atualizar o nome do usuario', async () => {
        const user = mockUserEntity();
        vi.mocked(userRepository.findById).mockResolvedValue(user);

        await usecase.execute({
            userId: user.props.id,
            name: 'Novo Nome',
        });

        expect(userRepository.update).toHaveBeenCalledOnce();
        const updatedUser = vi.mocked(userRepository.update).mock.lastCall?.[0];
        expect(updatedUser?.props.name).toBe('Novo Nome');
    });

    it('deve atualizar o telefone e manter o nome do usuario', async () => {
        const user = mockUserEntity();
        vi.mocked(userRepository.findById).mockResolvedValue(user);

        await usecase.execute({
            userId: user.props.id,
            phone: '+5543999999999',
        });

        const updatedUser = vi.mocked(userRepository.update).mock.lastCall?.[0];
        expect(updatedUser?.props.phone).toBe('+5543999999999');
        expect(updatedUser?.props.name).toBe(user.props.name);
    });

    it('deve falhar quando o usuario nao existe', async () => {
        vi.mocked(userRepository.findById).mockResolvedValue(null);

        await expect(
            usecase.execute({
                userId: '550e8400-e29b-41d4-a716-446655440000',
                name: 'Novo Nome',
            }),
        ).rejects.toThrow(UserNotFound);

        expect(userRepository.update).not.toHaveBeenCalled();
    });
});
