export interface MenuInterface {
  idMenu?: number;
  idAplicacionPadre?: number;
  codigoAplicacion: string;
  nombreAplicacion: string;
  siglasAplicacion: string;
  nombreCortoAplicacion?: string;
  descripcionFuncion?: string;
  descripcionRuta: string;
  descripcionTag: string;
  codigoUsuarioCreador?: string;
  codigoUsuarioActualiza?: string;
}

export interface ActualizarOrden {
  idMenu: number;
  idPadreMenu: number;
  nuevoOrden: number;
  codigoUsuarioActualiza?: string;
}

export interface SiDuplicadoNodoCoVAplicacionRes {
  code: number;
  message: string;
  data: boolean;
}
