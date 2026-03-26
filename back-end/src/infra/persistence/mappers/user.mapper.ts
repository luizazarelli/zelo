import UserEntity from '@domain/entities/user.entity';
import { InferSelectModel } from 'drizzle-orm';
import { users } from '../schema';

export class UserMapper {
    static toDomain(user: InferSelectModel<typeof users>): UserEntity {
        return UserEntity.restore(user);
    }

    static toPersistence(user: UserEntity): InferSelectModel<typeof users> {
        return user.props;
    }
}
