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
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
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
    async createChat(data, client) {
        console.log("✉️ Nuevo mensaje recibido:", data);
        const id_usuario = Number(data.id_usuario);
        const receptorId = Number(data.receptorId);
        if (!id_usuario || !receptorId || (!data.mensaje?.trim() && !data.archivoUrl)) {
            client.emit("error", { message: "Faltan datos para enviar el mensaje" });
            return;
        }
        try {
            let conversacion = await this.chatService.getOrCreateConversacion(id_usuario, receptorId);
            const receptorSocket = [...this.server.sockets.sockets.values()]
                .find(socket => socket.rooms.has(receptorId.toString()));
            const leido = receptorSocket ? true : false;
            const savedMessage = await this.chatService.saveMessage(conversacion.id, id_usuario, data.mensaje, "EMISOR", leido, data.archivoUrl, data.tipoArchivo, data.nombreArchivo);
            if (receptorSocket) {
                this.server.to(receptorId.toString()).emit("onMessage", savedMessage);
            }
            this.server.to(id_usuario.toString()).emit("onMessage", savedMessage);
            client.emit("messageDelivered", savedMessage);
        }
        catch (error) {
            console.error("❌ Error en createChat:", error.message);
            client.emit("error", { message: "Error al enviar mensaje" });
        }
    }
    async getMessages(data, client) {
        const { id_usuario, receptorId } = data;
        console.log("📩 Recibiendo datos:", id_usuario, receptorId);
        if (!id_usuario || !receptorId) {
            console.log("⚠️ Error: Faltan parámetros obligatorios.");
            client.emit("error", { message: "id_usuario y receptorId son obligatorios" });
            return;
        }
        try {
            const result = await this.chatService.getMessages(id_usuario, receptorId);
            console.log('result:', result);
            client.emit("messagesFetched", { data: result || { conversacion: null, mensajes: [] } });
        }
        catch (error) {
            console.error("❌ Error en getMessages:", error.message);
            client.emit("error", { message: "Error al obtener mensajes" });
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
    (0, websockets_1.SubscribeMessage)("createChat"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "createChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getMessages'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getMessages", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(3009, {
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map