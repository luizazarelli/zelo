import { ApplicationError } from "@application/use-cases/_errors/applicationError";
import { DomainError } from "@domain/errors/domainError";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import z, { ZodError } from "zod";

// biome-ignore lint/complexity/noStaticOnlyClass: <>
export class ResponseProvider {
	static sendSuccessResponse(
		res: FastifyReply,
		{
			code,
			message,
			data,
			meta,
		}: { code?: number; message: string; data?: unknown; meta?: unknown },
	) {
		res.code(code || 200).send({
			success: true,
			message,
			data: data || null,
			meta,
		});
	}

	// TODO: add PINO for logging
	static sendErrorResponse(
		error: unknown,
		_: FastifyRequest,
		reply: FastifyReply,
	) {
		console.error(error);

		let code = 500;
		let message: string | object = "Internal server error";
		if (error instanceof ZodError) {
			code = 400;
			message = z.treeifyError(error);
		} else if (error instanceof ApplicationError) {
			code = error.code || 400;
			message = error.message;
		} else if (error instanceof DomainError) {
			code = 422;
			message = error.message;
		} else if (ResponseProvider.isFastifyError(error)) {
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
			typeof (error as any).code === "string" &&
			typeof (error as any).statusCode === "number"
		);
	}
}
