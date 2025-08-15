import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload-files')
export class UploadFilesController {
  constructor(private readonly uploadFileService: UploadFilesService) {}

  @Post('agrupar-fecha-referencia')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async agruparFechaReferencia(@UploadedFile() file: Express.Multer.File) {
    const filename = await this.uploadFileService.agrupamientoExcel(file.path);
    return {
      downloadLink: `${process.env.IP}/upload-files/download/${filename}`,
    };
  }

  @Post('agrupar-fecha-referencia-anterior')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async agruparFechaReferenciaAnterior(
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filename = await this.uploadFileService.agrupamientoExcelAnterior(
      file.path,
    );
    return {
      downloadLink: `${process.env.IP}/upload-files/download/${filename}`,
    };
  }

  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res) {
    return res.download(`uploads/${filename}`);
  }
}
