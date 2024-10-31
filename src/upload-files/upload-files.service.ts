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

    const formatoReferencia = ref => {
      if (!ref) return '';
      ref = ref.toString();
      //console.log(ref , "=========-----")
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
    //console.log("antes-----")
    //console.table(data)


    const groupedData = _(data)
      .groupBy(row => {
        const groupFields = getGroupingFields(row["Source"]);
        /* if (row["Source"].includes('(AP-PAY)')) {
          console.log(generateGroupKey(row, groupFields))
        } */
        return generateGroupKey(row, groupFields);
      })
      .map((rows, key) => {
        const fieldValues = key.split('_');
        const groupFields = getGroupingFields(rows[0]["Source"]);
        const groupObj = {};

        groupFields.forEach((field, index) => {
          groupObj[field] = fieldValues[index];
        });


        let Debito = _.sumBy(rows, 'Debito');
        let Credito = _.sumBy(rows, 'Credito');
        let Balance = _.sumBy(rows, 'Balance');




        /* if (typeof rows[0]["Source"] == "string" && rows[0]["Source"].includes("(AR-BILL)")) {
          if (Debito > Credito) {
            Debito -= Credito;
            Credito = 0;
          } else if (Credito > Debito) {
            Credito -= Debito;
            Debito = 0;
          } else {
            Debito = 0;
            Credito = 0;
          }
        } */
        if (typeof groupObj["Descripcion"] == "string" && groupObj["Descripcion"].includes("Corriente")) {
          console.log("entro............. 16")
        }
        const fecha = groupObj['Fecha'] || rows[0]['Fecha'];
        const referencia = rows[0]['Referencia'];
        const source = groupObj['Source'] || rows[0]['Source'];
        const ultimaDescripcion = _.last(rows)['Descripcion']
        const DESC = getDescription(fecha, referencia, source, ultimaDescripcion);
        /* if (typeof DESC["Descripcion"] == "string" && DESC["Descripcion"].includes("Cambio de Periodo Corriente")) {
          console.log("entro aqui")
        } */
        if (typeof groupObj["Descripcion"] == "string" && groupObj["Descripcion"].includes("Corriente")) {
          console.log("entro............. 16")
        }

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
    //console.log("despues-----")
    //console.table(groupedData)
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
    let totalDebito = 0;
    let totalCredito = 0;
    const sortedData = finalGroupedData.map((row, index) => {
      let debito = row['Debito'];
      let credito = row['Credito'];
      let balance = row['Balance'];


      /* if (row["Source"] === "Diario de Ventas") {
        console.log("entro ---- 1")
        totalDebito += debito;
        totalCredito += credito;
      }

      if (row['DESC'] === 'Cambio de Periodo Corriente') {
        console.log("entro ---- 2")

        if (totalDebito > totalCredito) {
          debito = totalDebito - totalCredito;
          credito = 0;
        console.log("entro ---- 4")

        } else if (totalCredito > totalDebito) {
        console.log("entro ---- 3")

          credito = totalCredito - totalDebito;
          debito = 0;
        } else {
          debito = 0;
          credito = 0;
        }
        balance = debito + credito;
        totalDebito = 0;
        totalCredito = 0;
      } */
      if (row['DESC'] === 'Cambio de Periodo Corriente') {
        balance = '';
      } else if (typeof row["Source"] == "string" && row["Source"].includes("(AR-BILL)")) {
        if (debito > credito) {
          debito -= credito;
          credito = 0;
          //balance = 300000

        } else if (credito > debito) {
          credito -= debito;
          debito = 0;
          //balance = 300001

        } else {
          debito = 0;
          credito = 0;
        }
      }

      const cuenta = row['Cuenta'] !== lastAccount ? row['Cuenta'] : '';
      if (row['Cuenta'] !== lastAccount) {
        lastAccount = row['Cuenta'];
      }


      /*  
        if (row["Source"] === "Diario de Ventas") {
          totalDebito += debito;
          totalCredito += credito;
        }
      
        if (row['DESC'] === 'Cambio de Periodo Corriente') {
          debito = totalDebito > totalCredito ? totalDebito - totalCredito : 0;
          credito = totalCredito > totalDebito ? totalCredito - totalDebito : 0;
          
          balance = debito + credito;
      
          totalDebito = 0;
          totalCredito = 0;
        }
      
        const cuenta = row['Cuenta'] !== lastAccount ? row['Cuenta'] : '';
        if (row['Cuenta'] !== lastAccount) {
          lastAccount = row['Cuenta'];
        } */

      return {
        Cuenta: cuenta,
        Fecha: row['Fecha'],
        Referencia: row['Referencia'],
        Source: row['Source'],
        Descripción: row['DESC'],
        Debito: debito === 0 ? '' : debito,
        Credito: credito === 0 ? '' : credito,
        Balance: balance === 0 || balance === '' ? '' : balance,
      };
    });
    const newSheet = xlsx.utils.json_to_sheet(sortedData);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Agrupado');
    const outputFilePath = path.join(process.cwd(), 'uploads', `archivo_agrupado_${Date.now()}.xlsx`);
    xlsx.writeFile(newWorkbook, outputFilePath);
    fs.unlinkSync(filePath);

    return path.basename(outputFilePath);
  }
}