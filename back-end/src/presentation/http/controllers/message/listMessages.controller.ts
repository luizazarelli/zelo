import { ListMessagesInputDto } from '@application/use-cases/message/list-messages/list-messages.input.dto';
import { ListMessagesUsecase } from '@application/use-cases/message/list-messages/list-messages.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class ListMessagesController extends BaseController {
    register(http: FastifyInstance): void {
        http.get('/api/v1/hire/:hireId/message', { preHandler: authMiddleware.auth }, async (req: FastifyRequest<{ Querystring: Record<string, string> }>, reply) => {
            const { hireId } = req.params as { hireId: string };
            const payload = ListMessagesInputDto.parse({ hireId, ...req.query });
            const usecase = container.resolve(ListMessagesUsecase);
            const result = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Mensagens listadas com sucesso',
                data: result,
            });
        });
    }
}
