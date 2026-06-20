import { UploadUserPhotoUsecase } from '@application/use-cases/user/upload-user-photo/upload-user-photo.usecase';
import { authMiddleware } from '@presentation/http/middleware/auth.middleware';
import { ResponseProvider } from '@presentation/provider/response.provider';
import type { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import BaseController from '../base.controller';

export default class UploadUserPhotoController extends BaseController {
    register(http: FastifyInstance): void {
        http.post(
            '/api/v1/user/:userId/photo',
            { preHandler: authMiddleware.auth },
            async (request, reply) => {
                const { userId } = request.params as { userId: string };
                const data = await request.file();
                if (!data) {
                    return ResponseProvider.sendErrorResponse(
                        { message: 'Nenhum arquivo enviado', statusCode: 400 } as never,
                        request,
                        reply,
                    );
                }

                const fileBuffer = await data.toBuffer();
                const usecase = container.resolve(UploadUserPhotoUsecase);
                const result = await usecase.execute({
                    userId,
                    fileBuffer,
                    originalName: data.filename,
                });

                ResponseProvider.sendSuccessResponse(reply, {
                    message: 'Foto de perfil atualizada com sucesso',
                    data: result,
                });
            },
        );
    }
}
