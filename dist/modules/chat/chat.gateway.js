"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const chat_service_1 = require("./chat.service");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, prisma) {
        this.chatService = chatService;
        this.prisma = prisma;
        this.connectedUsers = new Map();
    }
    handleConnection(client) {
        const { id_usuario } = client.handshake.query;
        if (!id_usuario) {
            console.log(`⚠️ Usuario sin ID, conexión rechazada: ${client.id}`);
            client.disconnect();
            return;
        }
        console.log(`🔵 Usuario ${id_usuario} conectado con socket ID: ${client.id}`);
        this.connectedUsers.set(client.id, id_usuario.toString());
        client.join(id_usuario.toString());
    }
    handleDisconnect(client) {
        console.log(`🔴 Cliente desconectado: ${client.id}`);
        this.connectedUsers.delete(client.id);
    }
    registerUser(id_usuario, client) {
        console.log(id_usuario);
        if (!id_usuario) {
            console.log(`⚠️ Intento de registro sin ID de usuario: ${client.id}`);
            return;
        }
        this.connectedUsers.set(client.id, id_usuario.toString());
        console.log(`✅ Usuario registrado: ${id_usuario} con socket ID: ${client.id}`);
        return { success: true, message: `Usuario ${id_usuario} registrado` };
    }
    async joinChat(data, client) {
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
    leaveChat(data, client) {
        client.leave(data.chatId);
        console.log(`🚪 Usuario salió de la conversación ${data.chatId}`);
    }
    async createChat(data, client) {
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
                .find(socket => socket.rooms.has(receptorId.toString()) &&
                socket.rooms.has(chatId));
            const leido = !!receptorSocket;
            const savedMessage = await this.chatService.saveMessage(conversacionEmisor.id, id_usuario, data.mensaje, leido, data.archivoUrl, data.tipoArchivo, data.nombreArchivo, receptorId);
            const lastMessage = data.mensaje?.trim() || data.nombreArchivo;
            await this.chatService.updateLastTimeAndMessage(conversacionEmisor.id, lastMessage);
            await this.chatService.updateLastTimeAndMessage(conversacionReceptor.id, lastMessage);
            const updatedConversationsEmisor = await this.chatService.getConversations(id_usuario);
            const updatedConversationsReceptor = await this.chatService.getConversations(receptorId);
            this.server.to(client.id).emit("updateConversations", updatedConversationsEmisor);
            this.server.to(receptorId.toString()).emit("updateConversations", updatedConversationsReceptor);
            this.server.to(chatId).emit("onMessage", savedMessage);
            this.server.to(receptorId.toString()).emit("privateMessage", savedMessage);
            client.emit("messageDelivered", savedMessage);
        }
        catch (error) {
            console.error("❌ Error en createChat:", error.message);
            client.emit("error", { message: "Error al enviar mensaje" });
        }
    }
    async markAsRead(data, client) {
        try {
            await this.chatService.markMessagesAsRead(data.conversacionId, data.userId);
            const updatedConversations = await this.chatService.getConversations(data.userId);
            this.server.to(client.id).emit("updateConversations", updatedConversations);
        }
        catch (error) {
            console.error("Error al marcar como leído:", error);
            client.emit("error", { message: "Error al marcar mensajes como leídos" });
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('registerUser'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "registerUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("joinChat"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leaveChat"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "leaveChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("createChat"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "createChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("markAsRead"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "markAsRead", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(3009, {
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        prisma_service_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map