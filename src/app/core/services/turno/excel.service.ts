import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { obtenerFechaDDMMYYYY } from '@utils/date';
@Injectable({
  providedIn: 'root',
})

export class ExcelService {

  constructor(private http: HttpClient) { }

  loadExcelFile() {
    const url = 'assets/file/Turnos_fiscalesf.xlsx'; // Ruta al archivo en assets
    return this.http.get(url, { responseType: 'blob' });
  }

  modifyExcelFile(blob: Blob, listaDespachos: any[]) {
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {

      const bstr: string = e.target.result;//Leer el archivo como array buffer
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const sheetName: string = workbook.SheetNames[0];//Selecciona la primera hoja
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      let data: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 });// Obtén los datos de la hoja

      const headerStyle = {
        font: { bold: true, sz: 14 },   // Negrita, tamaño de fuente 14
        fill: { fgColor: { rgb: 'FFFFAA00' } },  // Color de fondo amarillo
      };
      
      worksheet['A2'].s = headerStyle;
      data[1][2] = 'Turnos Fiscales';
      data[2][2] = 'Fecha y hora = ' + obtenerFechaDDMMYYYY(new Date());
      data[2][4] = 'Total de turnos = ' + listaDespachos.length;

      listaDespachos.forEach((d, idx) => {

        data.splice(idx + 5, 0, [idx + 1, d.distritoFiscal, d.dependencia, d.despacho]);
        /**data[idx+6][1] = d.distritoFiscal?d.distritoFiscal:'';**/
      });
      const newWorksheet = XLSX.utils.aoa_to_sheet(data);// Convierte los datos modificados de nuevo a hoja Excel
      workbook.Sheets[sheetName] = newWorksheet;

      this.saveExcelFile(workbook);// Guarda el archivo Excel modificado
    };

    reader.readAsBinaryString(blob);
  }

  saveExcelFile(workbook: XLSX.WorkBook) {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    function s2ab(s: string) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      /**for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xff;
      }**/
      for (let i = 0; i < s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    }

    // Descarga el archivo Excel modificado
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Turnos_fiscales.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
