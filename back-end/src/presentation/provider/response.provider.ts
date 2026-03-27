import { ApplicationError } from '@common/errors/applicationError';
import { DomainError } from '@common/errors/domainError';
import { FastifyReply, FastifyRequest } from 'fastify';
import z, { string, ZodError } from 'zod';

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
            message: string,
            data: data || null,
            meta,
        });
    }

    static sendErrorResponse(
        error: unknown,
        request: FastifyRequest,
        reply: FastifyReply
    ) {
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

        reply.code(code).send({
            success: false,
            error: message,
            data: null,
        });
    }
}
