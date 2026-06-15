import { ApplicationError } from '@application/use-cases/_errors/applicationError';

export class PaymentNotFound extends ApplicationError {
    constructor() {
        super('Pagamento não encontrado', 404);
    }
}
