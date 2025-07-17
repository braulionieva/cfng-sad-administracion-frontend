import { Filtros } from '@interfaces/shared/shared';

export interface SedeBandejaExcelRequest {
  nombreSede?: string | null;
  idDistritoFiscal?: string | null;
}

export interface SedeBandejaRequest {
  pages: number;
  perPage: number;
  filtros: Filtros;
}

/**
// export interface SedeBandejaExcelRequest {
//   filtros: Filtros;
// }
**/

export interface SedeBandejaResponse {
  registros: SedeBandeja[];
  totalPaginas: number;
  totalElementos: number;
}

export interface SedeBandeja {
  numeracion?: number;
  codSede?: string;
  nombreSede?: string;
  idDistritoFiscal?: number;
  nombreDistritoFiscal?: string;
  idUbigeo?: number;
  nombreDistritoGeografico?: string;
  direccionSede?: string;
  usuarioCreador?: string;
  usuarioModificador?: string;
}

export interface DistritoFiscal {
  id: number;
  nombre: string;
}

export interface DistritoGeografico {
  idUbigeo: number;
  distritoGeografico: string;
}

export interface Sede {
  nombreSede: string;
  idDistritoFiscal?: number;
  distritoFiscal?: string;
  idUbigeo?: number;
  nombreDistritoGeografico?: string;
  direccionSede?: string;
}
