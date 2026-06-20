import { GetPaymentInputDto } from '@application/use-cases/payment/get-payment/get-payment.input.dto';
import { GetPaymentUsecase } from '@application/use-cases/payment/get-payment/get-payment.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class GetPaymentController extends BaseController {
    register(http: FastifyInstance): void {
        http.get('/api/v1/hire/:hireId/payment', { preHandler: authMiddleware.auth }, async (request, reply) => {
            const { hireId } = request.params as { hireId: string };
            const payload = GetPaymentInputDto.parse({ hireId });
            const usecase = container.resolve(GetPaymentUsecase);
            const result = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Pagamento encontrado',
                data: result,
            });
        });
    }
}
