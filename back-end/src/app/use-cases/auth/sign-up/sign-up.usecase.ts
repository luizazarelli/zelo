import UserEntity from '@domain/entities/user.entity';
import { HashProvider } from 'src/app/providers/hash.provider';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { REPOSITORIES } from 'src/infra/persistence/repositories/tokens';
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
        @inject(REPOSITORIES.USER)
        private usersRepository: IUserRepository
    ) {}

    async execute({
        email,
        name: username,
        password,
    }: SignUpInputDTO): Promise<SignUpOutputDTO> {
        const emailLowercased = email.toLowerCase();
        const emailRegistered =
            await this.usersRepository.findByEmail(emailLowercased);

        if (emailRegistered) {
            throw new UserAlreadyExists();
        }

        const hasher = new HashProvider();
        const hashedPassword = await hasher.hash(password);

        const user = UserEntity.create({
            email: emailLowercased,
            password: hashedPassword,
            name: username.trim(),
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
