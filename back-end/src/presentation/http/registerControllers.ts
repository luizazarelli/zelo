import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { type FastifyInstance, fastify } from 'fastify';
import { Glob } from 'glob';
import path from 'path';
import { ResponseProvider } from '../provider/response.provider';
import BaseController from './controllers/base.controller';

export default class HttpRegisterControllers {
    private app: FastifyInstance;

    constructor(port = 8000) {
        this.app = fastify({
            logger: true,
        });

        this.app.register(fastifyCookie);
        this.app.register(fastifyMultipart, { limits: { fileSize: 5 * 1024 * 1024 } });
        this.app.register(fastifyStatic, {
            root: path.join(process.cwd(), 'uploads'),
            prefix: '/uploads/',
        });

        this.app.addHook('onRequest', (request, reply, done) => {
            reply.header('Access-Control-Allow-Origin', '*');
            reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            if (request.method === 'OPTIONS') {
                reply.status(200).send();
                return;
            }
            done();
        });

        this.app.listen({ port, host: '0.0.0.0' }, (error, address) => {});
        this.app.setErrorHandler(ResponseProvider.sendErrorResponse);
        this.registerRoutes();
    }

    private async registerRoutes() {
        const controllers = new Glob('./**/controllers/*/**/*.controller.ts', {
            ignore: '/node_modules/**',
        });

        for (const controllerFile of controllers) {
            const controllerModule = await import(
                controllerFile.replace('/src', './')
            );
            const controllerClass = controllerModule.default;
            if (!controllerClass) continue;

            const controllerInstance = new controllerClass() as BaseController;
            controllerInstance.register(this.app);
            console.log(
                `✅ Loaded controller: ${controllerFile.split('/').pop()}`
            );
        }
    }
}
