import { DeleteWorkerPhotoUsecase } from '@application/use-cases/worker-photo/delete-worker-photo.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class DeleteWorkerPhotoController extends BaseController {
    register(http: FastifyInstance): void {
        http.delete(
            '/api/v1/worker/:workerId/photo/:photoId',
            { preHandler: authMiddleware.auth },
            async (request, reply) => {
                const { workerId, photoId } = request.params as { workerId: string; photoId: string };
                const usecase = container.resolve(DeleteWorkerPhotoUsecase);
                await usecase.execute({ photoId, workerId });

                ResponseProvider.sendSuccessResponse(reply, {
                    message: 'Foto removida com sucesso',
                });
            },
        );
    }
}
