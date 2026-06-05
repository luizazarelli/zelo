import { ApplicationError } from "@application/use-cases/_errors/applicationError";

export class InvalidRefreshToken extends ApplicationError {
	constructor() {
		super("Refresh token inválido ou expirado", 400);
	}
}
