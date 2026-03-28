import { RefreshTokenEntity } from '@domain/entities/refreshToken.entity';

export interface IRefreshTokenRepository {
    create(refreshToken: RefreshTokenEntity): Promise<void>;
    save(refreshToken: RefreshTokenEntity): Promise<void>;
    getByUserId(
        userId: string,
        isRevoked: boolean
    ): Promise<RefreshTokenEntity[]>;
    revokeAllUserTokens(userId: string): Promise<void>;
}
