import { InternalServerError } from "@application/use-cases/_errors/internalServerError.error";
import type BaseUsecase from "@application/use-cases/base.usecase";
import { CreateRefreshTokenUsecase } from "@application/use-cases/refresh-token/create-refresh-token/create-refresh-token.usecase";
import { Config } from "@common/env.config";
import type { IHashProvider } from "@domain/providers/hash.provider";
import type { IJwtProvider } from "@domain/providers/jwt.provider";
import type { IUserRepository } from "@domain/repositories/user.repository";
import { INFRA } from "@infra/tokens";
import type IJwtPayload from "src/@types/JwtPayload";
import { inject, injectable } from "tsyringe";
import { InvalidCredentials } from "../_errors/invalidCredentials.error";
import type { SignInInputDTO } from "./sign-in.input.dto";
import type { SignInOutputDTO } from "./sign-in.output.dto";

@injectable()
export class SignInUsecase
	implements BaseUsecase<SignInInputDTO, SignInOutputDTO>
{
	constructor(
		@inject(INFRA.REPOSITORIES.USER)
		private userRepository: IUserRepository,
		@inject(INFRA.PROVIDERS.HASH)
		private hashProvider: IHashProvider,
		@inject(INFRA.PROVIDERS.JWT)
		private jwtProvider: IJwtProvider<IJwtPayload>,
		@inject(CreateRefreshTokenUsecase)
		private createRefreshTokenUsecase: CreateRefreshTokenUsecase,
	) {}

	async execute({ email, password }: SignInInputDTO): Promise<SignInOutputDTO> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) throw new InvalidCredentials();

		const correctPassword = await this.hashProvider.compare(
			password,
			user.props.password,
		);
		if (!correctPassword) throw new InvalidCredentials();

		const jwt = this.jwtProvider.sign(
			{ id: user.props.id, name: user.props.name },
			Config.env.JWT_SECRET,
		);

		const refreshToken = await this.createRefreshTokenUsecase.execute({
			userId: user.props.id,
		});
		if (!refreshToken) throw new InternalServerError();

		return {
			jwt,
			refreshToken: {
				token: refreshToken?.props.token,
				expiresAt: refreshToken.props.expiresAt,
			},
		};
	}
}
