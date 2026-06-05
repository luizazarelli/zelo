import {
	type RemoveWorkerServiceTypeInputDto,
	removeWorkerServiceTypeInputDto,
} from "@application/use-cases/worker/remove-worker-service-type/remove-worker-service-type.input.dto";
import { RemoveWorkerServiceTypeUseCase } from "@application/use-cases/worker/remove-worker-service-type/remove-worker-service-type.usecase";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class RemoveWorkerServiceTypeController extends BaseController {
	register(http: FastifyInstance): void {
		http.delete(
			"/api/v1/worker/:workerId/service-type/:serviceTypeId",
			async (
				req: FastifyRequest<{ Params: RemoveWorkerServiceTypeInputDto }>,
				reply,
			) => {
				const payload = removeWorkerServiceTypeInputDto.parse(req.params);
				const usecase = container.resolve(RemoveWorkerServiceTypeUseCase);
				await usecase.execute(payload);

				ResponseProvider.sendSuccessResponse(reply, {
					message: "Tipo de serviço removido com sucesso",
				});
			},
		);
	}
}
