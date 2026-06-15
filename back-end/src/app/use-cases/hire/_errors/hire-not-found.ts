import { ApplicationError } from '@application/use-cases/_errors/applicationError';

export class HireNotFound extends ApplicationError {
    constructor() {
        super('Contratação não encontrada', 404);
    }
}
