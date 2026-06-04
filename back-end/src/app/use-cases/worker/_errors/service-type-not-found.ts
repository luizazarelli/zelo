import { ApplicationError } from "@application/use-cases/_errors/applicationError";

export class ServiceTypeNotFound extends ApplicationError {
    constructor() {
        super("O tipo de serviço não foi encontrado");
    }
}