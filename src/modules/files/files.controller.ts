import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('download')
export class FilesController {
    @Get(':fileId')
    downloadFile(@Param('fileId') fileId: string, @Res() res: Response) {
        const filePath = `path/to/files/${fileId}`; // Ruta al archivo en el servidor

        // Establece los encabezados CORS en la respuesta
        res.setHeader('Access-Control-Allow-Origin', '*'); // O limita a un origen específico

        // Envía el archivo como respuesta
        res.sendFile(filePath);
    }
}
