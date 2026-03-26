import UserEntity from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository';
import { beforeEach, expect, it, test, vi } from 'vitest';
import { UserAlreadyExists } from '../errors/userAlreadyExists.error';
import { SignUpInputDTO } from './sign-up.input.dto';
import { SignUpUseCase } from './sign-up.usecase';

const mockUserRepo = {
    findByEmail: vi.fn(),
} as unknown as IUserRepository;

test('SignUpUsecase', () => {
    let useCase: SignUpUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new SignUpUseCase(mockUserRepo);
    });

    const input = {
        email: 'a@example.com',
        name: 'abc',
        password: '123',
    } satisfies SignUpInputDTO;

    it('should throw if an account with same email exists', async () => {
        const returnEntity = UserEntity.create({
            email: 'a@example.com',
            name: 'abc',
            password: '123',
        });

        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(returnEntity);
        await expect(useCase.execute(input)).rejects.toThrow(UserAlreadyExists);
    });

    it('should create a new user successfully', async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null);
        await expect(useCase.execute(input)).resolves.not.toThrow();
    });
});
