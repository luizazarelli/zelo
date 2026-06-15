import { ListHiresInputDto } from '@application/use-cases/hire/list-hires/list-hires.input.dto';
import { ListHiresUsecase } from '@application/use-cases/hire/list-hires/list-hires.usecase';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class ListHiresController extends BaseController {
    register(http: FastifyInstance): void {
        http.get('/api/v1/hire', async (req: FastifyRequest<{ Querystring: Record<string, string> }>, reply) => {
            const payload = ListHiresInputDto.parse(req.query);
            const usecase = container.resolve(ListHiresUsecase);
            const result = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Contratações listadas com sucesso',
                data: result,
            });
        });
    }
}
