import { RefreshTokenEntity } from '@domain/entities/refreshToken.entity';
import { IRefreshTokenRepository } from '@domain/repositories/refreshToken.repository';
import { and, eq } from 'drizzle-orm';
import { db } from '../connection';
import { RefreshTokenMapper } from '../mappers/refreshToken.mapper';
import { refreshTokens } from '../schema';

export class RefreshTokenImpl implements IRefreshTokenRepository {
    async create(refreshToken: RefreshTokenEntity): Promise<void> {
        const values = RefreshTokenMapper.toPersistence(refreshToken);
        await db.insert(refreshTokens).values(values);
    }

    async save(refreshToken: RefreshTokenEntity): Promise<void> {
        const values = RefreshTokenMapper.toPersistence(refreshToken);
        await db.insert(refreshTokens).values(values);
    }

    async getByUserId(
        userId: string,
        isRevoked?: boolean
    ): Promise<RefreshTokenEntity[]> {
        const result = await db
            .select()
            .from(refreshTokens)
            .where(
                and(
                    eq(refreshTokens.userId, userId),
                    isRevoked != undefined
                        ? eq(refreshTokens.isRevoked, isRevoked)
                        : undefined
                )
            );

        return result.map(RefreshTokenMapper.toDomain);
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await db
            .update(refreshTokens)
            .set({ isRevoked: true })
            .where(
                and(
                    eq(refreshTokens.userId, userId),
                    eq(refreshTokens.isRevoked, false)
                )
            );
    }
}
