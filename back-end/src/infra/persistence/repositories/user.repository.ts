import UserEntity from '@domain/entities/user.entity';
import { eq } from 'drizzle-orm';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { injectable } from 'tsyringe';
import { db } from '../connection';
import { UserMapper } from '../mappers/user.mapper';
import { users } from '../schema';

@injectable()
export default class UserRepositoryImpl implements IUserRepository {
    async create(user: UserEntity): Promise<void> {
        const values = UserMapper.toPersistence(user);
        await db.insert(users).values(values);
    }

    async findById(id: string): Promise<UserEntity | null> {
        const user = (
            await db.select().from(users).where(eq(users.id, id))
        )?.[0];

        return user ? UserMapper.toDomain(user) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = (
            await db.select().from(users).where(eq(users.email, email))
        )?.[0];

        return user ? UserMapper.toDomain(user) : null;
    }

    async update(user: UserEntity): Promise<void> {
        const values = UserMapper.toPersistence(user);
        await db.update(users).set(values).where(eq(users.id, user.props.id));
    }
}
