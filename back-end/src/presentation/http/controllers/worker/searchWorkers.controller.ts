import {
	type SearchWorkersInputDto,
	searchWorkersInputDto,
} from "@application/use-cases/worker/search-workers/search-workers.input.dto";
import { SearchWorkersUseCase } from "@application/use-cases/worker/search-workers/search-workers.usecase";
import { ResponseProvider } from "@presentation/provider/response.provider";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class SearchWorkersController extends BaseController {
	register(http: FastifyInstance): void {
		http.get(
			"/api/v1/worker",
			async (
				req: FastifyRequest<{ Querystring: SearchWorkersInputDto }>,
				reply,
			) => {
				const payload = searchWorkersInputDto.parse(req.query);
				const usecase = container.resolve(SearchWorkersUseCase);
				const result = await usecase.execute(payload);

				ResponseProvider.sendSuccessResponse(reply, {
					message: "Trabalhadores encontrados com sucesso",
					data: result,
				});
			},
		);
	}
}
