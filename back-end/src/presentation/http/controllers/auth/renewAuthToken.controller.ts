import { renewAuthTokenInputDto } from "@application/use-cases/auth/renew-auth-token/renew-auth-token.input.dto";
import { RenewAuthTokenUseCase } from "@application/use-cases/auth/renew-auth-token/renew-auth-token.usecase";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import type BaseController from "../base.controller";

export default class RenewAuthTokenController implements BaseController {
	register(http: FastifyInstance): void {
		http.post("/api/v1/auth/refresh-token", async (req, reply) => {
			const payload = renewAuthTokenInputDto.parse(req.body);
			const usecase = container.resolve(RenewAuthTokenUseCase);
			const data = await usecase.execute(payload);

			ResponseProvider.sendSuccessResponse(reply, {
				message: "Token renovado com sucesso",
				data,
			});
		});
	}
}
