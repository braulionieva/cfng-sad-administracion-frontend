export interface NotificadorDTO {
  idVNotificador: string;
  idVUsuario?: string | null;
  noVNotificador?: string | null;
  feDCreacion?: Date | null;
  esCNotificador?: '0' | '1' | null; // assuming '0' and '1' are valid values for ES_C_NOTIFICADOR
  coVUsCreacion?: string | null;
  feDModificacion?: Date | null;
  coVUsModificacion?: string | null;
  feDDesactivacion?: Date | null;
  coVUsDesactivacion?: string | null;
  ipVModificacion?: string | null;
  nuVDocumento: string;
  idVCentral: string;
}

export interface CentralNotificacionesDTOB {
  idVCentral: string;
  noVCentral: string;
}

//request para buscar notificadores
export interface BuscarNotificadoresReq {
  pages: number;
  perPage: number;
  filtros: FiltroBuscarNotificadoresReq;

}

//request para buscar notificadores
export interface FiltroBuscarNotificadoresReq {
  idVCentral: string;
  idNDistritoFiscal: number | null;
  nuVDocumento: string | null;
  noVNotificador: string | null;
}

//response para busca notificadores
export interface BuscarNotificadoresResWrapper {
  registros: BuscarNotificadoresResRow[];
  totalPaginas: number;
  totalElementos: number;
}

//response para busca notificadores
export interface BuscarNotificadoresResRow {
  secuencia: number;//asigna una secuencia desde el frontend
  idVNotificador: string;
  nuVDocumento: string;
  noVNotificador: string;
  idNDistritoFiscal: number;
  noVDistritoFiscal: string;
  esCNotificador: string;
  NoEsCNotificador: string;
  idVCentral: string;
  noVCentral: string;
  feDCreacion: Date;
  feDCreacionStr: string;
  usrCrea: string;
  feDModificacion: Date;
  feDModificacionStr: string;
  usrModifica: string;
  cantidadRegistro: number;
}

export interface AgregarNotificadorReq {
  idVUsuario: string;
  noVNotificador: string;
  esCNotificador: string;
  coVUsCreacion: string;
  coVUsModificacion: string;
  coVUsDesactivacion: string;
  ipVModificacion: string;
  nuVDocumento: string;
  idVCentral: string;
}

export interface AgregarNotificadorRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
  PO_ID_V_NOTIFICADOR: string;
}

export interface DesactivarNotifiReq {
  idVNotificador: string;
  coVUsModificacion: string;
  coVUsDesactivacion: string;
  ipVModificacion: string;
}

export interface DesactivarNotificRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

export interface ActualizarNotificReq {
  idVNotificador: string;
  idVCentral: string;
  coVUsModificacion: string;
  ipVModificacion: string;

}

export interface ActualizarNotificRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

export interface NotificadorForm {
  idVCentral: string;
  nuVDocumento: string;
  noVNotificador: string;
}
