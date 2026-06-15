import { UpdateHireStatusInputDto } from '@application/use-cases/hire/update-hire-status/update-hire-status.input.dto';
import { UpdateHireStatusUsecase } from '@application/use-cases/hire/update-hire-status/update-hire-status.usecase';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class UpdateHireStatusController extends BaseController {
    register(http: FastifyInstance): void {
        http.patch('/api/v1/hire/:hireId/status', async (request, reply) => {
            const { hireId } = request.params as { hireId: string };
            const payload = UpdateHireStatusInputDto.parse({ hireId, ...(request.body as object) });
            const usecase = container.resolve(UpdateHireStatusUsecase);
            await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Status da contratação atualizado com sucesso',
            });
        });
    }
}
