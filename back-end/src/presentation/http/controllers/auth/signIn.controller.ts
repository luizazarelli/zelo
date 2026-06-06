import { SignInInputDTO } from "@application/use-cases/auth/sign-in/sign-in.input.dto";
import { SignInUsecase } from "@application/use-cases/auth/sign-in/sign-in.usecase";
import { CookieProvider } from "@presentation/provider/cookie.provider";
import { ResponseProvider } from "@presentation/provider/response.provider";
import { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class SignInController implements BaseController {
	register(http: FastifyInstance): void {
		http.post("/api/v1/auth/sign-in", async (req, reply) => {
			const payload = SignInInputDTO.parse(req.body);
			const usecase = container.resolve(SignInUsecase);
			const data = await usecase.execute(payload);

			CookieProvider.setCookie({
				reply,
				key: "refreshToken",
				data: data.refreshToken.token,
				expiresAt: data.refreshToken.expiresAt,
			});

			ResponseProvider.sendSuccessResponse(reply, {
				message: "Login realizado com sucesso",
				data: {
					token: data.jwt,
				},
			});
		});
	}
}
