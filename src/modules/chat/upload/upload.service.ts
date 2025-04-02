import { Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

@Injectable()
export class UploadService {
    private uploadPath = "./uploads";

    constructor() {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<{ archivoUrl: string; nombreArchivo: string; tipoArchivo: string }> {
        if (!file) {
            throw new Error("No se recibió ningún archivo.");
        }

        const uniqueFileName = `${uuidv4()}${extname(file.originalname)}`;
        const filePath = `${this.uploadPath}/${uniqueFileName}`;

        fs.writeFileSync(filePath, file.buffer);

        return {
            archivoUrl: `http://127.0.0.1:8000/download/${uniqueFileName}`,
            nombreArchivo: file.originalname,
            tipoArchivo: file.mimetype,
        };
    }

    getStorageConfig() {
        return diskStorage({
            destination: this.uploadPath,
            filename: (req, file, cb) => {
                const uniqueFileName = `${uuidv4()}${extname(file.originalname)}`;
                cb(null, uniqueFileName);
            },
        });
    }
}
