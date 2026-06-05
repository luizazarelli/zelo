import type { RefreshTokenEntity } from "@domain/entities/refreshToken.entity";

export interface IRefreshTokenRepository {
	create(refreshToken: RefreshTokenEntity): Promise<void>;
	save(refreshToken: RefreshTokenEntity): Promise<void>;
	getByUserId(
		userId: string,
		isRevoked: boolean,
	): Promise<RefreshTokenEntity[]>;
	getByToken(token: string): Promise<RefreshTokenEntity | null>;
	revokeAllUserTokens(userId: string): Promise<void>;
}
