import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoMensaje } from '@prisma/client';
import { Usuario } from '../usuarios/entities/usuario.entity';

@WebSocketGateway(3002, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private prisma: PrismaService
  ) { }

  handleConnection(@ConnectedSocket() client: Socket) {
    const { id_usuario } = client.handshake.query;

    if (!id_usuario) {
      console.log(`⚠️ Usuario sin ID, conexión rechazada: ${client.id}`);
      client.disconnect();
      return;
    }

    console.log(`🔵 Usuario ${id_usuario} conectado con socket ID: ${client.id}`);

    // 🔥 Almacenar usuario conectado
    this.connectedUsers.set(client.id, id_usuario.toString());

    // 🔥 Unir al usuario a una sala con su ID
    client.join(id_usuario.toString());
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`🔴 Cliente desconectado: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('registerUser')
  registerUser(@MessageBody() id_usuario: number, @ConnectedSocket() client: Socket) {
    console.log(id_usuario)
    if (!id_usuario) {
      console.log(`⚠️ Intento de registro sin ID de usuario: ${client.id}`);
      return;
    }

    this.connectedUsers.set(client.id, id_usuario.toString()); // Convertir a string
    console.log(`✅ Usuario registrado: ${id_usuario} con socket ID: ${client.id}`);

    return { success: true, message: `Usuario ${id_usuario} registrado` };
  }

  @SubscribeMessage("joinChat")
  async joinChat(
    @MessageBody() data: { chatId: string; userId: number },
    @ConnectedSocket() client: Socket
  ) {
    client.join(data.chatId);

    const [id1, id2] = data.chatId.split("_").map(Number);

    const conversacion = await this.prisma.conversaciones.findFirst({
      where: {
        OR: [
          { usuario1Id: id1, usuario2Id: id2 },
          { usuario1Id: id2, usuario2Id: id1 }
        ]
      }
    });
    if (conversacion) {
      await this.chatService.markMessagesAsRead(conversacion.id, data.userId);
      const updatedConversations = await this.chatService.getConversations(Number(data.userId));
      this.server.to(client.id).emit("updateConversations", updatedConversations);
    }
  }



  @SubscribeMessage("leaveChat")
  leaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.leave(data.chatId);
    console.log(`🚪 Usuario salió de la conversación ${data.chatId}`);
  }

  @SubscribeMessage("createChat")
  async createChat(
    @MessageBody() data: {
      id_usuario: string;
      receptorId: string;
      estado?: EstadoMensaje;
      mensaje?: string;
      archivoUrl?: string;
      tipoArchivo?: string;
      nombreArchivo?: string;
      tempId?: string;
    },
    @ConnectedSocket() client: Socket
  ) {
    console.log("✉️ Nuevo mensaje recibido:", data);

    const id_usuario = Number(data.id_usuario);
    const receptorId = Number(data.receptorId);

    if (!id_usuario || !receptorId || (!data.mensaje?.trim() && !data.archivoUrl)) {
      client.emit("error", { message: "Faltan datos para enviar el mensaje" });
      return;
    }

    try {

      let conversacionEmisor = await this.chatService.getOrCreateConversacion(id_usuario, receptorId);

      let conversacionReceptor = await this.chatService.getOrCreateConversacion(receptorId, id_usuario);

      const chatId = [id_usuario, receptorId].sort().join("_");

      const receptorSocket = [...this.server.sockets.sockets.values()]
        .find(socket =>
          socket.rooms.has(receptorId.toString()) &&
          socket.rooms.has(chatId)
        );

      const leido = !!receptorSocket;

      const savedMessage = await this.chatService.saveMessage(
        conversacionEmisor.id,
        id_usuario,
        data.estado,
        data.mensaje,
        leido,
        data.archivoUrl,
        data.tipoArchivo,
        data.nombreArchivo,
        receptorId
      );

      const lastMessage = data.mensaje?.trim() || data.nombreArchivo.trim();

      console.log('lastMessage:', lastMessage)

      await this.chatService.updateLastTimeAndMessage(conversacionEmisor.id, lastMessage, id_usuario, receptorId);
      await this.chatService.updateLastTimeAndMessage(conversacionReceptor.id, lastMessage, id_usuario, receptorId);


      const updatedConversationsEmisor = await this.chatService.getConversations(id_usuario);
      const updatedConversationsReceptor = await this.chatService.getConversations(receptorId);

      this.server.to(client.id).emit("updateConversations", updatedConversationsEmisor);
      this.server.to(receptorId.toString()).emit("updateConversations", updatedConversationsReceptor);

      this.server.to(chatId).emit("onMessage", { ...savedMessage, tempId: data.tempId });

      this.server.to(receptorId.toString()).emit("privateMessage", savedMessage);

      client.emit("messageDelivered", savedMessage);

    } catch (error) {
      console.error("❌ Error en createChat:", error.message);
      client.emit("error", { message: "Error al enviar mensaje" });
    }
  }


  @SubscribeMessage("markAsRead")
  async markAsRead(
    @MessageBody() data: { conversacionId: number; userId: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      await this.chatService.markMessagesAsRead(data.conversacionId, data.userId);

      const updatedConversations = await this.chatService.getConversations(data.userId);

      this.server.to(client.id).emit("updateConversations", updatedConversations);
    } catch (error) {
      console.error("Error al marcar como leído:", error);
      client.emit("error", { message: "Error al marcar mensajes como leídos" });
    }
  }
}
