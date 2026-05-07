import UserEntity from '@domain/entities/user.entity';
import { IHashProvider } from '@domain/providers/hash.provider';
import { INFRA } from '@infra/tokens';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { inject, injectable } from 'tsyringe';
import BaseUsecase from '../../base.usecase';
import { UserAlreadyExists } from '../errors/userAlreadyExists.error';
import { SignUpInputDTO } from './sign-up.input.dto';
import { SignUpOutputDTO } from './sign-up.output.dto';

@injectable()
export class SignUpUseCase implements BaseUsecase<
    SignUpInputDTO,
    SignUpOutputDTO
> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private usersRepository: IUserRepository,
        @inject(INFRA.PROVIDERS.HASH)
        private hashProvider: IHashProvider
    ) {}

    async execute({
        email,
        name: username,
        password,
        phone
    }: SignUpInputDTO): Promise<SignUpOutputDTO> {
        const emailLowercased = email.toLowerCase();
        const emailRegistered =
            await this.usersRepository.findByEmail(emailLowercased);

        if (emailRegistered) {
            throw new UserAlreadyExists();
        }

        const hashedPassword = await this.hashProvider.hash(password);
        const user = UserEntity.create({
            email: emailLowercased,
            password: hashedPassword,
            name: username.trim(),
            phone: phone.trim()
        });
        await this.usersRepository.create(user);

        const { createdAt, id, name } = user.props;
        return {
            createdAt,
            id,
            name,
        };
    }
}
