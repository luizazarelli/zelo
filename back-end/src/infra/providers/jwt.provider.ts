import type { IJwtProvider } from "@domain/providers/jwt.provider";
import jwt from "jsonwebtoken";

export class JwtProviderImpl<Payload extends object>
	implements IJwtProvider<Payload>
{
	private static expiresInDefaultMs = 60 * 1000 * 15;

	sign(payload: Payload, secret: string, expiresIn?: number): string {
		return jwt.sign(payload, secret, {
			expiresIn: expiresIn ?? JwtProviderImpl.expiresInDefaultMs,
		});
	}

	async verify(token: string, secret: string): Promise<Payload> {
		return jwt.verify(token, secret) as Payload;
	}
}
