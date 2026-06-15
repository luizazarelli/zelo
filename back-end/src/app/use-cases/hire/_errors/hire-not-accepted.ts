import { ApplicationError } from '@application/use-cases/_errors/applicationError';

export class HireNotAccepted extends ApplicationError {
    constructor() {
        super('A contratação precisa estar aceita para prosseguir', 422);
    }
}
