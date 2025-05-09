import { Injectable } from '@nestjs/common';
import { EstadoMensaje } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) { }

  async findConversation(user1Id: number, user2Id: number) {
    return this.prisma.conversaciones.findFirst({
      where: {
        OR: [
          {
            usuario1Id: parseInt(user1Id.toString(), 10),
            usuario2Id: parseInt(user2Id.toString(), 10)
          },

          {
            usuario1Id: parseInt(user2Id.toString(), 10),
            usuario2Id: parseInt(user1Id.toString(), 10)
          }
        ]
      },
      include: {
        usuario1: { select: { nombre: true } },
        usuario2: { select: { nombre: true } }
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
    estado?: EstadoMensaje,
    mensaje?: string,
    leido?: boolean,
    archivoUrl?: string,
    tipoArchivo?: string,
    nombreArchivo?: string,
    receptorId?: number
  ) {
    const savedMessage = await this.prisma.mensajes.create({
      data: {
        conversacionId,
        usuarioId,
        estado: estado,
        contenido: mensaje,
        leido,
        archivoUrl,
        tipoArchivo,
        nombreArchivo
      },
    });
    return savedMessage;
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
      return null;
    }

    const messages = await this.prisma.mensajes.findMany({
      where: { conversacionId: conversation.id },
      include: {
        usuario: { select: { nombre: true } }
      },
      orderBy: { creadoEn: 'asc' },
    });

    return {
      conversacion: conversation,
      mensajes: messages,
    };
  }


  async getConversations(userId: number, name?: string) {
    const conversations = await this.prisma.conversaciones.findMany({
      where: {
        OR: [{ usuario1Id: userId }, { usuario2Id: userId }]
      },
      include: {
        usuario1: {
          select: { id_usuario: true, nombre: true, foto: true }
        },
        usuario2: {
          select: { id_usuario: true, nombre: true, foto: true }
        },
        mensajes: {
          orderBy: { creadoEn: "desc" },
          select: { contenido: true, creadoEn: true, leido: true, usuarioId: true }
        }
      },
      orderBy: {
        lastTime: "desc"
      }
    });

    let mappedConversations = conversations.map(conversation => {
      const otherUser = conversation.usuario1Id === userId ? conversation.usuario2 : conversation.usuario1;
      const lastMessage = conversation.mensajes[0];

      const unreadCount = conversation.mensajes.filter(
        m => !m.leido && m.usuarioId !== userId
      ).length;

      return {
        conversationId: conversation.id,
        userId: otherUser.id_usuario,
        name: otherUser.nombre,
        profilePicture: otherUser.foto,
        lastMessage: lastMessage?.contenido || "Sin mensajes",
        lastMessageTime: lastMessage?.creadoEn || conversation.lastTime || conversation.creadoEn,
        unreadMessages: unreadCount
      };
    });

    const existingUserIds = new Set(mappedConversations.map(c => c.userId));

    const otherUsers = await this.prisma.usuarios.findMany({
      where: {
        NOT: { id_usuario: userId },
        estado: { not: 0 }
      },
      select: {
        id_usuario: true,
        nombre: true,
        foto: true
      }
    });

    const extraConversations = otherUsers
      .filter(user => !existingUserIds.has(user.id_usuario))
      .map(user => ({
        conversationId: null,
        userId: user.id_usuario,
        name: user.nombre,
        profilePicture: user.foto,
        lastMessage: "Sin mensajes",
        lastMessageTime: null,
        unreadMessages: 0
      }));

    let finalResults = [...mappedConversations, ...extraConversations];

    if (name) {
      const lowerName = name.toLowerCase();
      finalResults = finalResults.filter(convo =>
        convo.name.toLowerCase().includes(lowerName)
      );
    }

    return finalResults;
  }






  async updateLastTimeAndMessage(
    conversacionId: number,
    lastMessage: string,
    usuarioid1: number,
    receptorId: number
  ) {
    try {
      await this.prisma.conversaciones.update({
        where: { id: conversacionId },
        data: {
          lastTime: new Date(),
          lastMessage: lastMessage,
        },
      });
      await this.prisma.usuarios.updateMany({
        where: {
          id_usuario: { in: [usuarioid1, receptorId] }
        },
        data: {
          ultimo_login: new Date(),
        },
      });
    } catch (error) {
      console.error("Error al actualizar lastTime y lastMessage:", error);
      throw new Error("Error al actualizar lastTime y lastMessage de la conversación");
    }
  }

  async incrementUnreadCount(conversacionId: number) {
    try {
      await this.prisma.conversaciones.update({
        where: { id: conversacionId },
        data: {
          unread: {
            increment: 1,  // Suma 1 al contador de mensajes no leídos
          },
        },
      });
    } catch (error) {
      console.error("Error al incrementar unread:", error);
      throw new Error("Error al actualizar unread en la conversación");
    }
  }

  async markMessagesAsRead(conversationId: number, userId: number) {
    // Marcar solo los mensajes que NO envió el usuario y aún no han sido leídos
    await this.prisma.mensajes.updateMany({
      where: {
        conversacionId: conversationId,
        usuarioId: { not: Number(userId) },
        leido: false
      },
      data: {
        leido: true
      }
    });
  }


}
