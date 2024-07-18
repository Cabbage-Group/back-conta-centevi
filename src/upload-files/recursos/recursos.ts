
import * as _ from 'lodash';

export const excelDateToJSDate = (serial: number): Date => {
  const excelEpoch = new Date(1899, 11, 30);
  return new Date(excelEpoch.getTime() + serial * 86400000);
};

export const getDescription = (
  fechaString: string,
  referencia: string,
  source: string,
  descripcion: string
): string => {
  const fecha = fechaString ? new Date(fechaString) : null;
  const formato = fecha instanceof Date ? fecha.toISOString().split('T')[0] : '';
  if (!referencia || referencia === 'Otros') {
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      fecha.setDate(fecha.getDate() + 1);
      const dia = fecha.getDate();
      if (dia == 1) {
        return 'Balance Inicial';
      }
      if (dia == 30 || dia == 31) {
        return 'Balance Final';
      }
    } else {
      return 'Cambio de Periodo Corriente';
    }
  }
  if (source) {
    if (source.includes('(AR-DEPOSIT)')) {
      return `Depósito del día ${formato}`;
    } else if (source.includes('(AR-PAY)')) {
      return `Cobro del día ${formato}`;
    } else if (source.includes('(MAN-ENTRY)')) {
      return descripcion;
    } else if (source.includes('(AP-PAY)')) {
      return `Proveedor - Pago (${referencia})`;
    } else if (source.includes('(AR-BILL)')) {
      return `Ventas del día ${formato}`;
    } else if (source.includes('(AR-NC)')) {
      return `Notas de crédito del día ${formato}`;
    } else if (source.includes('(AP-PUR-INV)')) {
      return `Compra (${referencia} del día ${formato})`;
    } else if (source.includes('(AR-BILL-COSTS)')) {
      return `Costos del día ${formato}`;
    } else if (source.includes('(INV-AJ-COSTS)') || source.includes('(INV-AJ)')) {
      return `Ajuste numero ${referencia}`;
    } else if (source.includes('(AP-PURCHASE)')) {
      return `Descripción :${referencia}`;
    }
  }
  return '';
};

const groupingMap = {
  "(AR-DEPOSIT)": ["Cuenta", "Source", "Fecha"],
  "(AR-PAY)": ["Cuenta", "Source", "Fecha"],
  "(MAN-ENTRY)": ["Cuenta", "Source", "Referencia", "Descripcion"],
  "(AP-PAY)": ["Cuenta", "Source", "Referencia"],
  "(AR-BILL)": ["Cuenta", "Source", "Fecha"],
  "(AR-NC)": ["Cuenta", "Source", "Fecha"],
  "(AP-PUR-INV)": ["Cuenta", "Source", "Referencia"],
  "(AP-PURCHASE)": ["Cuenta", "Source", "Referencia"],
  "(AR-BILL-COSTS)": ["Cuenta", "Source", "Fecha"],
  "(INV-AJ-COSTS)": ["Cuenta", "Source", "Referencia"],
  "(INV-AJ)": ["Cuenta", "Source", "Referencia"]
};

export const generateGroupKey = (row: any, fields: string[]): string => {
  return fields.map(field => row[field]).join('_');
};

export const getGroupingFields = (source: string): string[] => {
  for (const key in groupingMap) {
    if (source && source.includes(key)) {
      return groupingMap[key];
    }
  }
  return ["Cuenta", "Fecha"];
};
