import { Injectable } from '@angular/core';

export interface ExcelRecord {
  'N°': any;
  'Distrito Fiscal': string;
  'Dependencia': string;
  'Despacho': string;
  'Fecha hora inicio de turno': string;
  'Fecha hora fin de turno': string;
}

export interface ValidationErrorDisplay {
  fila: number;
  dependencia: string;
  despacho: string;
  error: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidacionExcelFrontendService {

  constructor() {}

  validateExcelData(data: any[]): ValidationErrorDisplay[] {
    const invalidRecords: ValidationErrorDisplay[] = [];

    // Validar que data sea un array y no esté vacío
    if (!Array.isArray(data) || data.length === 0) {
      return invalidRecords;
    }

    data.forEach((record, index) => {
      // Ignorar registros vacíos o el encabezado
      if (!record || record.length === 0) return;

      const rowNumber = index + 5; // Excel inicia en 1, hay 4 filas de encabezado
      const errors: string[] = [];

      // Extraer valores del registro (asumiendo que es un array por XLSX.utils.sheet_to_json con {header: 1})
      const numRegistro = record[0];
      const distritoFiscal = record[1];
      const dependencia = record[2];
      const despacho = record[3];
      const fechaInicio = record[4];
      const fechaFin = record[5];

      // Validar N° (Número)
      if (!numRegistro || isNaN(Number(numRegistro))) {
        errors.push('El número de registro no es válido');
      }

      // Validar Distrito Fiscal
      if (!distritoFiscal || typeof distritoFiscal !== 'string' || distritoFiscal.length > 100) {
        errors.push('Distrito Fiscal inválido');
      }

      // Validar Dependencia
      if (!dependencia || typeof dependencia !== 'string' || dependencia.length > 100) {
        errors.push('Dependencia inválida');
      }

      // Validar Despacho
      if (!despacho || typeof despacho !== 'string' || despacho.length > 100) {
        errors.push('Despacho inválido');
      }

      // Validar Fecha inicio
      const startDate = this.parseDate(fechaInicio);
      if (!startDate) {
        errors.push('Fecha de inicio inválida');
      }

      // Validar Fecha fin
      const endDate = this.parseDate(fechaFin);
      if (!endDate) {
        errors.push('Fecha de fin inválida');
      }

      // Validar que fecha fin sea posterior a fecha inicio
      if (startDate && endDate && endDate <= startDate) {
        errors.push('La fecha fin debe ser posterior a la fecha inicio');
      }

      // Si hay errores, agregar a la lista de registros inválidos
      if (errors.length > 0) {
        invalidRecords.push({
          fila: rowNumber,
          dependencia: dependencia || '',
          despacho: despacho || '',
          error: errors.join(', ')
        });
      }
    });

    return invalidRecords;
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const patterns = [
      /^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})$/,
      /^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/
    ];

    for (const pattern of patterns) {
      const matches = dateStr.match(pattern);
      if (matches) {
        const [_, day, month, year, hours, minutes, seconds = '00'] = matches;

        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );

        // Verificar que la fecha es válida
        if (
          date.getFullYear() === parseInt(year) &&
          date.getMonth() === parseInt(month) - 1 &&
          date.getDate() === parseInt(day) &&
          date.getHours() === parseInt(hours) &&
          date.getMinutes() === parseInt(minutes) &&
          date.getSeconds() === parseInt(seconds || '00')
        ) {
          return date;
        }
      }
    }

    return null;
  }
}
