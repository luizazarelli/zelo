import { ListPreviousHiresInputDto } from '@application/use-cases/hire/list-previous-hires/list-previous-hires.input.dto';
import { ListPreviousHiresUsecase } from '@application/use-cases/hire/list-previous-hires/list-previous-hires.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class ListPreviousHiresController extends BaseController {
    register(http: FastifyInstance): void {
        http.get('/api/v1/hire/previous', { preHandler: authMiddleware.auth }, async (req: FastifyRequest<{ Querystring: Record<string, string> }>, reply) => {
            const payload = ListPreviousHiresInputDto.parse(req.query);
            const usecase = container.resolve(ListPreviousHiresUsecase);
            const result = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Contratações anteriores listadas com sucesso',
                data: result,
            });
        });
    }
}
