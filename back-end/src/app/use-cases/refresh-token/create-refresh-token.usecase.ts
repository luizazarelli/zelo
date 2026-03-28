import { Config } from '@common/env.config';
import { RefreshTokenEntity } from '@domain/entities/refreshToken.entity';
import { IRefreshTokenRepository } from '@domain/repositories/refreshToken.repository';
import { IUserRepository } from '@domain/repositories/user.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import BaseUsecase from '../base.usecase';
import { UserNotFound } from '../errors/userNotFound.error';
import { CreateRefreshTokenInputDTO } from './create-refresh-token.input.dto';

@injectable()
export class CreateRefreshTokenUsecase implements BaseUsecase<
    CreateRefreshTokenInputDTO,
    RefreshTokenEntity | null
> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private userRepository: IUserRepository,
        @inject(INFRA.REPOSITORIES.REFRESH_TOKEN)
        private refreshTokenRepository: IRefreshTokenRepository
    ) {}

    async execute({
        userId,
    }: CreateRefreshTokenInputDTO): Promise<RefreshTokenEntity | null> {
        const userRegistered = await this.userRepository.findById(userId);
        if (!userRegistered) throw new UserNotFound();

        const refreshTokens = await this.refreshTokenRepository.getByUserId(
            userId,
            false
        );

        if (refreshTokens.length >= Config.env.MAX_SESSIONS) {
            await this.refreshTokenRepository.revokeAllUserTokens(userId);
        }

        const now = new Date();
        const expiresAt = new Date(now.setDate(now.getDate() + 7));
        const refreshToken = RefreshTokenEntity.create({
            userId,
            expiresAt,
        });

        await this.refreshTokenRepository.create(refreshToken);

        return refreshToken;
    }
}
