export interface FirmaDocumentoResponse {
  totalPaginas: number;
  totalElementos: number;
  registros: FirmaDocumentoTabla;
}
export interface FirmaDocumentoTabla {
  idDocumentoFirmaCargo: number;
  estado: string;
  idTipoDocumento: number;
  tipoDocumento?: string;
  idCargo?: number;
  codigoCargo?: string;
  cargo?: string;
  usuario?: string;
}
export interface FirmaDocumentoCargo {
  firmaCheck?: boolean;
  idTipoDocumento?: number;
  tipoDocumento?: string;
  idCargo?: number;
  codigoCargo?: string;
  cargo?: string;
  usuario?: string;
}

/**export interface requestFiltrarFirmaDocumento {
  pagina: number;
  porPagina: number;
  codigoDistritoFiscal: string;
  codigoDependencia: string;
  codigoDespacho: string;
  fechaInicio: string;
  fechaFin: string;
  //filtros: requestFiltro;
}**/

export interface RegistroExcelFirmaDocumento {
  estado: string;
  distritoFiscal: string;
  dependencia: string;
  despacho: string;
  fechaInicio: string;
  fechaFin: string;
  fechaModificacion: string;
}
