import { inject } from "@angular/core"
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component"
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog"
import {FormGroup} from "@angular/forms";

export const formatDate = (date: Date): string => {
  return date ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
}

export const formatDateInvol = (date: Date): string => {
  try {
    return date ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
  } catch (error) {
    return date + ""
  }
}

export const formatDatetime = (date: Date): string => {
  return date ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
}

export const formatStringDatetime = (date: Date, hour: Date): string => {
  const dateFormatted = date ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
  const hourFormatted = hour ? `${hour.getHours().toString().padStart(2, '0')}:${hour.getMinutes().toString().padStart(2, '0')}` : '';
  const format = `${dateFormatted} ${hourFormatted}`
  return format
}

export const formatTime = (hour: Date): string => {
  if (hour == null) return ''

  const hourFormatted = hour ? `${hour.getHours().toString().padStart(2, '0')}:${hour.getMinutes().toString().padStart(2, '0')}` : '';
  return hourFormatted
}

//refactorizado
export const getValidString = (value: string | null): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmedValue = String(value).trim();
  if (trimmedValue === '') {
    return null;
  }

  return trimmedValue.toUpperCase();
}

export const validOnlyNumbers = (event): boolean => {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
};
export const validNumberDiferencia = (event): boolean => {

  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 49 || charCode > 53)) {
    return false;
  }
  return true;
};

export const validText = (event: any, customPattern: any = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/) => {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode == 8) {
    return true;
  }
  const pattern = customPattern;
  const character = String.fromCharCode(charCode);
  return pattern.test(character);
};

export const validOnlyNumberOnPaste = (event) => {
  const clipboardData = event.clipboardData || window['clipboardData'];
  const pastedText = clipboardData.getData('text');
  const numericText = pastedText.match(/\d+/g)?.join('');
  const newPastedText = numericText || '';
  if (!/^\d+$/.test(pastedText)) {
    event.preventDefault();
    const element = event.target as HTMLInputElement;
    if (element.isContentEditable) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(newPastedText));
      }
    } else {
      element.value = newPastedText;
      element.dispatchEvent(new Event('input'));
    }
  }
}

export const validOnlyTextOnPaste = (event) => {
  const clipboardData = event.clipboardData || window['clipboardData'];
  const pastedText = clipboardData.getData('text');
  const validText = pastedText.match(/[A-Za-zÁÉÍÓÚáéíóúñÑ ]+/g)?.join('');
  const newPastedText = validText || '';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(pastedText)) {
    event.preventDefault();
    const element = event.target as HTMLInputElement;
    if (element.isContentEditable) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(newPastedText));
      }
    } else {
      element.value = newPastedText;
      element.dispatchEvent(new Event('input'));
    }
  }
}

export const formatDateText = (value: string): string => {

  const [date, time] = value.split(' ')
  const [hour, minute] = time.split(':')

  let formattedHour = Number(hour)
  let meridiem = 'AM'

  if (formattedHour >= 12) {
    formattedHour = formattedHour % 12;
    meridiem = 'PM';
  }

  if (formattedHour === 0) {
    formattedHour = 12;
  }
  return `${date} a las ${formattedHour.toString().padStart(2, '0')}:${minute} ${meridiem}`;
}

export const formatDateTextCut = (value: string): string => {
  if (value) {
    const [date] = value.split(' ')

    let formatDateCut = formatDateString(date)
    return `${formatDateCut}`;
  }
  else return '';
}
export const formatTimeTextCut = (value: string): string => {
  const [time] = value.split(' ')
  const [hour, minute] = time.split(':')

  let formattedHour = Number(hour)
  /**let meridiem = 'AM'**/

  if (formattedHour >= 12) {
    formattedHour = formattedHour % 12;
    /**meridiem = 'PM';**/
  }

  if (formattedHour === 0) {
    formattedHour = 12;
  }
  return `${formattedHour.toString().padStart(2, '0')}:${minute}`;

}
export const formatDateTimeTextCut = (value: string): string => {
  if (value) {
    const [date, time] = value.split(' ')
    const [hour, minute] = time.split(':')

    let formattedHour = Number(hour)
    /**let meridiem = 'AM'**/

    if (formattedHour >= 12) {
      formattedHour = formattedHour % 12;
      /**meridiem = 'PM';**/
    }

    if (formattedHour === 0) {
      formattedHour = 12;
    }
    let formatDateCut = formatDateString(date)

    return `${formatDateCut} ${formattedHour.toString().padStart(2, '0')}:${minute}`;
  }
  else return '';
}

export const noQuotes = (event): boolean => {
  const charCode = event.charCode || event.keyCode || 0;
  const key = String.fromCharCode(charCode);
  if (key === "'" || key === '"') {
    return false
  }
  return true
}

export const getDate = (value: string): Date => {
  if (value === null) return null;

  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return date;
}

export const getHour = (value: string): Date => {
  if (value === null) return null;

  const newTime = new Date();
  const [hours, minutes] = value.split(':').map(Number);
  newTime.setHours(hours);
  newTime.setMinutes(minutes);
  newTime.setSeconds(0);
  newTime.setMilliseconds(0);
  return newTime;
}

