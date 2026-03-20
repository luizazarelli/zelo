import type { FastifyInstance } from "fastify";

export default abstract class BaseController {
    abstract register(http: FastifyInstance): void;
}