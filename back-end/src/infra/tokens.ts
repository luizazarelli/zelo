import { HashProviderImpl } from '@infra/providers/hash.provider';
import { container } from 'tsyringe';
import { HireRepositoryImpl } from './persistence/repositories/hire.repository';
import { MessageRepositoryImpl } from './persistence/repositories/message.repository';
import { PaymentRepositoryImpl } from './persistence/repositories/payment.repository';
import { RefreshTokenImpl } from './persistence/repositories/refreshToken.repository';
import { ServiceTypeRepositoryImpl } from './persistence/repositories/serviceType.repository';
import UserRepositoryImpl from './persistence/repositories/user.repository';
import { WorkerPhotoRepositoryImpl } from './persistence/repositories/workerPhoto.repository';
import { WorkerRepositoryImpl } from './persistence/repositories/worker.repository';
import { JwtProviderImpl } from './providers/jwt.provider';

export const INFRA = {
    REPOSITORIES: {
        USER: UserRepositoryImpl,
        REFRESH_TOKEN: RefreshTokenImpl,
        WORKER: WorkerRepositoryImpl,
        WORKER_PHOTO: WorkerPhotoRepositoryImpl,
        SERVICE_TYPE: ServiceTypeRepositoryImpl,
        HIRE: HireRepositoryImpl,
        MESSAGE: MessageRepositoryImpl,
        PAYMENT: PaymentRepositoryImpl,
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
