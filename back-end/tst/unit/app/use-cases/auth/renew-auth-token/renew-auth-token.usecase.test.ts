import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error';
import { InvalidRefreshToken } from '@application/use-cases/auth/renew-auth-token/renew-auth-token.error';
import { RenewAuthTokenUseCase } from '@application/use-cases/auth/renew-auth-token/renew-auth-token.usecase';
import type { CreateRefreshTokenUsecase } from '@application/use-cases/refresh-token/create-refresh-token/create-refresh-token.usecase';
import { RefreshTokenEntity } from '@domain/entities/refreshToken.entity';
import type { IJwtProvider } from '@domain/providers/jwt.provider';
import type { IRefreshTokenRepository } from '@domain/repositories/refreshToken.repository';
import type { IUserRepository } from '@domain/repositories/user.repository';
import type { IWorkerRepository } from '@domain/repositories/worker.repository';
import type IJwtPayload from 'src/@types/JwtPayload';
import { mockRefreshTokenEntity } from '@test/mocks/entities/refreshToken.entity.mock';
import { mockUserEntity } from '@test/mocks/entities/user.entity.mock';
import { mockJwtProvider } from '@test/mocks/providers/jwt.provider';
import { mockRefreshTokenRepository } from '@test/mocks/repositories/refreshToken.repository.mock';
import { mockUserRepository } from '@test/mocks/repositories/user.repository.mock';
import { mockWorkerRepository } from '@test/mocks/repositories/worker.repository.mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('RenewAuthTokenUseCase - testes de unidade', () => {
    let refreshTokenRepository: IRefreshTokenRepository;
    let createRefreshTokenUsecase: CreateRefreshTokenUsecase;
    let jwtProvider: IJwtProvider<IJwtPayload>;
    let userRepository: IUserRepository;
    let workerRepository: IWorkerRepository;
    let usecase: RenewAuthTokenUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        refreshTokenRepository = mockRefreshTokenRepository();
        createRefreshTokenUsecase = {
            execute: vi.fn(),
        } as unknown as CreateRefreshTokenUsecase;
        jwtProvider = mockJwtProvider<IJwtPayload>();
        userRepository = mockUserRepository();
        workerRepository = mockWorkerRepository();
        usecase = new RenewAuthTokenUseCase(
            refreshTokenRepository,
            createRefreshTokenUsecase,
            jwtProvider,
            userRepository,
            workerRepository,
        );
    });

    it('deve falhar quando o refresh token nao existe', async () => {
        vi.mocked(refreshTokenRepository.getByToken).mockResolvedValue(null);

        await expect(
            usecase.execute({
                refreshToken: '550e8400-e29b-41d4-a716-446655440000',
            }),
        ).rejects.toThrow(InvalidRefreshToken);
    });

    it('deve falhar quando o refresh token esta revogado', async () => {
        const refreshToken = mockRefreshTokenEntity();
        refreshToken.revoke();
        vi.mocked(refreshTokenRepository.getByToken).mockResolvedValue(
            refreshToken,
        );

        await expect(
            usecase.execute({ refreshToken: refreshToken.props.token }),
        ).rejects.toThrow(InvalidRefreshToken);
    });

    it('deve falhar quando o refresh token esta expirado', async () => {
        const refreshToken = RefreshTokenEntity.restore({
            id: '550e8400-e29b-41d4-a716-446655440001',
            token: '550e8400-e29b-41d4-a716-446655440002',
            userId: '550e8400-e29b-41d4-a716-446655440003',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() - 60_000),
            isRevoked: false,
        });
        vi.mocked(refreshTokenRepository.getByToken).mockResolvedValue(
            refreshToken,
        );

        await expect(
            usecase.execute({ refreshToken: refreshToken.props.token }),
        ).rejects.toThrow(InvalidRefreshToken);
    });

    it('deve falhar quando o usuario nao existe', async () => {
        const refreshToken = mockRefreshTokenEntity();
        vi.mocked(refreshTokenRepository.getByToken).mockResolvedValue(
            refreshToken,
        );
        vi.mocked(userRepository.findById).mockResolvedValue(null);

        await expect(
            usecase.execute({ refreshToken: refreshToken.props.token }),
        ).rejects.toThrow(UserNotFound);
    });

    it('deve renovar os tokens com sucesso', async () => {
        const oldRefreshToken = mockRefreshTokenEntity();
        const newRefreshToken = mockRefreshTokenEntity();
        const user = mockUserEntity(oldRefreshToken.props.userId);
        vi.mocked(refreshTokenRepository.getByToken).mockResolvedValue(
            oldRefreshToken,
        );
        vi.mocked(userRepository.findById).mockResolvedValue(user);
        vi.mocked(workerRepository.findById).mockResolvedValue(null);
        vi.mocked(createRefreshTokenUsecase.execute).mockResolvedValue(
            newRefreshToken,
        );
        vi.mocked(jwtProvider.sign).mockReturnValue('jwt-token');

        const result = await usecase.execute({
            refreshToken: oldRefreshToken.props.token,
        });

        expect(result.jwt).toBe('jwt-token');
        expect(result.refreshToken.token).toBe(newRefreshToken.props.token);
        expect(oldRefreshToken.props.isRevoked).toBe(true);
        expect(refreshTokenRepository.save).toHaveBeenCalledWith(
            oldRefreshToken,
        );
    });
});
