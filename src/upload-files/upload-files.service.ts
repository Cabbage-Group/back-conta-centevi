import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { excelDateToJSDate, generateGroupKey, getDescription, getGroupingFields } from './recursos/recursos';

@Injectable()
export class UploadFilesService {
  async agrupamientoExcel(filePath: string): Promise<string> {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    let data: any[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    let lastAccount = '';
    data = data.map(row => {
      if (row['Cuenta']) {
        lastAccount = row['Cuenta'];
      } else {
        row['Cuenta'] = lastAccount;
      }
      row['Debito'] = parseFloat(row['Debito']) || 0;
      row['Credito'] = parseFloat(row['Credito']) || 0;
      row['Balance'] = parseFloat(row['Balance']) || 0;

      if (row['Fecha']) {
        row['Fecha'] = excelDateToJSDate(row['Fecha']).toISOString().split('T')[0];
      }

      return row;
    });

    const agruparReferencia = ref => {
      if (!ref) return 'Otros';
      ref = ref.toString();
      return isNaN(ref[0]) ? ref.slice(0, 3) : 'Otros';
    };
    data = data.map(row => {
      row['Referencia'] = agruparReferencia(row['Referencia']);
      return row;
    });
    const groupedData = _(data)
      .groupBy(row => {
        const groupFields = getGroupingFields(row["Source"]);
        return generateGroupKey(row, groupFields);
      })
      .map((rows, key) => {
        const fieldValues = key.split('_');
        const groupFields = getGroupingFields(rows[0]["Source"]);
        const groupObj = {};

        groupFields.forEach((field, index) => {
          groupObj[field] = fieldValues[index];
        });

        const Debito = _.sumBy(rows, 'Debito');
        const Credito = _.sumBy(rows, 'Credito');
        const Balance = _.sumBy(rows, 'Balance');

        const fecha = groupObj['Fecha'] || rows[0]['Fecha']; 
        const referencia = groupObj['Referencia'] || rows[0]['Referencia'];
        const source = groupObj['Source'] || rows[0]['Source'];
        const ultimaDescripcion = _.last(rows)['Descripcion']
        const DESC = getDescription(fecha, referencia, source, ultimaDescripcion);
        return {
          ...groupObj,
          Debito,
          Credito,
          Balance,
          DESC
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
          ...balanceFinal
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
}