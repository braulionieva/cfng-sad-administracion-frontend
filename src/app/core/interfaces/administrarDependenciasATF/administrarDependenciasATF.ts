export interface BuscarDependenciaAtfFiltro {
  noVDependenciaAtf: string; // PI_NO_V_DEPENDENCIA_ATF
  //coNTipo?: number;          // PI_CO_N_TIPO
  coNRegion?: number;        // PI_CO_N_REGION
  coNDepartamento?: number;  // PI_CO_N_DEPARTAMENTO
}

export interface BuscarDependenciaAtfReq {
  pages: number;
  perPage: number;
  filtros: BuscarDependenciaAtfFiltro;
}

export interface DependenciaAtfTRow {
  secuencia: number;
  cantidad: number;
  coNDependencia: number;
  coNTipo: number;
  tipoAtf: string;
  coNRegion: number;
  noVRegion: string;
  coNDepartamento: number;
  noVDepartamento: string;
  noVDependenciaAtf: string;
  feDCreacion: Date;
  feDCreacionStr: string;
  coVUsCreacion: string;
  usrCrea: string;
  feDModificacion: Date;
  feDModificacionStr: string;
  coVUsModificacion: string;
  usrModifica: string;
}

export interface TipoATF {
  coNTipo: number;
  noVTipo: string;
}

export interface RegionATF {
  coNRegion: number | null;
  noVRegion: string | null;
}

export interface DepartamentoATF {
  coNDepartamento: number;
  noVDepartamento: string;
  coNRegion: number;
}

export interface DependenciaAtfTRowRes {
  registros: DependenciaAtfTRow[];
  totalPaginas: number;
  totalElementos: number;
}

export interface DependenciaAtfObj {
  coNDependencia: number;
  coNTipo: number;
  coNRegion: number;
  coNDepartamento: number;
  noVDependenciaAtf: string;
}

export interface AgregarDependenciaAtfReq {
  coNTipo: number;
  coNRegion: number;
  coNDepartamento: number;
  noVDependenciaAtf: string;
  coVUsCreacion: string;
}
export interface AgregarDependenciaAtfRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
  CO_N_DEPENDENCIA: number;
}
export interface ActualizarDependenciaAtfReq {
  coNDependencia: number;
  coNTipo: number;
  coNRegion: number;
  coNDepartamento: number;
  noVDependenciaAtf: string;
  coVUsModificacion: string;
}
export interface ActualizarDependenciaAtfRe {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}
export interface EliminarDependenciaAtfReq {
  coNDependencia: number;
  coVUsModificacion: string;
  coVUsDesactivacion: string;
}
export interface EliminarDependenciaAtfRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}
