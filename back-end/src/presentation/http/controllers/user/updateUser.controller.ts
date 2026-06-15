import { UpdateUserInputDto } from '@application/use-cases/user/update-user/update-user.input.dto';
import { UpdateUserUsecase } from '@application/use-cases/user/update-user/update-user.usecase';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class UpdateUserController extends BaseController {
    register(http: FastifyInstance): void {
        http.patch('/api/v1/user/:userId', async (request, reply) => {
            const { userId } = request.params as { userId: string };
            const payload = UpdateUserInputDto.parse({ userId, ...(request.body as object) });
            const usecase = container.resolve(UpdateUserUsecase);
            await usecase.execute(payload);

            ResponseProvider.sendSuccessResponse(reply, {
                message: 'Informações atualizadas com sucesso',
            });
        });
    }
}
