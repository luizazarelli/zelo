import UserEntity from '@domain/entities/user.entity';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from '../schema';

export class UserMapper {
    static toDomain(user: InferSelectModel<typeof users>): UserEntity {
        return UserEntity.restore(user);
    }

    static toPersistence(user: UserEntity): InferInsertModel<typeof users> {
        return user.props;
    }
}
