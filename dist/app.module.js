"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const upload_files_module_1 = require("./upload-files/upload-files.module");
const config_1 = require("@nestjs/config");
const pacientes_module_1 = require("./modules/pacientes/pacientes.module");
const usuarios_module_1 = require("./modules/usuarios/usuarios.module");
const chat_module_1 = require("./modules/chat/chat.module");
const upload_module_1 = require("./modules/chat/upload/upload.module");
const files_controller_1 = require("./modules/files/files.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot(), upload_files_module_1.UploadFilesModule, usuarios_module_1.UsuariosModule, pacientes_module_1.PacientesModule, chat_module_1.ChatModule, upload_module_1.UploadModule],
        controllers: [app_controller_1.AppController, files_controller_1.FilesController],
        providers: [app_service_1.AppService],
        exports: [config_1.ConfigModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map