export declare class UploadService {
    private uploadPath;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<{
        archivoUrl: string;
        nombreArchivo: string;
        tipoArchivo: string;
    }>;
    getStorageConfig(): import("multer").StorageEngine;
}
