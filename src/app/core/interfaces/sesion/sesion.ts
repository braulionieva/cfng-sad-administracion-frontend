export interface LoginRequestDTO {
  usuario: string;
  password: string;
}

export interface LoginNewRequestDTO {
  usuario: string;
  password: string;
  sistema: string;
  token?: string;
  captcha?: string;
  captchaCompare?: string;
}


export interface JwtPayload {
  sub: string;
  jti: string;
  iss: string;
  usc: string;
  cli: string;
  usuario: UsuarioDTO;
  exp: number;
}

export interface UsuarioDTO {
  id: string;
  cuuid: string;
  usuario: string;
  sadid: number;
  personalId: string;
  tipoDocumento: number;
  codigoTipoDocumento: number;
  numeroDocumento: string | null;
  nombreCompleto: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  relacionLaboral: string;
  codigoRelacionLaboral: string;
  idDependencia: number;
  codigoDependencia: string;
  idDespacho: number | null;
  codigoDespacho: string | null;
  idDistritoFiscal: number;
  codigoDistritoFiscal: string;
  dniFiscal: string | null;
  idUnidadEjecutora: number;
  codigoUnidadEjecutora: string;
  secuenciaUnidadEjecutora: string;
  idCargo: number;
  codigoCargo: string;
  dispositivo: DispositivoDTO;
}

export interface DispositivoDTO {
  tipo: string;
  nombre: string;
  ip: string;
  tipoIp: string;
  sistemaOperativo: string;
  navegador: string;
}

export interface ListaDependenciasResponse {

  dependenciaUsuario: DependenciaUsuarioDTO[];
}


export interface DependenciaUsuarioDTO {

  nombreCompletoUsuario: string;
  nombreEntidad: string;
  idDependenciaUsuario: string;
  nombreDespacho: string | null;

}

export interface RegistrarAccesoRequest {
  usuario: string;
  idNAplicacion: number;
}

//antes ResponseMessage
export interface RegistrarAccesoRequestRes {
  // Ajusta según la estructura real de tu ResponseMessageDTO
  message: string;
  status: string;
  data?: any;
}
