export interface TurnoResponse {
  totalPaginas: number;
  totalElementos: number;
  registros: TurnoTabla[];
}

export interface ListaTurnoTabla {
  turnoTabla: TurnoTabla[];
}

export interface TurnoTabla {
  distritoFiscal: string;
  dependencia: string;
  despacho: string;
  codigoDespacho: string;
  fechaInicio: string;
  fechaFin: string;
  fechaModificacion: string;
  usuario: string;
  paterno: string;
  materno: string;
  nombres: string;
  numeracion: number;
  idTurno: string;
  estado?: string;
  vigente?: string;
}

export interface RequestFiltrarTurno {
  pagina: number;
  porPagina: number;
  idDistritoFiscal: string;
  codigoDependencia: string;
  codigoDespacho: string;
  fechaInicio: string;
  fechaFin: string;
  vigente: string;
  //filtros: requestFiltro;
}

export interface RegistroExcelTurno {
  estado?: string;
  distritoFiscal?: string;
  dependencia?: string;
  despacho: string;
  fechaInicio: string;
  fechaFin: string;
  usuarioModificacion: string;
  fechaModificacion: string;
}
export interface DespachoTurno {
  codigoDespacho: string;
  nombreDespacho: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
}

export interface RegistroDespachos {
  distritoFiscal?: string;
  dependencia?: string;
  despacho?: string;
}
