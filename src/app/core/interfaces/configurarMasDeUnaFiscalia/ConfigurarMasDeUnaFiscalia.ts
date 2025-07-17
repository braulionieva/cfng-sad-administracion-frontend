export interface BuscarFiscaliaConfigReqFiltro {
  idNDistritoFiscal?: number;
  coSede?: string;
  coEntidad?: string;
  noEntidad?: string;
  coVEntidadTxt?: string;
}

export interface BuscarFiscaliaConfigReqWrap {
  pages: number;
  perPage: number;
  filtros: BuscarFiscaliaConfigReqFiltro;
}

export interface BuscarFiscaliaConfigResWrap {
  registros: BuscarFiscaliaConfigResRow[];
  totalPaginas: number;
  totalElementos: number;
}

export interface BuscarFiscaliaConfigResRow {
  secuencia: number;
  coVEntidad: string;
  idNDistritoFiscal: string;
  noVDistritoFiscal: string;
  coVSede: string;
  noVSede: string;
  idNTipoEspecialidad: number;
  noVTipoEspecialidad: string;
  idVEspecialidad: string;
  noVEspecialidad: string;
  idNJerarquia: number;
  noVJerarquia: string;
  noVEntidad: string;
  cantidadEntidadPadres: number;
  noVEntidadPadre1: string;
  noVEntidadPadre2: string;
  feDCreacion: Date;
  coVUsCreacion: string;
  usrCrea: string;
  feDModificacion: Date;
  coVUsModificacion: string;
  usrModifica: string;
}

export interface FiscaliaPorDFDTO {
  coVEntidad: string;
  noVEntidad: string;
}

export interface FiscaliaConfigForm {
  secuencia: number;
  coVEntidad: string;
  idNDistritoFiscal: string;
  noVDistritoFiscal: string;
  coVSede: string;
  noVSede: string;
  idNTipoEspecialidad: number;
  noVTipoEspecialidad: string;
  idVEspecialidad: string;
  noVEspecialidad: string;
  idNJerarquia: number;
  noVJerarquia: string;
  noVEntidad: string;
  cantidadEntidadPadres: number;
  coVEntidadPadre: string;
  feDCreacion: Date;
  coVUsCreacion: string;
  usrCrea: string;
  feDModificacion: Date;
  coVUsModificacion: string;
  usrModifica: string;
}

export interface SedeXDF {
  coVSede: string; // Foreign key
  noVSede: string;
}

export interface FiscaliaPadreTableRow {
  secuencia: number;
  cantidad: number;
  idVRelacionEntidad: string; // ID_V_RELACION_ENTIDAD
  coVEntidadHijo: string;
  coVEntidadPadre: string;
  noVEntidad: string;
  coVUsCreacion: string;
  feDCreacion: string; // formatted as DD/MM/YYYY HH24:MI
  usrCrea: string;
  feDModificacion: string; // formatted as DD/MM/YYYY HH24:MI
  coVUsModificacion: string;
  usrModifica: string;
}

export interface GetFiscaliasXCustomParamsReq {
  idNDistritoFiscal: number;
  coVSede: string;
  idNTipoEspecialidad: number;
  idVEspecialidad: string;
  idNJerarquia: number;
}

export interface GetFiscaliaXCoEntidadBasicRes {
  coVEntidad: string;
  idNDistritoFiscal: number;
  noVDistritoFiscal: string;
  coVSede: string;
  noVSede: string;
  idNTipoEspecialidad: number;
  noVTipoEspecialidad: string;
  idVEspecialidad: string;
  noVEspecialidad: string;
  idNJerarquia: number;
  noVJerarquia: string;
  noVEntidad: string;
}

export interface AgregarFiscaliaPadreReq {
  coVEntidadHijo: string;
  coVEntidadPadre: string;
  coVUsCreacion: string;
}

export interface AgregarFiscaliaPadreRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
  ID_V_RELACION_ENTIDAD: string;
}

export interface ActualizarFiscaliaPadreReq {
  idVRelacionEntidad: string;
  coVEntidadPadre: string;
  coVUsModificacion: string;
}

export interface ActualizarFiscaliaPadreRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

export interface EliminarFiscaliaPadreReq {
  idVRelacionEntidad: string;
  coVUsDesactivacion: string;
}

export interface EliminarFiscaliaPadreRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}
