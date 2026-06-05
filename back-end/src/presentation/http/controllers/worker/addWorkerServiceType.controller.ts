import { addWorkerServiceTypeDto } from "@application/use-cases/worker/add-worker-service-type/add-worker-service-type.input.dto";
import { AddWorkerServiceTypeUseCase } from "@application/use-cases/worker/add-worker-service-type/add-worker-service-type.usecase";
import { authMiddleware } from "@presentation/http/middleware/auth.middleware";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class AddWorkerServiceTypeController extends BaseController {
	register(http: FastifyInstance): void {
		http.patch(
			"/api/v1/worker/service-type",
			{ preHandler: authMiddleware.auth },
			async (req, reply) => {
				const payload = addWorkerServiceTypeDto.parse(req.body);
				const usecase = container.resolve(AddWorkerServiceTypeUseCase);
				await usecase.execute(payload);

				ResponseProvider.sendSuccessResponse(reply, {
					message: "Tipo de serviço adicionado com sucesso",
				});
			},
		);
	}
}
