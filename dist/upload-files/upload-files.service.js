"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFilesService = void 0;
const common_1 = require("@nestjs/common");
const xlsx = require("xlsx");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const recursos_1 = require("./recursos/recursos");
let UploadFilesService = class UploadFilesService {
    async agrupamientoExcel(filePath) {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
        let lastAccount = '';
        data = data.map(row => {
            if (row['Cuenta']) {
                lastAccount = row['Cuenta'];
            }
            else {
                row['Cuenta'] = lastAccount;
            }
            row['Debito'] = parseFloat(row['Debito']) || 0;
            row['Credito'] = parseFloat(row['Credito']) || 0;
            row['Balance'] = parseFloat(row['Balance']) || 0;
            if (row['Fecha']) {
                row['Fecha'] = (0, recursos_1.excelDateToJSDate)(row['Fecha']).toISOString().split('T')[0];
            }
            return row;
        });
        const formatoReferencia = ref => {
            if (!ref)
                return '';
            ref = ref.toString();
            return ref;
        };
        function limpiarCadena(cadena) {
            return cadena.trim().replace(/[\r\n]/g, '');
        }
        data = data.map((row, index) => {
            row['Descripcion'] = limpiarCadena(row['Descripcion']);
            row['Referencia'] = formatoReferencia(row['Referencia']);
            row['Source'] = limpiarCadena(row['Source']);
            row['index2'] = index;
            return row;
        });
        const groupedData = _(data)
            .groupBy(row => {
            const groupFields = (0, recursos_1.getGroupingFields)(row["Source"]);
            if (row["Source"].includes('(AP-PAY)')) {
                console.log((0, recursos_1.generateGroupKey)(row, groupFields));
            }
            return (0, recursos_1.generateGroupKey)(row, groupFields);
        })
            .map((rows, key) => {
            const fieldValues = key.split('_');
            const groupFields = (0, recursos_1.getGroupingFields)(rows[0]["Source"]);
            const groupObj = {};
            groupFields.forEach((field, index) => {
                groupObj[field] = fieldValues[index];
            });
            const Debito = _.sumBy(rows, 'Debito');
            const Credito = _.sumBy(rows, 'Credito');
            const Balance = _.sumBy(rows, 'Balance');
            const fecha = groupObj['Fecha'] || rows[0]['Fecha'];
            const referencia = rows[0]['Referencia'];
            const source = groupObj['Source'] || rows[0]['Source'];
            const ultimaDescripcion = _.last(rows)['Descripcion'];
            const DESC = (0, recursos_1.getDescription)(fecha, referencia, source, ultimaDescripcion);
            return {
                ...groupObj,
                Debito,
                Credito,
                Balance,
                DESC,
                Referencia: referencia
            };
        })
            .value();
        const finalGroupedData = _(groupedData)
            .groupBy('Cuenta')
            .map((rows, account) => {
            const cambioPeriodo = rows.filter(row => row.DESC === 'Cambio de Periodo Corriente');
            const balanceFinal = rows.filter(row => row.DESC === 'Balance Final');
            const otherRows = rows.filter(row => row.DESC !== 'Cambio de Periodo Corriente' && row.DESC !== 'Balance Final');
            return [
                ...otherRows,
                ...cambioPeriodo,
                ...balanceFinal,
                {}
            ];
        })
            .flatten()
            .value();
        const sortedData = finalGroupedData.map(row => ({
            Cuenta: row['Cuenta'],
            Fecha: row['Fecha'],
            Referencia: row['Referencia'],
            Source: row['Source'],
            Descripción: row['DESC'],
            Debito: row['Debito'],
            Credito: row['Credito'],
            Balance: row['Balance']
        }));
        const newSheet = xlsx.utils.json_to_sheet(sortedData);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Agrupado');
        const outputFilePath = path.join(process.cwd(), 'uploads', `archivo_agrupado_${Date.now()}.xlsx`);
        xlsx.writeFile(newWorkbook, outputFilePath);
        fs.unlinkSync(filePath);
        return path.basename(outputFilePath);
    }
};
exports.UploadFilesService = UploadFilesService;
exports.UploadFilesService = UploadFilesService = __decorate([
    (0, common_1.Injectable)()
], UploadFilesService);
//# sourceMappingURL=upload-files.service.js.map