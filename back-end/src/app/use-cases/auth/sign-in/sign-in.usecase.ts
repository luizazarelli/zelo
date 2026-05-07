import BaseUsecase from '@application/use-cases/base.usecase';
import { InternalServerError } from '@application/use-cases/errors/internalServerError.error';
import { CreateRefreshTokenUsecase } from '@application/use-cases/refresh-token/create-refresh-token/create-refresh-token.usecase';
import { Config } from '@common/env.config';
import { IHashProvider } from '@domain/providers/hash.provider';
import { IJwtProvider } from '@domain/providers/jwt.provider';
import { IUserRepository } from '@domain/repositories/user.repository';
import { INFRA } from '@infra/tokens';
import IJwtPayload from 'src/@types/JwtPayload';
import { inject, injectable } from 'tsyringe';
import { InvalidCredentials } from '../errors/invalidCredentials.error';
import { SignInInputDTO } from './sign-in.input.dto';
import { SignInOutputDTO } from './sign-in.output.dto';

@injectable()
export class SignInUsecase implements BaseUsecase<
    SignInInputDTO,
    SignInOutputDTO
> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private userRepository: IUserRepository,
        @inject(INFRA.PROVIDERS.HASH)
        private hashProvider: IHashProvider,
        @inject(INFRA.PROVIDERS.JWT)
        private jwtProvider: IJwtProvider<IJwtPayload>,
        @inject(CreateRefreshTokenUsecase)
        private createRefreshTokenUsecase: CreateRefreshTokenUsecase
    ) {}

    async execute({
        email,
        password,
    }: SignInInputDTO): Promise<SignInOutputDTO> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new InvalidCredentials();

        const correctPassword = await this.hashProvider.compare(
            password,
            user.props.password
        );
        if (!correctPassword) throw new InvalidCredentials();

        const expiresInMs = 60 * 60 * 15;
        const jwt = this.jwtProvider.sign(
            { id: user.props.id, name: user.props.name },
            Config.env.JWT_SECRET,
            expiresInMs
        );

        const refreshToken = await this.createRefreshTokenUsecase.execute({
            userId: user.props.id,
        });
        if (!refreshToken) throw new InternalServerError();

        return {
            jwt,
            refreshToken: {
                token: refreshToken?.props.token,
                expiresIn: refreshToken.props.expiresAt,
            },
        };
    }
}
