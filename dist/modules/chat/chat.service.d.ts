import { PrismaService } from 'src/prisma/prisma.service';
import { Emisor } from '@prisma/client';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    findConversation(user1Id: number, user2Id: number): Promise<{
        id: number;
        usuario1Id: number;
        usuario2Id: number;
        creadoEn: Date;
        lastMessage: string | null;
        lastTime: string | null;
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
        lastTime: string | null;
        unread: number | null;
        calendar: number | null;
        lastTimeCalendar: Date | null;
    }>;
    saveMessage(conversacionId?: number, usuarioId?: number, mensaje?: string, emisor?: Emisor, leido?: boolean, archivoUrl?: string, tipoArchivo?: string, nombreArchivo?: string): Promise<{
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
        lastTime: string | null;
        unread: number | null;
        calendar: number | null;
        lastTimeCalendar: Date | null;
    }>;
    getMessages(id_usuario: number, receptorId: number): Promise<{
        conversacion: {
            id: number;
            usuario1Id: number;
            usuario2Id: number;
            creadoEn: Date;
            lastMessage: string | null;
            lastTime: string | null;
            unread: number | null;
            calendar: number | null;
            lastTimeCalendar: Date | null;
        };
        mensajes: {
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
        }[];
    }>;
    getUserConversations(usuarioId: number): Promise<({
        mensajes: {
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
        }[];
    } & {
        id: number;
        usuario1Id: number;
        usuario2Id: number;
        creadoEn: Date;
        lastMessage: string | null;
        lastTime: string | null;
        unread: number | null;
        calendar: number | null;
        lastTimeCalendar: Date | null;
    })[]>;
}
