import "reflect-metadata";
import { Config } from "./common/env.config.js";
import HttpRegisterControllers from "./presentation/http/registerControllers.js";

(async () => {
	console.log(`🛜 App starting on: ${Config.env.NODE_ENV} mode`);
	new HttpRegisterControllers();
	console.log(`✅ App started successfully!`);
})();
