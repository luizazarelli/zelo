import { Config } from '@common/env.config';
import { IRefreshTokenRepository } from '@domain/repositories/refreshToken.repository';
import { IUserRepository } from '@domain/repositories/user.repository';
import { mockUserEntity } from 'src/test/mocks/entities/user.entity.mock';
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

        vi.mocked(userRepository.findById).mockResolvedValue(mockUserEntity());
    });

    afterEach(() => {
        expect(refreshTokenRepository.getByUserId).toHaveBeenCalledOnce();
    });

    it('Should validate user if the skip is false', async () => {
        await expect(usecase.execute({userId: '123', skipUserValidation: false})).resolves.not.toThrow(); 
        expect(userRepository.findById).toHaveBeenCalledOnce();
    });

    it('Should not validate the user if the skip is true', async () => {
        await expect(usecase.execute({userId: '123', skipUserValidation: true})).resolves.not.toThrow(); 
        expect(userRepository.findById).not.toHaveBeenCalled();
    })

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
