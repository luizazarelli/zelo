import { ApplicationError } from '@common/errors/applicationError';

export class InvalidCredentials extends ApplicationError {
    constructor() {
        super('Credenciais inválidas', 400);
    }
}
