import UserEntity from '@domain/entities/user.entity';

export function mockUserEntity(): UserEntity {
    return UserEntity.create({
        email: 'a@example',
        name: 'example',
        password: '123',
        phone: '+554300000000'
    });
}
