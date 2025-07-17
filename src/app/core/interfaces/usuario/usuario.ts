export interface RequestUsuarioDTO {
  origen: string;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  idDistritoFiscal: number;
  codigoSede: string;
  idTipoEntidad: number;
  codigoEntidad: string;
  idCargo: number;
  idRelacionLaboral: number;
  correoPersonal: string;
  correoInstitucional: string;
  idPaisOrigen: number;
  codigoSexo: string;
  despachoFiscalia: string;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
}

export interface Dependencia {
  id: number;
  codigo: string;
  nombre: string;
  detalle: string;
}

export interface Usuario {
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  codigoEntidad: string;
  codigoDespacho: string;
  coVCargo:string;
  idCargo: number;
  idRelacionLaboral: number;
  correoPersonal: string;
  correoInstitucional?: string;
  codigoSinoe?: string;
  celular?: string;
  fechaNacimiento?: Date;
  descripcionNacionalidad?: string;
  codigoSexo: string;
}

export interface UsuarioValidoExcel {
  numero: number;
  idTipoDocumento: number;
  numeroDocumento: string;
  nombres: string;
  apellidoPaterno: string;
  filaEnArchivo: number;
  isValid: boolean;
  mensajeRespuesta: string;//descripcionError
}

export interface RequestFoto {
  idUsuario: string;
  nombreFoto: string;
  tamanioFoto: number;
  idextensionFoto: number;
  foto: any;
  codigoUsuario: string;
}

