export interface UsuarioDetalle {
  idVUsuario: string;
  idVPersona: string;
  noVCiudadano: string;
  apVPaterno: string;
  apVMaterno: string;
  noVNombreCompleto: string;
  idNRelacionLaboral: number;
  noVRelacionLaboral: string;
  nuVDocumento: string;
  esCUsuario: string;
  noEsCUsuario: string;
}

export interface ProcesaUsuarioReq {
  idVUsuario: string;
  coVUsername: string;
  //idNEstado: number;
  noVNavegador: string;
  deVNavegVers: string;
  noVSistOpe: string;
  deVSistOpeVers: string;
  deVDisptvo: string;
  idNTipoDisptvo: number;
  ipVAcceso: string;
  idNTipoIp: number;
  coVUsUsuario: string;
  noVObservaciones: string;
  flCAceptaCondiciones: boolean;
}

export interface ProcesaUsuarioRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
  PO_ID_V_HISTORIAL: string;
  PO_ID_V_USUARIO_ESTADO: string;
}