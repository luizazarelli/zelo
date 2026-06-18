import { IHashProvider } from '@domain/providers/hash.provider';
import { IUserRepository } from '@domain/repositories/user.repository';
import { mockUserEntity } from '@test/mocks/entities/user.entity.mock';
import { mockHashProvider } from '@test/mocks/providers/hash.provider';
import { mockUserRepository } from '@test/mocks/repositories/user.repository.mock';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserAlreadyExists } from '@application/use-cases/auth/_errors/userAlreadyExists.error';
import { SignUpInputDTO } from '@application/use-cases/auth/sign-up/sign-up.input.dto';
import { SignUpUseCase } from '@application/use-cases/auth/sign-up/sign-up.usecase';

describe('SignUpUsecase', () => {
    let userRepository: IUserRepository;
    let hashProvider: IHashProvider;
    let useCase: SignUpUseCase;

    beforeEach(() => {
        vi.clearAllMocks();

        userRepository = mockUserRepository();
        hashProvider = mockHashProvider();
        useCase = new SignUpUseCase(userRepository, hashProvider);
    });

    afterAll(() => {
        expect(userRepository.findByEmail).toHaveBeenCalledOnce();
    });

    const input: SignUpInputDTO = {
        email: 'a@example.com',
        name: 'abc',
        password: '123',
        phone: '+554300000000'
    };

    it('should throw if an account with same email exists', async () => {
        vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserEntity());
        await expect(useCase.execute(input)).rejects.toThrow(UserAlreadyExists);
    });

    it('should create a new user successfully', async () => {
        vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
        await expect(useCase.execute(input)).resolves.not.toThrow();
        expect(userRepository.create).toHaveBeenCalledOnce();
    });
});
