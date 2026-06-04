import { createServiceTypeInputDto } from "@application/use-cases/service-type/create-service-type/create-service-type.input.dto";
import { CreateServiceTypeUseCase } from "@application/use-cases/service-type/create-service-type/create-service-type.usecase";
import { ResponseProvider } from "@presentation/provider/response.provider";
import { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import BaseController from "../base.controller";

export default class CreateServiceTypeController extends BaseController {
    register(http: FastifyInstance): void {
        http.post('/api/v1/service-type', async (req, reply) => {
            const payload = createServiceTypeInputDto.parse(req.body);
            const usecase = container.resolve(CreateServiceTypeUseCase);
            const data = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                code: 201, 
                message: "Tipo de serviço criado com sucesso",
                data
            });            
        })
    }
}