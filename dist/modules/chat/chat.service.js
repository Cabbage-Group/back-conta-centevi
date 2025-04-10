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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findConversation(user1Id, user2Id) {
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
    async createConversation(user1Id, user2Id) {
        return this.prisma.conversaciones.create({
            data: {
                usuario1Id: parseInt(user1Id.toString(), 10),
                usuario2Id: parseInt(user2Id.toString(), 10)
            }
        });
    }
    async saveMessage(conversacionId, usuarioId, mensaje, emisor, leido, archivoUrl, tipoArchivo, nombreArchivo, receptorId) {
        const savedMessage = await this.prisma.mensajes.create({
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
        if (receptorId) {
            const messageDate = savedMessage.creadoEn;
        }
        return savedMessage;
    }
    async getOrCreateConversacion(usuario1, usuario2) {
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
    async getMessages(id_usuario, receptorId) {
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
    async getConversations(userId) {
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
        return conversations.map(conversation => {
            const otherUser = conversation.usuario1Id === userId ? conversation.usuario2 : conversation.usuario1;
            const lastMessage = conversation.mensajes[0];
            const unreadCount = conversation.mensajes.filter(m => !m.leido && m.usuarioId !== userId).length;
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
    }
    async updateLastTimeAndMessage(conversacionId, lastMessage) {
        try {
            await this.prisma.conversaciones.update({
                where: { id: conversacionId },
                data: {
                    lastTime: new Date(),
                    lastMessage: lastMessage,
                },
            });
        }
        catch (error) {
            console.error("Error al actualizar lastTime y lastMessage:", error);
            throw new Error("Error al actualizar lastTime y lastMessage de la conversación");
        }
    }
    async incrementUnreadCount(conversacionId) {
        try {
            await this.prisma.conversaciones.update({
                where: { id: conversacionId },
                data: {
                    unread: {
                        increment: 1,
                    },
                },
            });
        }
        catch (error) {
            console.error("Error al incrementar unread:", error);
            throw new Error("Error al actualizar unread en la conversación");
        }
    }
    async markMessagesAsRead(conversationId, userId) {
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map