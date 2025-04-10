"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use('/download', express.static((0, path_1.join)(__dirname, '..', 'uploads')));
    app.enableCors({
        origin: ['http://127.0.0.1:8000', 'https://contabilidad.centevi.digital'],
        methods: 'GET, POST, PUT, DELETE',
        allowedHeaders: 'Content-Type, Authorization, x-requested-with',
    });
    await app.listen(process.env.PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map