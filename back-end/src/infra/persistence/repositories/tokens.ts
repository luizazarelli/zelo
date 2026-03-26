import { container } from 'tsyringe';
import UserRepositoryImpl from './user.repository';

export const REPOSITORIES = {
    USER: UserRepositoryImpl,
};

for (const [key, value] of Object.entries(REPOSITORIES)) {
    container.register(key, value);
}
