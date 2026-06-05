import { InternalServerError } from "@application/use-cases/_errors/internalServerError.error";
import { UserNotFound } from "@application/use-cases/_errors/userNotFound.error";
import type BaseUsecase from "@application/use-cases/base.usecase";
import { Config } from "@common/env.config";
import type { IJwtProvider } from "@domain/providers/jwt.provider";
import type { IRefreshTokenRepository } from "@domain/repositories/refreshToken.repository";
import type { IUserRepository } from "@domain/repositories/user.repository";
import { INFRA } from "@infra/tokens";
import type IJwtPayload from "src/@types/JwtPayload";
import { inject, injectable } from "tsyringe";
import { CreateRefreshTokenUsecase } from "../../refresh-token/create-refresh-token/create-refresh-token.usecase";
import type { RenewAuthTokensOutputDto } from "./renew-auth-token-output.dto";
import { InvalidRefreshToken } from "./renew-auth-token.error";
import type { RenewAuthTokenInputDto } from "./renew-auth-token.input.dto";

@injectable()
export class RenewAuthTokenUseCase
	implements BaseUsecase<RenewAuthTokenInputDto, RenewAuthTokensOutputDto>
{
	constructor(
		@inject(INFRA.REPOSITORIES.REFRESH_TOKEN)
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		@inject(CreateRefreshTokenUsecase)
		private readonly createRefreshTokenUsecase: CreateRefreshTokenUsecase,
		@inject(INFRA.PROVIDERS.JWT)
		private readonly jwtProvider: IJwtProvider<IJwtPayload>,
		@inject(INFRA.REPOSITORIES.USER)
		private readonly userRepository: IUserRepository,
	) {}

	async execute({
		refreshToken: userRefreshToken,
	}: RenewAuthTokenInputDto): Promise<RenewAuthTokensOutputDto> {
		const refreshToken =
			await this.refreshTokenRepository.getByToken(userRefreshToken);
		if (!refreshToken) throw new InvalidRefreshToken();

		if (refreshToken.isExpiredOrRevoked()) {
			throw new InvalidRefreshToken();
		}

		const user = await this.userRepository.findById(refreshToken.props.userId);
		if (!user) {
			throw new UserNotFound();
		}

		const newRefreshToken = await this.createRefreshTokenUsecase.execute({
			userId: refreshToken.props.userId,
			skipUserValidation: true,
		});
		if (!newRefreshToken) throw new InternalServerError();

		// invalidate old refresh token
		refreshToken.revoke();
		await this.refreshTokenRepository.save(refreshToken);

		const jwt = this.jwtProvider.sign(
			{ id: user.props.id, name: user.props.name },
			Config.env.JWT_SECRET,
		);

		return {
			jwt,
			refreshToken: {
				token: newRefreshToken.props.token,
				expiresAt: newRefreshToken.props.expiresAt,
			},
		};
	}
}
