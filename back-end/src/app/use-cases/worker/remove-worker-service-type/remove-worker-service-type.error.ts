import { ApplicationError } from "@application/use-cases/_errors/applicationError";

export class WorkerDoesNotHaveTheServiceTypeRegistered extends ApplicationError {
    constructor() {
        super("O trabalhador não tem o tipo de serviço cadastrado")
    }
}