import { ApplicationError } from '@common/errors/applicationError';
import { DomainError } from '@common/errors/domainError';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import z, { ZodError } from 'zod';

export class ResponseProvider {
    static sendSuccessResponse(
        res: FastifyReply,
        {
            code,
            message,
            data,
            meta,
        }: { code?: number; message: string; data?: unknown; meta?: unknown }
    ) {
        res.code(code || 200).send({
            success: true,
            message,
            data: data || null,
            meta,
        });
    }

    static sendErrorResponse(
        error: unknown,
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        console.error(error);

        let code = 500;
        let message: string | object = 'Internal server error';
        if (error instanceof DomainError) {
            message = error.message;
        }

        if (error instanceof ApplicationError) {
            ((message = error.message), (code = error.code));
        }

        if (error instanceof ZodError) {
            message = z.treeifyError(error);
        }

        if (ResponseProvider.isFastifyError(error)) {
            code = error.statusCode || 500;
            message = error.message;
        }

        reply.code(code).send({
            success: false,
            error: message,
            data: null,
        });
    }

    private static isFastifyError(error: unknown): error is FastifyError {
        return (
            typeof (error as any).code === 'string' &&
            typeof (error as any).statusCode === 'number'
        )
    }
}
