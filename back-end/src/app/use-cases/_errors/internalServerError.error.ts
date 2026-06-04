import { ApplicationError } from "./applicationError";

export class InternalServerError extends ApplicationError {
    constructor() {
        super('Um erro desconhecido ocorreu', 500);
    }
}
