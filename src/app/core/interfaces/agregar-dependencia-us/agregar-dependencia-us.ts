export interface Usuario {
  code: string;
  name: string;
}

export interface DependenciaUsuarioLstDTORes {
  secuencia: number;
  idDependenciaUsuario: string;// Primary Key
  idUsuario: string;
  nombreCompleto: string;
  //numeroDocumento: string;
  nuVDocumento: string;
  distritoFiscal: string;
  sede: string;
  flCTipoDependencia: string;
  noFlCTipoDependencia: string;
  entidad: string;
  despacho: string;
  cargo: string;
  fechaCreacion: Date;
  fechaCreacionStr: string;
  coUsuarioCreacion: string;
  noUsuarioCreacion: string;
  fechaModificacion: Date;
  fechaModificacionStr: string;
  coUsuarioModificacion: string;
  noUsuarioModificacion: string;
}

export interface SedeDTOB {
  //idNSede: number;
  coVSede: string // Foreign key
  noVSede: string;
}

export interface DespachoDTOB {
  //idNDespacho: number;
  coVDespacho: string; // Foreign key
  noVDespacho: string;
}

export interface DependenciaDTOB {
  //idNEntidad: number;
  coVEntidad: string;
  noVEntidad: string;
}

export interface CargoDTOB {
  idNCargo: number;
  noVCargo: string;
}

export interface UsuarioDTOB {
  idVUsuario: string;
  nuVDocumento: string;
  noVCiudadano: string;
  apVPaterno: string;
  apVMaterno: string;
  bloqueado: string;
}

export interface DependenciaUsuarioDTO {
  nuVDocumento: string; //no viaja pero se le asigna el valor para mostrarlo en el formulario
  idVDependenciaUsuario: string;
  coVEntidad: string;
  idVUsuario?: string | null;
  idNDistritoFiscal?: number | null;
  coVSede?: number | null;
  coVDespacho: string;
  idNCargo?: number | null;
  esCDependenciaUsuario?: string | null;
  coVUsCreacion?: string | null;
  feDCreacion?: Date | null;
  coVUsModificacion?: string | null;
  feDModificacion?: Date | null;
  coVUsDesactivacion?: string | null;
  feDDesactivacion?: Date | null;
  idNEntidadPresu?: number | null;
}

export interface AgregarDependenciaUsuarioRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

export interface EliminarDependenciaUsReq {
  idVDependenciaUsuario: string;// Primary Key
  coVUsModificacion: string | null;
}

export interface EliminarDependenciaUsRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

export interface UsuarioRow {
  secuencia: number;
  //en algunos servicios será null debido a que están usando idUsuario. Tener en cuenta
  idPersona: string;
  noEsCUsuario: string;
  noNombreCompleto: string;
  numeroDocumento: string;
  idRelacionLaboral: number;
  relacionLaboral: string;
  bloqueado: string;
  entidad: string;
  distritoFiscal: string;
  adminDistrital: string;
  despacho: string;

  //adicionado debido a que en el admin de usuario cambiaron el servicio y ahora están enviando en esta propiedad en vez de idVUsuario. se usa solo para pasar el dato a idVUsuario
  idUsuario: string;
  usuario: string;
}
export interface UsuarioComplete
{  adminDistrital?:string;
  bloqueado?: string;
  despacho?:string;
  distritoFiscal?:string;
  entidad?: string;
  esUsuario?: string;
  foto?: any;
  idPersona?: string;
  idRelacionLaboral?:string;
  idUsuario?:string;
  nombreCompleto?:string;
  numeroDocumento?:string;
  relacionLaboral?:string;
  secuencia?:string;
  usuario?:string;
  }
//para el eschchador, pueda enviar el usuario y la opcionId del Menú
export interface UsuarioMenuOpcionId {
  usuarioRow: UsuarioRow;
  menuOpcionId: string;
}

