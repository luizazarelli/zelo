import { ProcessPaymentInputDto } from '@application/use-cases/payment/process-payment/process-payment.input.dto';
import { ProcessPaymentUsecase } from '@application/use-cases/payment/process-payment/process-payment.usecase';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class ProcessPaymentController extends BaseController {
    register(http: FastifyInstance): void {
        http.post('/api/v1/hire/:hireId/payment', async (request, reply) => {
            const { hireId } = request.params as { hireId: string };
            const payload = ProcessPaymentInputDto.parse({ hireId, ...(request.body as object) });
            const usecase = container.resolve(ProcessPaymentUsecase);
            const result = await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                code: 201,
                message: 'Pagamento processado com sucesso',
                data: result,
            });
        });
    }
}
