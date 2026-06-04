import { ApplicationError } from "@application/use-cases/_errors/applicationError";

export class InvalidServiceTypeName extends ApplicationError {
    constructor() {
        super("O nome do tipo de serviço não é válido")
    }
}