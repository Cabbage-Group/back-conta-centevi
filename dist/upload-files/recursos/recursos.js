"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupingFields = exports.generateGroupKey = exports.getDescription = exports.excelDateToJSDate = void 0;
const excelDateToJSDate = (serial) => {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + serial * 86400000);
};
exports.excelDateToJSDate = excelDateToJSDate;
const getDescription = (fechaString, referencia, source, descripcion) => {
    if (!fechaString && !source) {
        return 'Cambio de Periodo Corriente';
    }
    const fecha = new Date(fechaString);
    const formato = fecha instanceof Date && !isNaN(fecha.getTime())
        ? fecha.toISOString().split('T')[0]
        : '';
    if (!referencia || referencia === 'Otros' && !source) {
        if (fecha instanceof Date && !isNaN(fecha.getTime()) && source === '') {
            fecha.setDate(fecha.getDate() + 1);
            const dia = fecha.getDate();
            if (dia === 1) {
                return 'Balance Inicial';
            }
            if (dia === 30 || dia === 31) {
                return 'Balance Final';
            }
        }
        else {
            return 'Cambio de Periodo Corriente';
        }
    }
    if (source) {
        if (source.includes('(AR-DEPOSIT)')) {
            return `Depósito del día ${formato}`;
        }
        else if (source.includes('(AR-PAY)')) {
            return `Cobro del día ${formato}`;
        }
        else if (source.includes('(MAN-ENTRY)')) {
            return descripcion;
        }
        else if (source.includes('(AP-PAY)')) {
            return `${descripcion}`;
        }
        else if (source.includes('(AR-BILL)')) {
            return `Ventas del día ${formato}`;
        }
        else if (source.includes('(AR-NC)')) {
            return `Notas de crédito del día ${formato}`;
        }
        else if (source.includes('(AP-PUR-INV)')) {
            const filtro = descripcion.split(' - Item')[0];
            return `${filtro}`;
        }
        else if (source.includes('(AR-BILL-COSTS)')) {
            return `Costos del día ${formato}`;
        }
        else if (source.includes('(INV-AJ-COSTS)') || source.includes('(INV-AJ)')) {
            return `Ajuste numero ${referencia}`;
        }
        else if (source.includes('(AP-PURCHASE)')) {
            return `${descripcion}`;
        }
        else if (source.includes('(FIXED-ASSETS)')) {
            console.log(source, "source");
            return `${descripcion}`;
        }
    }
    return '';
};
exports.getDescription = getDescription;
const groupingMap = {
    "(AR-DEPOSIT)": ["Cuenta", "Source", "Fecha"],
    "(AR-PAY)": ["Cuenta", "Source", "Fecha"],
    "(MAN-ENTRY)": ["Cuenta", "Source", "Fecha", "Referencia", "Descripcion"],
    "(AP-PAY)": ["Cuenta", "Fecha", "Source", "Referencia", "Descripcion", "index2"],
    "(AR-BILL)": ["Cuenta", "Source", "Fecha"],
    "(AR-NC)": ["Cuenta", "Source", "Fecha"],
    "(AP-PUR-INV)": ["Cuenta", "Source", "Fecha", "Referencia"],
    "(AP-PURCHASE)": ["Cuenta", "Source", "Fecha", "Referencia"],
    "(AR-BILL-COSTS)": ["Cuenta", "Source", "Fecha"],
    "(INV-AJ-COSTS)": ["Cuenta", "Source", "Referencia"],
    "(INV-AJ)": ["Cuenta", "Source", "Referencia"],
    "(FIXED-ASSETS)": ["Cuenta"]
};
const generateGroupKey = (row, fields) => {
    return fields.map(field => row[field]).join('_');
};
exports.generateGroupKey = generateGroupKey;
const getGroupingFields = (source) => {
    let concat = "";
    for (const key in groupingMap) {
        if (source && source.includes(key)) {
            concat = concat.concat("----", key);
            return groupingMap[key];
        }
    }
    return ["Cuenta", "Fecha"];
};
exports.getGroupingFields = getGroupingFields;
//# sourceMappingURL=recursos.js.map