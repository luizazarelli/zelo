import { RefreshTokenEntity } from '@domain/entities/refreshToken.entity';

export function mockRefreshTokenEntity(): RefreshTokenEntity {
    const now = new Date();
    const expiresAt = now.setDate(now.getDate() + 7);
    return RefreshTokenEntity.create({
        expiresAt: new Date(expiresAt),
        userId: '123',
    });
}
