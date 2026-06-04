import { ApplicationError } from "@application/use-cases/_errors/applicationError";

export class UserIsAlreadyWorker extends ApplicationError {
    constructor() {
        super("O usuário já está registrado como um trabalhador")
    }
}