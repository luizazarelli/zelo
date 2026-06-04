import { ApplicationError } from "@application/use-cases/_errors/applicationError";

export class WorkerNotFound extends ApplicationError {
    constructor() {
        super("O trabalhador não foi encontrado");
    }
}