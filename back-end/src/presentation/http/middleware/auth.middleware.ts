import { ApplicationError } from "@application/use-cases/_errors/applicationError";
import { Config } from "@common/env.config";
import type { IJwtProvider } from "@domain/providers/jwt.provider";
import { INFRA } from "@infra/tokens";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyReply, FastifyRequest } from "fastify";
import type IJwtPayload from "src/@types/JwtPayload";
import { container, inject, injectable } from "tsyringe";

@injectable()
class AuthMiddleware {
	constructor(
		@inject(INFRA.PROVIDERS.JWT)
		private readonly jwtProvider: IJwtProvider<IJwtPayload>,
	) {}

	private unauthorizedResponse(req: FastifyRequest, reply: FastifyReply) {
		ResponseProvider.sendErrorResponse(
			new ApplicationError("Não autorizado", 401),
			req,
			reply,
		);
	}

	auth = async (req: FastifyRequest, reply: FastifyReply) => {
		const sanitazedToken = req.headers.authorization?.trim();
		if (!sanitazedToken || sanitazedToken.length <= 0)
			return this.unauthorizedResponse(req, reply);

		const [porter, jwt] = sanitazedToken.split(" ");
		const sanitazedPorter = porter?.trim();
		const sanitazedJwt = jwt?.trim();

		if (!sanitazedPorter || !sanitazedJwt || sanitazedPorter !== "Bearer")
			return this.unauthorizedResponse(req, reply);

		try {
			await this.jwtProvider.verify(sanitazedJwt, Config.env.JWT_SECRET);
		} catch (_) {
			return this.unauthorizedResponse(req, reply);
		}
	};
}

export const authMiddleware = container.resolve(AuthMiddleware);
