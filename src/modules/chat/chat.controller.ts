import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('messages')
    async getMessages(@Body() body: { id_usuario: number; receptorId: number }) {
        const { id_usuario, receptorId } = body;
        const result = await this.chatService.getMessages(id_usuario, receptorId);

        if (!result) {
            return { data: { mensaje: 'No hay conversación existente.', conversacion: null, mensajes: [] } };
        }

        return { data: result };
    }

    @Post('conversations')
    async getUserConversations(@Body() body: { id_usuario: number}){
        const { id_usuario} = body;
        const conversations = await this.chatService.getConversations(id_usuario);  
        return { data: conversations };  
    }


}
