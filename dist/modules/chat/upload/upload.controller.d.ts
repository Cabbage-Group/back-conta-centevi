import { UploadService } from "./upload.service";
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File): Promise<{
        archivoUrl: string;
        nombreArchivo: string;
        tipoArchivo: string;
    }>;
}
