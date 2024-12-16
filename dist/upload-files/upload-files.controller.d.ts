import { UploadFilesService } from './upload-files.service';
export declare class UploadFilesController {
    private readonly uploadFileService;
    constructor(uploadFileService: UploadFilesService);
    agruparFechaReferencia(file: Express.Multer.File): Promise<{
        downloadLink: string;
    }>;
    downloadFile(filename: string, res: any): any;
}
