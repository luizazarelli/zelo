import { SendMessageInputDto } from '@application/use-cases/message/send-message/send-message.input.dto';
import { SendMessageUsecase } from '@application/use-cases/message/send-message/send-message.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class SendMessageController extends BaseController {
    register(http: FastifyInstance): void {
        http.post('/api/v1/hire/:hireId/message', { preHandler: authMiddleware.auth }, async (request, reply) => {
            const { hireId } = request.params as { hireId: string };
            const payload = SendMessageInputDto.parse({ hireId, ...(request.body as object) });
            const usecase = container.resolve(SendMessageUsecase);
            const result = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                code: 201,
                message: 'Mensagem enviada com sucesso',
                data: result,
            });
        });
    }
}
