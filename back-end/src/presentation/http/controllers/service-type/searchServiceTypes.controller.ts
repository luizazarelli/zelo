import { SearchServiceTypesUseCase } from "@application/use-cases/service-type/search-service-types/search-service-types.usecase";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class SearchServiceTypesController extends BaseController {
	register(http: FastifyInstance): void {
		http.get("/api/v1/service-type", async (_req, reply) => {
			const usecase = container.resolve(SearchServiceTypesUseCase);
			const data = await usecase.execute({});

			ResponseProvider.sendSuccessResponse(reply, {
				message: "Tipos de serviço encontrados com sucesso",
				data,
			});
		});
	}
}
