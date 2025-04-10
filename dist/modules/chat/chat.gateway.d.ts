import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private prisma;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService, prisma: PrismaService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    registerUser(id_usuario: number, client: Socket): {
        success: boolean;
        message: string;
    };
    joinChat(data: {
        chatId: string;
        userId: number;
    }, client: Socket): Promise<void>;
    leaveChat(data: {
        chatId: string;
    }, client: Socket): void;
    createChat(data: {
        id_usuario: string;
        receptorId: string;
        mensaje?: string;
        archivoUrl?: string;
        tipoArchivo?: string;
        nombreArchivo?: string;
    }, client: Socket): Promise<void>;
    markAsRead(data: {
        conversacionId: number;
        userId: number;
    }, client: Socket): Promise<void>;
}
