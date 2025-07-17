export interface BuscarDependenciaReq {
  pages: number;
  perPage: number;
  filtros: BuscarDependenciaReqFiltro;
}

//request Buscar dependencia
export interface BuscarDependenciaReqFiltro {
  coVEntidad: string;
  noVEntidad: string;
  idNDistritoFiscal: number;
  idNJerarquia: number;
  idVEspecialidad: string;
  deVAcronimo: string;
  feDCreacion: Date;
}

//response Buscar dependencia
export interface BuscarDependenciaRes {
  registros: BuscarDependenciaResRow[];
  totalPaginas: number;
  totalElementos: number;
}

//response Buscar dependencia
export interface BuscarDependenciaResRow {
  secuencia: number;
  coVEntidad: string;
  idNTipoEntidad: number;
  deVAcronimo: string;
  noVEntidad: string;
  idNDistritoFiscal: number;
  noVDistritoFiscal: string;
  idNJerarquia: number;
  noVJerarquia: string;
  idVEspecialidad: string;
  idNTipoEspecialidad:number
  noVEspecialidad: string;
  esCEntidad: string;
  feDCreacion: Date;
  feDCreacionStr: string;
  feDModificacion: Date;
  feDModificacionStr: string;
  coVUsCreacion: string;
  usrCrea: string;
  coVUsModificacion: string;
  usrModifica: string;
  coVEntidadPadre: string;
}

export interface JerarquiaDTOB {
  idNJerarquia: number;
  noVJerarquia: string;
}

export interface EspecialidadDTOB {
  idVEspecialidad: string;
  noVEspecialidad: string;
}

export interface EntidadForm {
  coVEntidad: string;
  idNTipoEntidad: number;
  noVEntidad: string;
  nuNOrden: number;
  idNDistritoFiscal: number | null;
  coVUsCreacion: string | null;
  coVUsModificacion: string | null;
  deVAcronimo: string | null;
  flCCorporativa: string | null;
  coVEntidadPadre: string | null;
  idNJerarquia: number | null;
  coVSede: string | null;
  //tablas relacionadas
  idVEspecialidad: string | null;
  idNTipoEspecialidad: number | null;
  idNDependenciaEspecialidad: number | null;
}

export interface AgregarDependenciaRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

/**
// export interface TipoEntidad{
//     idNTipoEntidad: number;
//     noTipoEntidad: string;
// }
**/

export interface ActualizarDependenciaRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

export interface ConfigPage{
  pages:number,
  perPage:number
}

//para validad unicidad coVEntidad
export interface SiDuplicadoCoVEntidadRes {
  code: number;
  message: string;
  data: boolean;
}
