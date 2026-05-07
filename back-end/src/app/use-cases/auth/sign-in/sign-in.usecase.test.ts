import { IHashProvider } from '@domain/providers/hash.provider';
import { IJwtProvider } from '@domain/providers/jwt.provider';
import { IUserRepository } from '@domain/repositories/user.repository';
import IJwtPayload from 'src/@types/JwtPayload';
import { mockUserEntity } from 'src/test/mocks/entities/user.entity.mock';
import { mockHashProvider } from 'src/test/mocks/providers/hash.provider';
import { mockJwtProvider } from 'src/test/mocks/providers/jwt.provider';
import { mockUserRepository } from 'src/test/mocks/repositories/user.repository.mock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidCredentials } from '../errors/invalidCredentials.error';
import { SignInInputDTO } from './sign-in.input.dto';
import { SignInUsecase } from './sign-in.usecase';

describe('SignInUsecase', () => {
    let useCase: SignInUsecase;
    let userRepository: IUserRepository;
    let hashProvider: IHashProvider;
    let jwtProvider: IJwtProvider<IJwtPayload>;
    let createRefreshTokenUsecase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        userRepository = mockUserRepository();
        hashProvider = mockHashProvider();
        jwtProvider = mockJwtProvider();
        createRefreshTokenUsecase = { execute: vi.fn() };
        useCase = new SignInUsecase(
            userRepository,
            hashProvider,
            jwtProvider,
            createRefreshTokenUsecase
        );
    });

    afterEach(() => {
        expect(userRepository.findByEmail).toHaveBeenCalledOnce();
    });

    const input: SignInInputDTO = {
        email: 'a@example.com',
        password: '123',
    };

    it('should throw if the email is not registered', async () => {
        vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow(
            InvalidCredentials
        );
        expect(userRepository.findByEmail).toHaveBeenCalledOnce();
    });

    it('should throw if the password is wrong', async () => {
        vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserEntity());
        vi.mocked(hashProvider.compare).mockResolvedValue(false);

        await expect(useCase.execute(input)).rejects.toThrow(
            InvalidCredentials
        );
    });

    it('should log in the user in succesfully', async () => {
        vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUserEntity());
        vi.mocked(hashProvider.compare).mockResolvedValue(true);
        vi.mocked(createRefreshTokenUsecase.execute).mockResolvedValue({
            props: { token: 'refresh-token-123' },
        });

        await expect(useCase.execute(input)).resolves.not.toThrow();
        expect(hashProvider.compare).toHaveBeenCalledWith(
            input.password,
            'hashed-123'
        );
    });
});
