import { ApplicationError } from 'src/common/errors/applicationError';

export class UserAlreadyExists extends ApplicationError {
    constructor() {
        super('Este e-mail já está vinculado a uma conta');
    }
}
