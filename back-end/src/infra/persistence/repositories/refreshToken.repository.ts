import type { RefreshTokenEntity } from "@domain/entities/refreshToken.entity";
import type { IRefreshTokenRepository } from "@domain/repositories/refreshToken.repository";
import { and, eq } from "drizzle-orm";
import { db } from "../connection";
import { RefreshTokenMapper } from "../mappers/refreshToken.mapper";
import { refreshTokens } from "../schema";

export class RefreshTokenImpl implements IRefreshTokenRepository {
	async create(refreshToken: RefreshTokenEntity): Promise<void> {
		const values = RefreshTokenMapper.toPersistence(refreshToken);
		await db.insert(refreshTokens).values(values);
	}

	async save(refreshToken: RefreshTokenEntity): Promise<void> {
		const values = RefreshTokenMapper.toPersistence(refreshToken);
		await db
			.update(refreshTokens)
			.set(values)
			.where(eq(refreshTokens.id, refreshToken.props.id));
	}

	async getByUserId(
		userId: string,
		isRevoked?: boolean,
	): Promise<RefreshTokenEntity[]> {
		const result = await db
			.select()
			.from(refreshTokens)
			.where(
				and(
					eq(refreshTokens.userId, userId),
					isRevoked !== undefined
						? eq(refreshTokens.isRevoked, isRevoked)
						: undefined,
				),
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
					eq(refreshTokens.isRevoked, false),
				),
			);
	}

	async getByToken(token: string): Promise<RefreshTokenEntity | null> {
		const [refreshTokenModel] = await db
			.select()
			.from(refreshTokens)
			.where(eq(refreshTokens.token, token));

		return refreshTokenModel
			? RefreshTokenMapper.toDomain(refreshTokenModel)
			: null;
	}
}
