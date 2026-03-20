import { type FastifyInstance, fastify } from "fastify";
import { Glob } from "glob";
import BaseController from "./controllers/base.controller";

export default class HttpRegisterControllers {
    private app: FastifyInstance; 

    constructor(port = 8000) {
        this.app = fastify({
            logger: true, 
        });
        
        this.app.listen({port}, (err, address) => {
            console.error(err)
        })
        
        this.registerRoutes()
    }
    
    private async registerRoutes() {
        const controllers = new Glob("./**/controllers/*/**/*.controller.ts", {ignore: "/node_modules/**"})
        
        for (const controllerFile of controllers) {
            const controllerModule = await import(controllerFile.replace("/src", "./"));
            const controllerClass = controllerModule.default;
            if (!controllerClass) continue; 

            const controllerInstance = new controllerClass() as BaseController;
            controllerInstance.register(this.app);
            console.log(`✅ Loaded controller: ${controllerFile.split("/").pop()}`)
        }
    }
}