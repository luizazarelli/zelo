import { ApplicationError } from "@application/use-cases/_errors/applicationError";

export class UserAlreadyExists extends ApplicationError {
    constructor() {
        super('Credenciais inválidas', 400);
    }
}
