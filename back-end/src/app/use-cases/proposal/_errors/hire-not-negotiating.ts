import { ApplicationError } from '@application/use-cases/_errors/applicationError'

export class HireNotNegotiating extends ApplicationError {
    constructor() {
        super('Contratação não está em negociação', 422)
    }
}
