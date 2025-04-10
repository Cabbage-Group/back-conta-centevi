import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly prisma: PrismaService
  ) { }

  // @Post('get')
  // async finAllUsers(@Body() body: { id_usuario: number }) {
  //   console.log("Buscando conversaciones para el usuario con ID:", body.id_usuario);
  //   return this.usuariosService.getUsersWithMessages(body.id_usuario);
  // }

  // @Post('get')
  // async finAllUsers(@Body() body: { id_usuario: number }) {
  //   console.log("Buscando conversaciones para el usuario con ID:", body.id_usuario);
  //   return this.usuariosService.getUsersOrderedByLastConversationPrismaNative(body.id_usuario);
  // }


  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
