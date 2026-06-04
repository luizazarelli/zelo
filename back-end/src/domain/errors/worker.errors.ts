import { DomainError } from "./domainError";

export class WorkerServiceTypeAlreadyExists extends DomainError {
    constructor() {
        super("O tipo de serviço já está cadastrado para este trabalhador");
    }
}