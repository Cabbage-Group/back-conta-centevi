import { PrismaService } from 'src/prisma/prisma.service';
import { Emisor } from '@prisma/client';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    findConversation(user1Id: number, user2Id: number): Promise<{
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
    }>;
    createConversation(user1Id: number, user2Id: number): Promise<{
        id: number;
        usuario1Id: number;
        usuario2Id: number;
        creadoEn: Date;
        lastMessage: string | null;
        lastTime: Date | null;
        unread: number | null;
        calendar: number | null;
        lastTimeCalendar: Date | null;
    }>;
    saveMessage(conversacionId?: number, usuarioId?: number, mensaje?: string, emisor?: Emisor, leido?: boolean, archivoUrl?: string, tipoArchivo?: string, nombreArchivo?: string, receptorId?: number): Promise<{
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
    }>;
    getOrCreateConversacion(usuario1: number, usuario2: number): Promise<{
        id: number;
        usuario1Id: number;
        usuario2Id: number;
        creadoEn: Date;
        lastMessage: string | null;
        lastTime: Date | null;
        unread: number | null;
        calendar: number | null;
        lastTimeCalendar: Date | null;
    }>;
    getMessages(id_usuario: number, receptorId: number): Promise<{
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
    }>;
    getConversations(userId: number): Promise<{
        conversationId: number;
        userId: number;
        name: string;
        profilePicture: string;
        lastMessage: string;
        lastMessageTime: Date;
        unreadMessages: number;
    }[]>;
    updateLastTimeAndMessage(conversacionId: number, lastMessage: string): Promise<void>;
    incrementUnreadCount(conversacionId: number): Promise<void>;
    markMessagesAsRead(conversationId: number, userId: number): Promise<void>;
}
