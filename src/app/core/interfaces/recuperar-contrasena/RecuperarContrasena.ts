export interface RecuperarContrasenaPremailReq {
  //email para enviar el correo, se valida en el backend
  emailUsuario: string;

  //url usuario
  baseUrlBrowser:string;

  //ruta para digitar la nueva clave, sin toke xq el token se completará en el servidor
  urlRecuperarContrasenaPostemail:string;
}

export interface RecuperarContrasenapremailRes {
  timestamp: string;
  code: string;
  message: string;
}

export interface ValidarTokenRecuperarPwReq {
  tokenRecuperarPw: string;
}

export interface UsuarioRecuperacionPw {
  idVUsuario: string;
  idVPersona: string;
  coVUsername: string;
  nombres: string;
  coVTokenRecuperarPw: string;
  flCTokenUsadoRecuperarPw: string;
  feDExpTokenRecuperarPw: string;
}
