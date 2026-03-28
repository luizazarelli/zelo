import { HashProviderImpl } from '@infra/providers/hash.provider';
import { container } from 'tsyringe';
import { RefreshTokenImpl } from './persistence/repositories/refreshToken.repository';
import UserRepositoryImpl from './persistence/repositories/user.repository';
import { JwtProviderImpl } from './providers/jwt.provider';

export const INFRA = {
    REPOSITORIES: {
        USER: UserRepositoryImpl,
        REFRESH_TOKEN: RefreshTokenImpl,
    },
    PROVIDERS: {
        HASH: HashProviderImpl,
        JWT: JwtProviderImpl,
    },
};

for (const type in INFRA) {
    for (const [key, impl] of Object.entries(
        INFRA[type as keyof typeof INFRA]
    )) {
        container.register(key, impl);
    }
}
