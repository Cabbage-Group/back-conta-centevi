
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
  if (!fechaString && !source ) {
    return 'Cambio de Periodo Corriente';
  }

  const fecha = new Date(fechaString);
  const formato = fecha instanceof Date && !isNaN(fecha.getTime()) 
    ? fecha.toISOString().split('T')[0] 
    : '';

  if (!referencia || referencia === 'Otros' && !source ) {
    if (fecha instanceof Date && !isNaN(fecha.getTime()) && source === '' ) {
      fecha.setDate(fecha.getDate() + 1);
      const dia = fecha.getDate();
      if (dia === 1) {
        return 'Balance Inicial';
      }
      if (dia === 30 || dia === 31) {
        return 'Balance Final';
      }
    } else {
      return 'Cambio de Periodo Corriente';
    }
  }
  //console.log(source , " llllllllllllllllllllllll")
  /*       fecha.setDate(fecha.getDate() + 1);
      const dia = fecha.getDate(); */
  if (source) {
    if (source.includes('(AR-DEPOSIT)')) {
      return `Depósito del día ${formato}`;
    } else if (source.includes('(AR-PAY)')) {
      return `Cobro del día ${formato}`;
    } else if (source.includes('(MAN-ENTRY)')) {
      return descripcion;
    } else if (source.includes('(AP-PAY)')) {
      return `${descripcion}`;
    } else if (source.includes('(AR-BILL)')) {
      return `Ventas del día ${formato}`;
    } else if (source.includes('(AR-NC)')) {
      return `Notas de crédito del día ${formato}`;
    } else if (source.includes('(AP-PUR-INV)')) {
      const filtro = descripcion.split(' - Item')[0]
      return `${filtro}`;
    } else if (source.includes('(AR-BILL-COSTS)')) {
      return `Costos del día ${formato}`;
    } else if (source.includes('(INV-AJ-COSTS)') || source.includes('(INV-AJ)')) {
      return `Ajuste numero ${referencia}`;
    } else if (source.includes('(AP-PURCHASE)')) {
      return `${descripcion}`;
    }else if (source.includes('(FIXED-ASSETS)')) {
      console.log(source , "source")
      return `${descripcion}`;
    }
  }
  return '';
};

const groupingMap = {
  "(AR-DEPOSIT)": ["Cuenta", "Source", "Fecha"],
  "(AR-PAY)": ["Cuenta","Source", "Fecha" ],//diario de cobros
  "(MAN-ENTRY)": ["Cuenta", "Source", "Fecha", "Referencia", "Descripcion"],
  "(AP-PAY)": ["Cuenta", "Fecha", "Source", "Referencia", "Descripcion" , "index2"],//vacio
  "(AR-BILL)": ["Cuenta", "Source", "Fecha"],
  "(AR-NC)": ["Cuenta", "Source", "Fecha"],
  "(AP-PUR-INV)": ["Cuenta","Source", "Fecha","Referencia"],
  "(AP-PURCHASE)": ["Cuenta", "Source", "Fecha", "Referencia"],
  "(AR-BILL-COSTS)": ["Cuenta", "Source", "Fecha"],
  "(INV-AJ-COSTS)": ["Cuenta", "Source", "Referencia"],
  "(INV-AJ)": ["Cuenta", "Source", "Referencia"],
  "(FIXED-ASSETS)": ["Cuenta"]

};

export const generateGroupKey = (row: any, fields: string[]): string => {
  return fields.map(field => row[field]).join('_');
};
export const getGroupingFields = (source: string): string[] => {
  //console.log(source , "---------contenido")
  let concat = ""; // Usar let en lugar de const
  for (const key in groupingMap) {
    if (source && source.includes(key)) {
      //console.log(source , "---------contenido-----------2")
      //console.log("7777777 , hubo un error =" , key)
      concat = concat.concat("----", key); // Reasignar el resultado de la concatenación
      return groupingMap[key];
    }
  }
  //console.log("nada")
  return ["Cuenta","Fecha"];
};