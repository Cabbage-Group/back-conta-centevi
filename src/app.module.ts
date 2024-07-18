import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadFilesModule } from './upload-files/upload-files.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot() ,UploadFilesModule],
  controllers: [AppController],
  providers: [AppService],
  exports:[ConfigModule],
})
export class AppModule {}
