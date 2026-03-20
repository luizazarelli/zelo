import { type FastifyInstance } from "fastify";
import type BaseController from "../base.controller.js";

export default class UserRegisterController implements BaseController {
    register(http: FastifyInstance): void {
        http.post("/api/v1/users/register", async (request, response) => {
            response.code(501).send({
                message: "Hello, world!"
            })
        })
    }
}