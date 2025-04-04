import { Body, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(
    private prismaService: PrismaService
  ) { }


  create(createUsuarioDto: CreateUsuarioDto) {
    return 'This action adds a new usuario';
  }

  async findAll() {
    return await this.prismaService.usuarios.findMany();
  }

  // async getUsuariosWithMessages(id_usuario: number) {
  //   const usuarios = await this.prismaService.usuarios.findMany({
  //     where: {
  //       mensajes: {
  //         some: {
  //           creadoEn: { not: null },
  //         },
  //       },
  //     },
  //     include: {
  //       mensajes: {
  //         orderBy: {
  //           creadoEn: 'desc', // Obtener el mensaje más reciente
  //         },
  //         take: 1, // Solo el último mensaje de cada usuario
  //       },
  //     },
  //     orderBy: {
  //       mensajes: {
  //         _max: {
  //           creadoEn: 'desc', // Ordenar los usuarios por el último mensaje
  //         },
  //       },
  //     },
  //   });

  //   // Aquí puedes reordenar los usuarios para dar preferencia al usuario 118
  //   return usuarios.sort((a, b) => {
  //     if (a.id_usuario === id_usuario) return -1;
  //     if (b.id_usuario === id_usuario) return 1;
  //     return 0;
  //   });
  // }

  async getUsersOrderedByLastConversationPrismaNative(idUsuarioActual: number) {
    // 1. Obtener todas las conversaciones donde participa el usuario actual
    const conversaciones = await this.prismaService.conversaciones.findMany({
      where: {
        OR: [
          { usuario1Id: idUsuarioActual },
          { usuario2Id: idUsuarioActual }
        ]
      },
      include: {
        mensajes: {
          orderBy: {
            creadoEn: 'desc'
          },
          take: 1 // Solo el último mensaje
        }
      }
    });

    // 2. Crear un mapa de usuarios con su última fecha de mensaje
    const usuariosConFecha = new Map();

    for (const conv of conversaciones) {
      // Identificar quién es el otro usuario
      const otroUsuarioId = conv.usuario1Id === idUsuarioActual
        ? conv.usuario2Id
        : conv.usuario1Id;

      // Si hay mensajes y la fecha es más reciente que la que ya teníamos, actualizar
      if (conv.mensajes.length > 0) {
        const fechaMensaje = conv.mensajes[0].creadoEn;

        // Si no hay fecha registrada o esta es más reciente, actualizar
        if (!usuariosConFecha.has(otroUsuarioId) ||
          fechaMensaje > usuariosConFecha.get(otroUsuarioId)) {
          usuariosConFecha.set(otroUsuarioId, fechaMensaje);
        }
      }
    }

    // 3. Obtener todos los usuarios excepto el actual
    const usuarios = await this.prismaService.usuarios.findMany({
      where: {
        NOT: {
          id_usuario: idUsuarioActual
        }
      }
    });

    // 4. Ordenar los usuarios según la fecha de su último mensaje
    return usuarios.sort((a, b) => {
      const fechaA = usuariosConFecha.get(a.id_usuario);
      const fechaB = usuariosConFecha.get(b.id_usuario);

      // Si ambos tienen fecha, ordenar por la más reciente primero
      if (fechaA && fechaB) {
        return fechaB.getTime() - fechaA.getTime();
      }

      // Si solo uno tiene fecha, ese va primero
      if (fechaA) return -1;
      if (fechaB) return 1;

      // Si ninguno tiene fecha, ordenar alfabéticamente
      return a.nombre.localeCompare(b.nombre);
    });
  }





  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
