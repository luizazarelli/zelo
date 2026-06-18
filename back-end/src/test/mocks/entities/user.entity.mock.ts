import { randomUUID } from 'node:crypto';
import UserEntity from '@domain/entities/user.entity';

export function mockUserEntity(id?: string): UserEntity {
    return UserEntity.restore({
        id: id ?? randomUUID(),
        name: 'example',
        email: 'a@example',
        password: 'hashed-123',
        phone: '+554300000000',
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}
