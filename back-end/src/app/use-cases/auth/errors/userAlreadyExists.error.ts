import { ApplicationError } from 'src/common/errors/applicationError';

export class UserAlreadyExists extends ApplicationError {
    constructor() {
        super('Credenciais inválidas', 400);
    }
}
