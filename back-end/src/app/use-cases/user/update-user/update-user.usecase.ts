import { UserNotFound } from '@application/use-cases/_errors/userNotFound.error';
import type BaseUsecase from '@application/use-cases/base.usecase';
import UserEntity from '@domain/entities/user.entity';
import type { IUserRepository } from '@domain/repositories/user.repository';
import { INFRA } from '@infra/tokens';
import { inject, injectable } from 'tsyringe';
import type { UpdateUserInputDto } from './update-user.input.dto';

@injectable()
export class UpdateUserUsecase implements BaseUsecase<UpdateUserInputDto, void> {
    constructor(
        @inject(INFRA.REPOSITORIES.USER)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({ userId, name, phone }: UpdateUserInputDto): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new UserNotFound();

        const updatedUser = UserEntity.restore({
            ...user.props,
            name: name ?? user.props.name,
            phone: phone ?? user.props.phone,
            updatedAt: new Date(),
        });

        await this.userRepository.update(updatedUser);
    }
}
