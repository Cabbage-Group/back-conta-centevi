import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadFilesModule } from './upload-files/upload-files.module';
import { ConfigModule } from '@nestjs/config';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ChatModule } from './modules/chat/chat.module';
import { UploadModule } from './modules/chat/upload/upload.module';



@Module({
  imports: [ConfigModule.forRoot() ,UploadFilesModule, UsuariosModule, PacientesModule, ChatModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
  exports:[ConfigModule],
})
export class AppModule {}
