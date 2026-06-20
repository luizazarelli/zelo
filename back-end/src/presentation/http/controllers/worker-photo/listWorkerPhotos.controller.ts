import { ListWorkerPhotosUsecase } from '@application/use-cases/worker-photo/list-worker-photos.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class ListWorkerPhotosController extends BaseController {
    register(http: FastifyInstance): void {
        http.get('/api/v1/worker/:workerId/photo', { preHandler: authMiddleware.auth }, async (request, reply) => {
            const { workerId } = request.params as { workerId: string };
            const usecase = container.resolve(ListWorkerPhotosUsecase);
            const photos = await usecase.execute({ workerId });

            ResponseProvider.sendSuccessResponse(reply, {
                data: photos.map((p) => ({
                    id: p.props.id,
                    url: p.props.url,
                    position: p.props.position,
                })),
            });
        });
    }
}
