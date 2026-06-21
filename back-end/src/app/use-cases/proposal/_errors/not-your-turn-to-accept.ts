import { ApplicationError } from '@application/use-cases/_errors/applicationError'

export class NotYourTurnToAccept extends ApplicationError {
    constructor() {
        super('Não é sua vez de aceitar', 409)
    }
}
