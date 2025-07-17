import { format, getHours, getMinutes } from "date-fns";
import { es } from 'date-fns/locale';

export const formatDateToAbbreviated = (input: string) => {
  const months: { [key: string]: string } = {
    '01': 'Ene.', '02': 'Feb.', '03': 'Mar.', '04': 'Abr.',
    '05': 'May.', '06': 'Jun.', '07': 'Jul.', '08': 'Ago.',
    '09': 'Sep.', '10': 'Oct.', '11': 'Nov.', '12': 'Dic.'
  };
  const [day, month, year] = input.split('/');
  const formattedMonth = months[month];
  return `${parseInt(day)} ${formattedMonth} ${year}`;
}

export const convertTo12HourFormat = (input: string): string => {
  const [hour, minutes] = input.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'p.m.' : 'a.m.';
  let hour12;

  if (hourNum > 12) {
    hour12 = hourNum - 12;
  } 

  else if (hourNum === 0) {
    hour12 = 12;
  } 

  else {
    hour12 = hourNum;
  }

  /**const hour12 = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;**/
  return `${hour12}:${minutes} ${ampm}`;
}

export const horaAmPm = (fechaStr: string): string => {
  const [time] = fechaStr.split(' ')
  const [hour] = time.split(':')

  let formattedHour = Number(hour)
  let meridiem = 'AM'

  if (formattedHour >= 12) {
    /**formattedHour = formattedHour % 12;**/
    meridiem = 'PM';
  }

  return meridiem;
}

export const obtenerFechaLetras = (fecha: Date): string => {
  const nombreDiaSemana = format(fecha, 'EEEE', { locale: es });
  const dia = format(fecha, 'd', { locale: es });
  const mes = format(fecha, 'MMMM', { locale: es });
  const anho = format(fecha, 'y', { locale: es });
  return `${nombreDiaSemana} ${dia} DE ${mes.toUpperCase()} DE ${anho}`?.toUpperCase();
}

export const obtenerMesLetras = (fecha: Date): string => {
  const dia = format(fecha, 'd', { locale: es });
  const mes = format(fecha, 'MMMM', { locale: es });
  const anho = format(fecha, 'y', { locale: es });
  return `${dia} de ${mes} de ${anho}`;
}

export const obtenerDiaMesLetras = (fecha: Date): string => {
  const nombreDiaSemana = format(fecha, 'EEEE', { locale: es });
  const dia = format(fecha, 'd', { locale: es });
  const mes = format(fecha, 'MMMM', { locale: es });

  return `${nombreDiaSemana} ${dia} DE ${mes.toUpperCase()}`?.toUpperCase();
}

export const obtenerHoraAMPM = (fecha: Date): string => {
  const hora = getHours(fecha);
  const minutos = getMinutes(fecha);
  const ampm = hora >= 12 ? 'P.M.' : 'A.M.';
  /**const hora12 = hora > 12 ? hora - 12 : ( hora === 0 ? 12 : hora );**/
  let hora12;

  if (hora > 12) {
    hora12 = hora - 12;
  } else if (hora === 0) {
    hora12 = 12;
  } else {
    hora12 = hora;
  }

  return `${hora12.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')} ${ampm}`;
}

export const getYYMMDDDashedToDDMMYYSlash = (dateStr: string) => {
  if (!dateStr) 
    return null;

  const [year, month, day] = dateStr.split('-');
 
  return `${day}/${month}/${year}`;
};

export const obtenerFechaDDMMYYYY = (fecha: Date): string => {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anho = fecha.getFullYear();

  return `${dia}/${mes}/${anho}`;
}

export const obtenerFechaTipoDate = (fecha: string): Date => {
  const partes = fecha.split('/');
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const anho = parseInt(partes[2], 10);

  return new Date(anho, mes, dia);
}

export const cutDateString = (dateTimeString: string): string => {
  const [dateComponents] = dateTimeString.split(' ');
  const [anho, mes, dia] = dateComponents.split('-');
  
  return `${dia}/${mes}/${anho}`;
}