import { UploadWorkerPhotoUsecase } from '@application/use-cases/worker-photo/upload-worker-photo.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class UploadWorkerPhotoController extends BaseController {
    register(http: FastifyInstance): void {
        http.post(
            '/api/v1/worker/:workerId/photo',
            { preHandler: authMiddleware.auth },
            async (request, reply) => {
                const { workerId } = request.params as { workerId: string };
                const data = await request.file();
                if (!data) {
                    return ResponseProvider.sendErrorResponse(
                        { message: 'Nenhum arquivo enviado', statusCode: 400 } as never,
                        request,
                        reply,
                    );
                }

                const fileBuffer = await data.toBuffer();
                const usecase = container.resolve(UploadWorkerPhotoUsecase);
                const result = await usecase.execute({
                    workerId,
                    fileBuffer,
                    originalName: data.filename,
                });

                ResponseProvider.sendSuccessResponse(reply, {
                    code: 201,
                    message: 'Foto adicionada com sucesso',
                    data: result,
                });
            },
        );
    }
}
