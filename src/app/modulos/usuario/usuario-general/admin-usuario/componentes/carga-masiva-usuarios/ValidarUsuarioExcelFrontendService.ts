import { Injectable } from '@angular/core';
import {UsuarioValidoExcel} from "@interfaces/usuario/usuario";

/*export interface UsuarioExcelRecord {
  codigoTipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  codigoDependencia: string;
  codigoDespacho: string;
  codigoCargo: string;
  codigoRelacionLaboral: string;
  correoPersonal: string;
  correoInstitucional: string;
  celular: string;
  fechaNacimiento: string;
  paisOrigen: string;
  codigoSexo: string;
}*/

/*export interface ValidationError {
  numero: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  filaEnArchivo: number;
  mensajeRespuesta: string;//descripcionError

}*/

@Injectable({
  providedIn: 'root'
})
export class ValidarUsuarioExcelFrontendService {

  constructor() {}

  validateExcelData(data: any[]): UsuarioValidoExcel[] {
    const invalidRecords: UsuarioValidoExcel[] = [];

    // Validar que data sea un array y no esté vacío
    if (!Array.isArray(data) || data.length === 0) {
      return invalidRecords;
    }

    data.forEach((record, index) => {
      // Ignorar registros vacíos
      if (!record || record.length === 0) return;

      const rowNumber = index + 1;
      const errors: string[] = [];

      // Extraer valores del registro con los índices corregidos
      const [
        idTipoDocumento,         // 0
        numeroDocumento,       // 1
        nombres,               // 2
        apellidoPaterno,       // 3
        apellidoMaterno,       // 4
        codigoDependencia,     // 5
        codigoDespacho,        // 6
        codigoCargo,           // 7
        codigoRelacionLaboral, // 8
        correoPersonal,        // 9
        correoInstitucional,   // 10
        celular,              // 11
        fechaNacimiento,      // 12
        paisOrigen,           // 13
        codigoSexo            // 14
      ] = record;

      // Validación de Código tipo de documento
      if (!idTipoDocumento) {
        errors.push('El código tipo de documento es obligatorio');
      } else if (!/^[1-4]$/.test(idTipoDocumento.toString())) {
        errors.push('El código tipo de documento debe ser un número entre 1 y 4');
      }

      // Validación de Número de documento
      if (!numeroDocumento) {
        errors.push('El número de documento es obligatorio');
      } else if (numeroDocumento.toString().length > 20) {
        errors.push('El número de documento no debe exceder los 20 caracteres');
      }

      // Validación de Nombres
      if (!nombres?.toString().trim()) {
        errors.push('El nombre es obligatorio');
      } else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/.test(nombres)) {
        errors.push('El nombre solo debe contener letras y espacios');
      }

      // Validación de Apellido Paterno
      if (!apellidoPaterno?.toString().trim()) {
        errors.push('El apellido paterno es obligatorio');
      } else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoPaterno)) {
        errors.push('El apellido paterno solo debe contener letras y espacios');
      }

      // Validación de Apellido Materno
      if (apellidoMaterno && !/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]*$/.test(apellidoMaterno)) {
        errors.push('El apellido materno solo debe contener letras y espacios');
      }

      // Validación de Código de dependencia
      if (!codigoDependencia) {
        errors.push('El código de dependencia es obligatorio');
      }

      // Validación de Código de despacho
      if (!codigoDespacho) {
        errors.push('El código de despacho es obligatorio');
      }

      // Validación de Código de despacho
      if (!codigoCargo) {
        errors.push('El código de cargo es obligatorio');
      }

      // Validación de Código relación laboral
      if (!codigoRelacionLaboral?.toString().trim()) {
        errors.push('El código de relación laboral es obligatorio');
      } else if (!/^[1-2]$/.test(codigoRelacionLaboral.toString())) {
        errors.push('El código de relación laboral debe ser 1 o 2');
      }

      // Validación de Correo Personal
      if (!correoPersonal) {
        errors.push('El correo personal es obligatorio');
      } else if (!this.isValidEmail(correoPersonal)) {
        errors.push('El formato del correo personal es inválido');
      }

      // Validación de Correo Institucional
      if (correoInstitucional && !this.isValidEmail(correoInstitucional)) {
        errors.push('El formato del correo institucional es inválido');
      }

      // Validación de Celular
      if (celular && celular.toString().trim() !== '') {
        if (!/^\d{9}$/.test(celular.toString().trim())) {
          errors.push('El número de celular debe tener exactamente 9 dígitos');
        }
      }

      // Validación de Fecha de nacimiento
      if (fechaNacimiento) {
        if (!this.isValidDate(fechaNacimiento.toString())) {
          errors.push('La fecha de nacimiento debe tener el formato dd/mm/yyyy');
        } else {
          const fecha = this.parseFecha(fechaNacimiento.toString());
          if (fecha > new Date()) {
            errors.push('La fecha de nacimiento no puede ser futura');
          }
        }
      }

      // Validación de País de origen/Nacionalidad
      if (paisOrigen && !/^[A-Z\s]+$/.test(paisOrigen)) {
        errors.push('El país de origen solo debe contener letras mayúsculas sin tildes y espacios');
      }

      // Validación de Código de sexo
      if (!codigoSexo?.toString().trim()) {
        errors.push('El código de sexo es obligatorio');
      } else if (!/^[0-1]$/.test(codigoSexo.toString())) {
        errors.push('El código de sexo debe ser 0 o 1');
      }

      // Si hay errores, agregar a la lista de registros inválidos
      if (errors.length > 0) {
        invalidRecords.push({
          numero: rowNumber,
          idTipoDocumento: idTipoDocumento || '',
          numeroDocumento: numeroDocumento || '',
          nombres: nombres || '',
          apellidoPaterno: apellidoPaterno || '',
          filaEnArchivo: rowNumber + 4, // Ajuste por las filas de encabezado
          isValid:false,
          mensajeRespuesta: errors.join(', ')
        });
      }
    });

    return invalidRecords;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }

  private isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;

    const pattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!pattern.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  private parseFecha(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
}
