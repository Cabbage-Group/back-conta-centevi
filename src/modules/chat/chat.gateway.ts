import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { Emisor } from '@prisma/client';

@WebSocketGateway(3009, {
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(private readonly chatService: ChatService) { }

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

  @SubscribeMessage("createChat")
  async createChat(
    @MessageBody() data: {
      id_usuario: string;
      receptorId: string;
      mensaje?: string;
      archivoUrl?: string;  
      tipoArchivo?: string; 
      nombreArchivo?: string;
    },
    @ConnectedSocket() client: Socket
  ) {
    console.log("✉️ Nuevo mensaje recibido:", data);

    // Convertir IDs a números
    const id_usuario = Number(data.id_usuario);
    const receptorId = Number(data.receptorId);

    if (!id_usuario || !receptorId || (!data.mensaje?.trim() && !data.archivoUrl)) {
      client.emit("error", { message: "Faltan datos para enviar el mensaje" });
      return;
    }
    

    try {
      // 1️⃣ Obtener o crear la conversación
      let conversacion = await this.chatService.getOrCreateConversacion(id_usuario, receptorId);

      // 2️⃣ Verificar si el receptor está en línea
      const receptorSocket = [...this.server.sockets.sockets.values()]
        .find(socket => socket.rooms.has(receptorId.toString()));

      const leido = receptorSocket ? true : false;

      // 3️⃣ Guardar el mensaje en la base de datos con el estado de "leído" o "no leído"
      const savedMessage = await this.chatService.saveMessage(
        conversacion.id,
        id_usuario,
        data.mensaje,
        "EMISOR",
        leido,
        data.archivoUrl,
        data.tipoArchivo,
        data.nombreArchivo
      );

      // 4️⃣ Enviar el mensaje al receptor (si está conectado)
      if (receptorSocket) {
        this.server.to(receptorId.toString()).emit("onMessage", savedMessage);
      }

      // 5️⃣ Enviar el mensaje también al emisor (para que lo vea en su chat)
      this.server.to(id_usuario.toString()).emit("onMessage", savedMessage);

      // 6️⃣ Confirmar al emisor que el mensaje fue entregado
      client.emit("messageDelivered", savedMessage);

    } catch (error) {
      console.error("❌ Error en createChat:", error.message);
      client.emit("error", { message: "Error al enviar mensaje" });
    }
  }



  @SubscribeMessage('getMessages')
  async getMessages(
    @MessageBody() data: { id_usuario: number; receptorId: number },
    @ConnectedSocket() client: Socket
  ) {
    const { id_usuario, receptorId } = data;
    console.log("📩 Recibiendo datos:", id_usuario, receptorId);

    if (!id_usuario || !receptorId) {
      console.log("⚠️ Error: Faltan parámetros obligatorios.");
      client.emit("error", { message: "id_usuario y receptorId son obligatorios" });
      return;
    }

    try {
      const result = await this.chatService.getMessages(id_usuario, receptorId);
      console.log('result:', result)
      client.emit("messagesFetched", { data: result || { conversacion: null, mensajes: [] } });
    } catch (error) {
      console.error("❌ Error en getMessages:", error.message);
      client.emit("error", { message: "Error al obtener mensajes" });
    }
  }



  // @SubscribeMessage('sendMessage')
  // async sendMessage(@MessageBody() body: { id_usuario: number; receptorId: number; mensaje: string; emisor: string }) {
  //   const { id_usuario, receptorId, mensaje, emisor } = body;

  //   if (!id_usuario || !receptorId || !mensaje) {
  //     console.log('⚠️ Faltan datos para enviar mensaje');
  //     return;
  //   }

  //   console.log(`📨 Nuevo mensaje de ${id_usuario} a ${receptorId}: ${mensaje}`);

  //   let conversacion = await this.chatService.findConversation(id_usuario, receptorId);

  //   if (!conversacion) {
  //     conversacion = await this.chatService.createConversation(id_usuario, receptorId);
  //   }

  //   const emisorEnum = emisor === 'EMISOR' ? Emisor.EMISOR : Emisor.RECEPTOR;

  //   // Verificar si el receptor está conectado
  //   const receptorSocketId = [...this.connectedUsers.entries()]
  //     .find(([_, userId]) => Number(userId) === receptorId)?.[0];

  //   const emisorSocketId = [...this.connectedUsers.entries()]
  //     .find(([_, userId]) => Number(userId) === id_usuario)?.[0];

  //   // ✅ Si el receptor está conectado, guardar el mensaje como leído
  //   const leido = receptorSocketId ? true : false;

  //   // Guardar mensaje en la BD con el estado correcto
  //   const newMessage = await this.chatService.saveMessage(conversacion.id, id_usuario, mensaje, emisorEnum, leido);

  //   // Mensaje que se enviará a ambos
  //   const messageData = {
  //     conversacionId: conversacion.id,
  //     id_usuario,
  //     receptorId,
  //     mensaje: newMessage.contenido,
  //     creadoEn: newMessage.creadoEn,
  //     leido: newMessage.leido, // ✅ Ahora se envía el estado de lectura
  //   };

  //   // Enviar mensaje al receptor si está conectado
  //   if (receptorSocketId) {
  //     this.server.to(receptorSocketId).emit('onMessage', messageData);
  //   }

  //   // Enviar mensaje al emisor para actualizar la UI
  //   if (emisorSocketId) {
  //     this.server.to(emisorSocketId).emit('onMessage', messageData);
  //   }
  // }



}
