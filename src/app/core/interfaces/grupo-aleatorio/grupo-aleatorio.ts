import { Filtros } from '@interfaces/shared/shared';

//request crear y editar grupo aleatorio

export interface DataFile {
  idGrupoAleatorio: string;
  File: File | null;
  observacion?: string;
}

export interface GrupoAleatorioRequest {
  idGrupoAleatorio: number;
  nombreGrupoAleatorio: string;
  idTipoDistribucion: number;
  diferenciaMinimaMaxima: number;
  idDitritoFiscal: number;
  idEspecialidad: number;
  idTipoEspecialidad: number;
  listaFiscaliasAgregadas: FiscaliaAgregada[];
  listaDespachosAgregados: DespachoAgregado[];
  listaFiscalesAgregados: FiscalAgregado[];
}

export interface FiscaliaAgregada {
  idDitritoFiscal: number;
  idEspecialidad: number;
  idFiscalia: number;
  observacion: string | null;
}

export interface DespachoAgregado {
  idFiscalia: number;
  idDespacho: number;
  fechaApertura: string | null;
  fechaCierre: string | null;
  idArticuloEsepcifico: number | null;
  estadoTurno: number;
  estadoActivo: string;
}

export interface FiscalAgregado {
  idDespacho: number;
  idFiscal: number;
  estadoActivo: string;
}

//response creación o edición grupo aleatorio
export interface GrupoAleatorioResponse {
  timestamp: string;
  code: string;
  message: string;
}

//bandeja grupo aleatorio

export interface GrupoAleatorioBandejaRequest {
  pages: number;
  perPage: number;
  filtros: Filtros;
}

export interface GrupoAleatorioBandejaResponse {
  registros: GrupoAleatorioBandeja[];
  totalPaginas: number;
  totalElementos: number;
}

export interface GrupoAleatorioBandeja {
  id: string;
  nombreGrupoAleatorio: string;
  tipoDistribucion: string;
  distritoFiscal: string;
  especialidad: string;
  cantidadFiscalia: number;
  consideraTurno: string;
  ultimaModificacion: string;
  inNotaPeriodo: string;
  secuencia?: number;
  diferenciaMaxima?: number;
}

export interface StructArticulos {
  value: string; //<- con el valor real de la opción,
  label: string; //<- con el texto a mostrar en la pantalla
}
