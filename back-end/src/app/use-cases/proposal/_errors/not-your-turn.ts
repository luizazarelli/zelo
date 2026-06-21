import { ApplicationError } from '@application/use-cases/_errors/applicationError'

export class NotYourTurn extends ApplicationError {
    constructor() {
        super('Não é sua vez de propor', 409)
    }
}
