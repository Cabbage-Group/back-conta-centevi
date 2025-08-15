"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFilesController = void 0;
const common_1 = require("@nestjs/common");
const upload_files_service_1 = require("./upload-files.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let UploadFilesController = class UploadFilesController {
    constructor(uploadFileService) {
        this.uploadFileService = uploadFileService;
    }
    async agruparFechaReferencia(file) {
        const filename = await this.uploadFileService.agrupamientoExcel(file.path);
        return {
            downloadLink: `${process.env.IP}/upload-files/download/${filename}`,
        };
    }
    async agruparFechaReferenciaAnterior(file) {
        const filename = await this.uploadFileService.agrupamientoExcelAnterior(file.path);
        return {
            downloadLink: `${process.env.IP}/upload-files/download/${filename}`,
        };
    }
    downloadFile(filename, res) {
        return res.download(`uploads/${filename}`);
    }
};
exports.UploadFilesController = UploadFilesController;
__decorate([
    (0, common_1.Post)('agrupar-fecha-referencia'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadFilesController.prototype, "agruparFechaReferencia", null);
__decorate([
    (0, common_1.Post)('agrupar-fecha-referencia-anterior'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadFilesController.prototype, "agruparFechaReferenciaAnterior", null);
__decorate([
    (0, common_1.Get)('download/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UploadFilesController.prototype, "downloadFile", null);
exports.UploadFilesController = UploadFilesController = __decorate([
    (0, common_1.Controller)('upload-files'),
    __metadata("design:paramtypes", [upload_files_service_1.UploadFilesService])
], UploadFilesController);
//# sourceMappingURL=upload-files.controller.js.map