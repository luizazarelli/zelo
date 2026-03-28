import { Config } from '@common/env.config';
import UserEntity from '@domain/entities/user.entity';
import { IRefreshTokenRepository } from '@domain/repositories/refreshToken.repository';
import { IUserRepository } from '@domain/repositories/user.repository';
import { mockRefreshTokenRepository } from 'src/test/mocks/repositories/refreshToken.repository.mock';
import { mockUserRepository } from 'src/test/mocks/repositories/user.repository.mock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateRefreshTokenUsecase } from './create-refresh-token.usecase';

describe('CreateRefreshTokenUsecase', () => {
    let usecase: CreateRefreshTokenUsecase;
    let refreshTokenRepository: IRefreshTokenRepository;
    let userRepository: IUserRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        refreshTokenRepository = mockRefreshTokenRepository();
        userRepository = mockUserRepository();
        usecase = new CreateRefreshTokenUsecase(
            userRepository,
            refreshTokenRepository
        );

        vi.mocked(userRepository.findById).mockResolvedValue(
            UserEntity.create({
                email: 'a@example.com',
                name: 'test',
                password: '123',
            })
        );
    });

    afterEach(() => {
        expect(refreshTokenRepository.getByUserId).toHaveBeenCalledOnce();
    });

    it('Should revoke all tokens if the max amount gets exceded', async () => {
        vi.mocked(refreshTokenRepository.getByUserId).mockResolvedValue(
            new Array(Config.env.MAX_SESSIONS).fill('token')
        );
        await expect(usecase.execute({ userId: '123' })).resolves.not.toThrow();
        expect(
            refreshTokenRepository.revokeAllUserTokens
        ).toHaveBeenCalledOnce();
    });

    it('Create a new refreshToken for the user succesfully', async () => {
        await expect(usecase.execute({ userId: '123' })).resolves.not.toThrow();
    });
});
