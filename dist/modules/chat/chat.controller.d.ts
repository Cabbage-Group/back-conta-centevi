import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMessages(body: {
        id_usuario: number;
        receptorId: number;
    }): Promise<{
        data: {
            mensaje: string;
            conversacion: any;
            mensajes: any[];
        };
    } | {
        data: {
            conversacion: {
                usuario1: {
                    nombre: string;
                };
                usuario2: {
                    nombre: string;
                };
            } & {
                id: number;
                usuario1Id: number;
                usuario2Id: number;
                creadoEn: Date;
                lastMessage: string | null;
                lastTime: Date | null;
                unread: number | null;
                calendar: number | null;
                lastTimeCalendar: Date | null;
            };
            mensajes: ({
                usuario: {
                    nombre: string;
                };
            } & {
                id: number;
                creadoEn: Date;
                conversacionId: number;
                usuarioId: number;
                emisor: import(".prisma/client").$Enums.Emisor;
                contenido: string | null;
                archivoUrl: string | null;
                tipoArchivo: string | null;
                nombreArchivo: string | null;
                leido: boolean;
            })[];
        };
    }>;
    getUserConversations(body: {
        id_usuario: number;
    }): Promise<{
        data: {
            conversationId: number;
            userId: number;
            name: string;
            profilePicture: string;
            lastMessage: string;
            lastMessageTime: Date;
            unreadMessages: number;
        }[];
    }>;
}
