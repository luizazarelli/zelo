import { CreateWorkerInputDto } from "@application/use-cases/worker/create-worker/create-worker.input.dto";
import { CreateWorkerUsecase } from "@application/use-cases/worker/create-worker/create-worker.usecase";
import { authMiddleware } from "@presentation/http/middleware/auth.middleware";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class CreateWorkerController extends BaseController {
	register(http: FastifyInstance): void {
		http.post(
			"/api/v1/worker",
			{ preHandler: authMiddleware.auth },
			async (req, reply) => {
				const payload = CreateWorkerInputDto.parse(req.body);
				const usecase = container.resolve(CreateWorkerUsecase);
				const result = usecase.execute(payload);

				ResponseProvider.sendSuccessResponse(reply, {
					code: 201,
					message: "Trabalhador cadastrado com sucesso",
					data: result,
				});
			},
		);
	}
}
