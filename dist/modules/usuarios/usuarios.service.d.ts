import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class UsuariosService {
    private prismaService;
    constructor(prismaService: PrismaService);
    create(createUsuarioDto: CreateUsuarioDto): string;
    findAll(): Promise<{
        id_usuario: number;
        usuario: string;
        nombre: string;
        password: string;
        perfil: string;
        sucursal: number | null;
        foto: string | null;
        estado: number | null;
        ultimo_login: Date | null;
        editado: Date | null;
        tipo_usuario_id: number | null;
        token: string | null;
    }[]>;
    getUsersOrderedByLastConversationPrismaNative(idUsuarioActual: number): Promise<{
        id_usuario: number;
        usuario: string;
        nombre: string;
        password: string;
        perfil: string;
        sucursal: number | null;
        foto: string | null;
        estado: number | null;
        ultimo_login: Date | null;
        editado: Date | null;
        tipo_usuario_id: number | null;
        token: string | null;
    }[]>;
    findOne(id: number): string;
    update(id: number, updateUsuarioDto: UpdateUsuarioDto): string;
    remove(id: number): string;
}
