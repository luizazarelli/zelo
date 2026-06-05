import {
	AddWorkerServiceTypeInputDto,
	addWorkerServiceTypeInputDto,
} from "@application/use-cases/worker/add-worker-service-type/add-worker-service-type.input.dto";
import { AddWorkerServiceTypeUseCase } from "@application/use-cases/worker/add-worker-service-type/add-worker-service-type.usecase";
import { authMiddleware } from "@presentation/http/middleware/auth.middleware";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class AddWorkerServiceTypeController extends BaseController {
	register(http: FastifyInstance): void {
		http.put(
			"/api/v1/worker/:userId/service-type/:serviceTypeId",
			{ preHandler: authMiddleware.auth },
			async (
				req: FastifyRequest<{ Params: AddWorkerServiceTypeInputDto }>,
				reply,
			) => {
				console.log(req.params);
				const payload = addWorkerServiceTypeInputDto.parse(req.params);
				const usecase = container.resolve(AddWorkerServiceTypeUseCase);
				await usecase.execute(payload);

				ResponseProvider.sendSuccessResponse(reply, {
					message: "Tipo de serviço adicionado com sucesso",
				});
			},
		);
	}
}
