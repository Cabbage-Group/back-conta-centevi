import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    registerUser(id_usuario: number, client: Socket): {
        success: boolean;
        message: string;
    };
    createChat(data: {
        id_usuario: string;
        receptorId: string;
        mensaje?: string;
        archivoUrl?: string;
        tipoArchivo?: string;
        nombreArchivo?: string;
    }, client: Socket): Promise<void>;
    getMessages(data: {
        id_usuario: number;
        receptorId: number;
    }, client: Socket): Promise<void>;
}