export const getDateFormatString = (value: string): Date => {
  if (value === null)
    return null
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date
}

export const formatDateString = (value: string): string => {
  if (!value) return ''
  const [year, month, day] = value.split('-');
  const date = day + "/" + month + "/" + year;
  return date;
}

export const validateDateTime = (dateTimeString: string): boolean => {
  const [dateComponents, timeComponents] = dateTimeString.split(' ');
  const [day, month, year] = dateComponents.split('/');
  const [hours, minutes, seconds] = timeComponents.split(':');
  const selectedDateTime = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
  const currentDateTime = new Date();
  return selectedDateTime <= currentDateTime;
}

export function quitarTildes(texto: string) {
  if (!texto) return '';
  const mapaTildes = {
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'o',
    'ú': 'u',
    'ü': 'u',
    // 'ñ': 'n',
    'Á': 'A',
    'É': 'E',
    'Í': 'I',
    'Ó': 'O',
    'Ú': 'U',
    'Ü': 'U',
    // 'Ñ': 'N'
  };

  return texto.replace(/[áéíóúüñÁÉÍÓÚÜÑ]/g, letra => mapaTildes[letra] || letra);
}

export const formatDateSimple = (date: Date): string => {
  return date
    ? date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '';
};

/**
 * Busca un elemento en un array de objetos por un código específico y devuelve el valor de una propiedad determinada.
 *
 * @template T El tipo de los objetos en el array.
 * @template K El tipo de la clave del código (debe ser una clave de T).
 *
 * @param {T[]} items - El array de objetos en el que buscar.
 * @param {T[K]} code - El valor del código a buscar.
 * @param {K} codeKey - La clave del objeto que contiene el código.
 * @param {keyof T} valueKey - La clave del objeto cuyo valor se quiere obtener.
 *
 * @returns {T[keyof T] | undefined} El valor de la propiedad especificada del objeto encontrado, o undefined si no se encuentra.
 *
 * @example
 * // Definir un array de objetos
 * const dependencias: DependenciaDTOB[] = [
 *   { coVEntidad: "001", noVEntidad: "Departamento A" },
 *   { coVEntidad: "002", noVEntidad: "Departamento B" }
 * ];
 *
 * // Usar la función
 * const nombre = getValueByCodeInDropdown(dependencias, "001", "coVEntidad", "noVEntidad");
 * const noExiste = getValueByCodeInDropdown(dependencias, "003", "coVEntidad", "noVEntidad");
 */
export const getValueByCodeInDropdown = <T, K extends keyof T>(
  items: T[],
  code: T[K],
  codeKey: K,
  valueKey: keyof T
): T[keyof T] | undefined => {
  const item = items.find(i => i[codeKey] === code);
  return item ? item[valueKey] : undefined;
}

// utils/input-validation.utils.ts

/**
 * Filtra la entrada de texto para permitir solo números
 * @param event - Evento de input
 * @param formControl - Control del formulario a actualizar
 */
export const filterNumbersInput = (event: any, formControl: any): void => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Expresión regular para permitir solo números
  const regex = /^\d*$/;  // Cambiado de [0-9] a \d

  // Verificar si el valor ingresado es válido
  if (!regex.test(value)) {
    // Si no es válido, eliminar el último carácter ingresado
    input.value = value.slice(0, -1);

    // Actualizar el valor en el FormControl
    formControl.setValue(input.value);
  }
};

/**
 * Maneja el evento de pegado para permitir solo números
 * @param event - Evento de clipboard
 * @param formControl - Control del formulario a actualizar
 */
export function filterNumbersPaste(event: ClipboardEvent, form: FormGroup, controlName: string): void {
  event.preventDefault(); // Previene el pegado por defecto
  const clipboardData = event.clipboardData;
  const pastedText = clipboardData.getData('text'); // Obtiene el texto pegado
  const numbersOnly = pastedText.replace(/[^0-9]/g, ''); // Filtra solo números

  const control = form.get(controlName); // Obtiene el control específico
  if (control) {
    control.setValue(numbersOnly); // Actualiza solo ese control
  }
}

/**
 * Valida que solo se ingresen números al presionar una tecla
 * @param event - Evento de teclado
 * @returns boolean - true si es válido, false si no lo es
 */
export const filterNumbersKeypress = (event: KeyboardEvent): boolean => {
  const pattern = /^\d$/;  // Cambiado para validar un solo dígito
  const inputChar = event.key;

  if (!pattern.test(inputChar)) {
    event.preventDefault();
    return false;
  }
  return true;
};


export const onOpenModalNotificationSuccess2 = (icon: string, title: string, description: string): DynamicDialogRef => {
  const dialogService = inject(DialogService);

  return dialogService.open(AlertModalComponent, {
    width: '600px',
    showHeader: false,
    data: {
      icon,
      title,
      description,
      confirmButtonText: 'Listo',
    },
  });
};


//en reemplazo de formatDateTimeTextCut, formatDateTimeTextCut24H muestra la fecha en 24H
export function formatDateTimeTextCut24H(date: string): string {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
}
