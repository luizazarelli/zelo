import { CreateHireInputDto } from '@application/use-cases/hire/create-hire/create-hire.input.dto';
import { CreateHireUsecase } from '@application/use-cases/hire/create-hire/create-hire.usecase';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class CreateHireController extends BaseController {
    register(http: FastifyInstance): void {
        http.post('/api/v1/hire', async (request, reply) => {
            const payload = CreateHireInputDto.parse(request.body);
            const usecase = container.resolve(CreateHireUsecase);
            const result = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                code: 201,
                message: 'Proposta de contratação criada com sucesso',
                data: result,
            });
        });
    }
}
