import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class UsuariosController {
    private readonly usuariosService;
    private readonly prisma;
    constructor(usuariosService: UsuariosService, prisma: PrismaService);
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
    findOne(id: string): string;
    update(id: string, updateUsuarioDto: UpdateUsuarioDto): string;
    remove(id: string): string;
}
