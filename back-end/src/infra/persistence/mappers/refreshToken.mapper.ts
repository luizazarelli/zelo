import { RefreshTokenEntity } from '@domain/entities/refreshToken.entity';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { refreshTokens } from '../schema';

export class RefreshTokenMapper {
    static toDomain(
        refreshToken: InferSelectModel<typeof refreshTokens>
    ): RefreshTokenEntity {
        return RefreshTokenEntity.restore(refreshToken);
    }

    static toPersistence(
        refreshToken: RefreshTokenEntity
    ): InferInsertModel<typeof refreshTokens> {
        return refreshToken.props;
    }
}
