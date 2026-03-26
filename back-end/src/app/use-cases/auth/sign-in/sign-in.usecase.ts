import BaseUsecase from '@application/use-cases/base.usecase';
import { ApplicationError } from '@common/errors/applicationError';
import { IUserRepository } from '@domain/repositories/user.repository';
import { REPOSITORIES } from '@infra/persistence/repositories/tokens';
import { inject } from 'tsyringe';
import { SignInInputDTO } from './sign-in.input.dto';
import { SignInOutputDTO } from './sign-in.output.dto';

export class SignInUsecase implements BaseUsecase<
    SignInInputDTO,
    SignInOutputDTO
> {
    constructor(
        @inject(REPOSITORIES.USER)
        private userRepository: IUserRepository
    ) {}

    async execute(input: SignInInputDTO): Promise<SignInOutputDTO> {
        throw new ApplicationError('not implement');
    }
}
