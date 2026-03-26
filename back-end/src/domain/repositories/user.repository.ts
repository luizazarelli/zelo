import UserEntity from '../entities/user.entity';

export interface IUserRepository {
    create(user: UserEntity): Promise<void>;
    update(user: UserEntity): Promise<void>;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
}
