import UserEntity from '@domain/entities/user.entity';
import { IHashProvider } from '@domain/providers/hash.provider';
import { IUserRepository } from '@domain/repositories/user.repository';
import { mockHashProvider } from 'src/test/mocks/providers/hash.provider';
import { mockUserRepository } from 'src/test/mocks/repositories/user.repository.mock';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserAlreadyExists } from '../errors/userAlreadyExists.error';
import { SignUpInputDTO } from './sign-up.input.dto';
import { SignUpUseCase } from './sign-up.usecase';

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
    };

    it('should throw if an account with same email exists', async () => {
        const returnEntity = UserEntity.create({
            email: input.email,
            name: input.name,
            password: input.password,
        });

        vi.mocked(userRepository.findByEmail).mockResolvedValue(returnEntity);
        await expect(useCase.execute(input)).rejects.toThrow(UserAlreadyExists);
    });

    it('should create a new user successfully', async () => {
        vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
        await expect(useCase.execute(input)).resolves.not.toThrow();
        expect(userRepository.create).toHaveBeenCalledOnce();
    });
});
