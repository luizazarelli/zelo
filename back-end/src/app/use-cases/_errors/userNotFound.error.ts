import { ApplicationError } from "./applicationError";

export class UserNotFound extends ApplicationError {
    constructor() {
        super('Usuário não encontrado', 404);
    }
}
