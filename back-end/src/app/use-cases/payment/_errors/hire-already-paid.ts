import { ApplicationError } from '@application/use-cases/_errors/applicationError';

export class HireAlreadyPaid extends ApplicationError {
    constructor() {
        super('Esta contratação já possui um pagamento registrado', 422);
    }
}
