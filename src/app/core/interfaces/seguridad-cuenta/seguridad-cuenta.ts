interface ISegRequest {
  codigoUserName: string;
}

export interface ISegFechaRequest extends ISegRequest {}

export interface ISegPasswordRequest extends ISegRequest {
  password: string;
}

export interface ISegUpdatePasswordRequest extends ISegRequest {
  password: string;
  dispositivo: string;
  sistemaOperativo: string;
  navegador: string;
}

export interface ISegListHPasswordRequest extends ISegRequest {
  nombre: string;
  dispositivo: string;
  fechaInicio: string;
  fechaFin: string;
  pagina: number;
  registrosPorPagina: number;
}

export interface ISegListHValidationEmailRequest extends ISegRequest {
  correoValidar: string;
  dispositivo: string;
  fechaInicio: string;
  fechaFin: string;
  tipoCorreo: string;
  pagina: number;
  registrosPorPagina: number;
}

export interface ISegListPasswordExcelRequest extends ISegRequest {
  nombre: string;
  dispositivo: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ISegListValidationEmailExcelRequest extends ISegRequest {
  correoValidar: string;
  dispositivo: string;
  fechaInicio: string;
  fechaFin: string;
  tipoCorreo: string;
}

export interface ISegLoginEmailsRequest extends ISegRequest {}

export interface ISegEmailStatusValidateRequest extends ISegRequest {
  correoValidar: string;
}

export interface ISegGenerateCodeRequest extends ISegRequest {
  correoValidar: string;
  nombre: string;
}

export interface ISegValidateCodeRequest extends ISegRequest {
  codigoValidacion: number;
  correoValidar: string;
  dispositivo: string;
  sistemaOperativo: string;
  navegador: string;
  tipoCorreo: string;
}

export interface ISegActiveEmailSesionRequest extends ISegRequest {
  correoValidar: string;
  tipoCorreo: string;
}

export interface ISegListStates2FARequest extends ISegRequest {}

export interface ISegGenerateGoogleAuthCodeRequest extends ISegRequest {
  codMetodo2FA: string;
  idUsuarioMetodo: string | null;
}

export interface ISegGenerateEmailCodeRequest extends ISegRequest {
  correoValidar: string;
  nombre: string;
}

export interface ISegValidateGoogleAuthCodeRequest extends ISegRequest {
  idMetodo2FA: string;
  estadoMetodo2FA: string;
  codigoValidacionQr: string;
  dispositivo: string;
  sistemaOperativo: string;
  navegador: string;
}

export interface ISegValidateEmailCodeRequest extends ISegRequest {
  codigoValidacion: number;
  correoValidar: string;
  dispositivo: string;
  sistemaOperativo: string;
  navegador: string;
  idMetodo2FA: string;
  estadoMetodo2FA: string;
}

export interface ISegListHistory2FARequest extends ISegRequest {
  idMetodo2Fa: number | null;
  fechaInicio: string;
  fechaFin: string;
  dispositivo: string;
  accion: string;
  pagina: number;
  registrosPorPagina: number;
}

export interface ISegListHistory2FAExcelRequest extends ISegRequest {
  idMetodo2Fa: number | null;
  fechaInicio: string;
  fechaFin: string;
  dispositivo: string;
  accion: string;
}

interface ISuccessMessage {
  timestamp: string;
  code: string;
  message: string;
}

export interface ISegFecha {
  fecha: string;
}

export interface ISegUpdatePassword extends ISuccessMessage {}

export interface ISegPaginacionHPassword {
  registros: ISegListHPassword[];
  totalPaginas: number;
  totalElementos: number;
}

export interface ISegPaginacionHValidationEmail {
  registros: ISegListHValidationEmail[];
  totalPaginas: number;
  totalElementos: number;
}

export interface ISegListHPassword {
  fecha: string;
  dispositivo: string;
  sistemaOperativo: string;
  navegador: string;
  ip: string;
  tipoIp: string;
  nombre: string;
  numeracion: number;
}

export interface ISegListHValidationEmail {
  numeracion: 1;
  fecha: string;
  correo: string;
  dispositivo: string;
  sistemaOperativo: string;
  navegador: string;
  ip: string;
  tipoIp: string;
}

export interface ISegListH2FA {
  fecha: string;
  tipo: string;
  accion: string;
  dispositivo: string;
  sistemaOperativo: string;
  navegador: string;
  ip: string;
  tipoIp: string;
  numeracion: number;
}

export interface IProgress {
  number: number;
  color: string;
  text: string;
  success: boolean;
}

export interface ISegLoginEmails {
  responseMessageDTO: ISuccessMessage;
  correoPersonal: string;
  correoInstitucional: string;
}

export interface ISegGenerateCode {
  code: number;
  message: string;
  data: boolean;
}

export interface ISegEmailStatusValidate {
  correo: string;
  estadoValidacion: string;
}

export interface ISegValidateCode {
  code: number;
  message: string;
  data: boolean;
}

export interface ISegActiveEmailSesion {
  responseMessageDTO: ISuccessMessage;
  activado: string;
}

export interface ISegListStates2FA {
  codMetodo: string;
  nombreMetodo: string;
  idUsuarioMetodo: string;
  estadoMetodo: string;
  idUsuario: string;
  codigoUsario: string;
}

export interface ISegGenerateGoogleAuthCode {
  responseMessageDTO: ISuccessMessage;
  idUsuario: string;
  idMetodo2Fa: string;
  qr: string;
  estado: string;
}

export interface ISegValidateGoogleAuthCode extends ISegGenerateCode {}

export interface ISegGenerateEmailCode extends ISegGenerateCode {}

export interface ISegValidateEmailCode extends ISegGenerateCode {}

export interface ISegListHistory2FA {
  registros: ISegListH2FA[];
  totalPaginas: number;
  totalElementos: number;
}
