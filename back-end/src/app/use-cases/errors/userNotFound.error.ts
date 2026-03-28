import { ApplicationError } from '@common/errors/applicationError';

export class UserNotFound extends ApplicationError {
    constructor() {
        super('Usuário não encontrado', 404);
    }
}
