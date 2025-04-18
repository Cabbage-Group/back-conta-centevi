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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsuariosService = class UsuariosService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    create(createUsuarioDto) {
        return 'This action adds a new usuario';
    }
    async findAll() {
        return await this.prismaService.usuarios.findMany();
    }
    async getUsersOrderedByLastConversationPrismaNative(idUsuarioActual) {
        const conversaciones = await this.prismaService.conversaciones.findMany({
            where: {
                OR: [
                    { usuario1Id: idUsuarioActual },
                    { usuario2Id: idUsuarioActual }
                ]
            },
            include: {
                mensajes: {
                    orderBy: {
                        creadoEn: 'desc'
                    },
                    take: 1
                }
            }
        });
        const usuariosConFecha = new Map();
        for (const conv of conversaciones) {
            const otroUsuarioId = conv.usuario1Id === idUsuarioActual
                ? conv.usuario2Id
                : conv.usuario1Id;
            if (conv.mensajes.length > 0) {
                const fechaMensaje = conv.mensajes[0].creadoEn;
                if (!usuariosConFecha.has(otroUsuarioId) ||
                    fechaMensaje > usuariosConFecha.get(otroUsuarioId)) {
                    usuariosConFecha.set(otroUsuarioId, fechaMensaje);
                }
            }
        }
        const usuarios = await this.prismaService.usuarios.findMany({
            where: {
                NOT: {
                    id_usuario: idUsuarioActual
                }
            }
        });
        return usuarios.sort((a, b) => {
            const fechaA = usuariosConFecha.get(a.id_usuario);
            const fechaB = usuariosConFecha.get(b.id_usuario);
            if (fechaA && fechaB) {
                return fechaB.getTime() - fechaA.getTime();
            }
            if (fechaA)
                return -1;
            if (fechaB)
                return 1;
            return a.nombre.localeCompare(b.nombre);
        });
    }
    findOne(id) {
        return `This action returns a #${id} usuario`;
    }
    update(id, updateUsuarioDto) {
        return `This action updates a #${id} usuario`;
    }
    remove(id) {
        return `This action removes a #${id} usuario`;
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map