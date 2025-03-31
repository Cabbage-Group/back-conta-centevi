import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Emisor } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) { }

  async findConversation(user1Id: number, user2Id: number) {
    return this.prisma.conversaciones.findFirst({
      where: {
        OR: [
          {
            usuario1Id: parseInt(user1Id.toString(), 10), // Convertir a número
            usuario2Id: parseInt(user2Id.toString(), 10)  // Convertir a número
          },
          {
            usuario1Id: parseInt(user2Id.toString(), 10),
            usuario2Id: parseInt(user1Id.toString(), 10)
          }
        ]
      }
    });
  }

  async createConversation(user1Id: number, user2Id: number) {
    return this.prisma.conversaciones.create({
      data: {
        usuario1Id: parseInt(user1Id.toString(), 10), // Convertir a número
        usuario2Id: parseInt(user2Id.toString(), 10)  // Convertir a número
      }
    });
  }


  async saveMessage(
    conversacionId?: number,
    usuarioId?: number,
    mensaje?: string,
    emisor?: Emisor,
    leido?: boolean,
    archivoUrl?: string,
    tipoArchivo?: string,
    nombreArchivo?: string
  ) {
    console.log('entre')
    return await this.prisma.mensajes.create({
      data: {
        conversacionId,
        usuarioId,
        emisor,
        contenido: mensaje,
        leido, 
        archivoUrl,
        tipoArchivo,
        nombreArchivo
      },
    });
  }


  async getOrCreateConversacion(usuario1: number, usuario2: number) {
    let conversacion = await this.prisma.conversaciones.findFirst({
      where: {
        OR: [
          { usuario1Id: usuario1, usuario2Id: usuario2 },
          { usuario1Id: usuario2, usuario2Id: usuario1 },
        ],
      },
    });

    if (!conversacion) {
      conversacion = await this.prisma.conversaciones.create({
        data: { usuario1Id: usuario1, usuario2Id: usuario2 },
      });
    }

    return conversacion;
  }



  async getMessages(id_usuario: number, receptorId: number) {
    const conversation = await this.findConversation(id_usuario, receptorId);

    if (!conversation) {
      return null; // Si no hay conversación, devolvemos null
    }

    const messages = await this.prisma.mensajes.findMany({
      where: { conversacionId: conversation.id },
      orderBy: { creadoEn: 'asc' }, // Ordenar por fecha de creación
    });

    return {
      conversacion: conversation,
      mensajes: messages,
    };
  }



  // Obtener todas las conversaciones de un usuario
  async getUserConversations(usuarioId: number) {
    return this.prisma.conversaciones.findMany({
      where: {
        OR: [
          { usuario1Id: parseInt(usuarioId.toString(), 10) },
          { usuario2Id: parseInt(usuarioId.toString(), 10) }
        ]
      },
      include: {
        mensajes: {
          orderBy: { creadoEn: 'desc' },
          take: 1
        }
      }
    });
  }


}
