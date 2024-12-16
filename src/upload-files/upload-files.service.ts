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
        if (row["Source"].includes('(AP-PAY)')) {
          console.log(generateGroupKey(row, groupFields))
        }
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
        /* 
              let fecha = ""
        if (groupObj['Source'] && (groupObj['Source'].includes("(AP-PURCHASE)") || 
        groupObj['Source'].includes("(AP-PUR-INV)") || 
        groupObj['Source'].includes("(MAN-ENTRY)"))) {
let fecha = _.last(rows)['Fecha'];
} else {
let fecha = groupObj['Fecha'] || rows[0]['Fecha'];
 */
        const fecha = groupObj['Fecha'] || rows[0]['Fecha'];
        //console.log(rows[0]['Referencia'] , "#########################")
        const referencia = rows[0]['Referencia'];
        //console.log(referencia , "///////////////////////////---")
        const source = groupObj['Source'] || rows[0]['Source'];
        const ultimaDescripcion = _.last(rows)['Descripcion']
        const DESC = getDescription(fecha, referencia, source, ultimaDescripcion);

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

    const sortedData = finalGroupedData.map((row, index) => {
      let debito = row['Debito'];
      let credito = row['Credito'];
      let balance = row['Balance'];
    
      if (row['DESC'] === 'Cambio de Periodo Corriente') {
        balance = '';
      } else if (typeof row["Source"] == "string" && row["Source"].includes("(AR-BILL)")) {
        if (debito > credito) {
          debito -= credito;
          credito = 0;
        } else if (credito > debito) {
          credito -= debito;
          debito = 0;
        } else {
          debito = 0;
          credito = 0;
        }
      }
    
      const cuenta = row['Cuenta'] !== lastAccount ? row['Cuenta'] : '';
      if (row['Cuenta'] !== lastAccount) {
        lastAccount = row['Cuenta'];
      }
    
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
    
    let inicioGrupo = false
    sortedData.forEach((dat, index) => {

      if(inicioGrupo){
        if(dat['Descripción'] == 'Balance Inicial'){
          dat['Descripción'] = 'Balance Final'
          const temp = sortedData[ index + 1 ]
          sortedData[ index + 1] = sortedData[index]
          sortedData[index] = temp
        }
      }

      if(typeof dat['Cuenta'] == 'string' && dat['Cuenta'] != ''){
        dat['Descripción'] = 'Balance Inicial'
        inicioGrupo = true
      }

      if(dat['Cuenta'] == undefined && dat['Fecha'] == undefined && dat['Referencia'] == undefined && dat['Source'] == undefined && dat['Descripción'] == undefined && dat['Debito'] == undefined && dat['Credito'] == undefined && dat['Balance'] == undefined){
        inicioGrupo = false
      }

      //Calculo hoja
      if(dat['Descripción'] == 'Cambio de Periodo Corriente'){
        dat['Balance'] = dat['Debito'] - dat['Credito']
      }
            
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