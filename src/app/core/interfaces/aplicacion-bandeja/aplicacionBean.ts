//todos los beans de aplicacion
export interface BuscarAplicacioRes {
  secuencia: number; // Número de fila (ROW_NUMBER)
  cantidad: number; // Cantidad total de registros (COUNT(*) OVER ())
  idNAplicacion: number; // ID de la aplicación
  coVAplicacion: string; // Código de la aplicación
  logo: Uint8Array; // Logo de la aplicación (IM_BL_LOGO), representado como arreglo de bytes en TypeScript
  noVLogo: string; //NO_V_LOGO
  deVExtension: string; //DE_V_EXTENSION
  deVSiglas: string; // Siglas de la aplicación
  noVAplicacion: string; // Nombre de la aplicación
  feDLanzto: Date; // Fecha de lanzamiento en formato Date (FE_D_LANZTO)
  feDLanztoStr: string; // Fecha de lanzamiento en formato String (FE_D_LANZTO_STR)
  deVVersion: string; // Versión de la aplicación (DE_V_VERSION)
  idNCategoria: number; // ID de la categoría
  noVCategoria: string; // Nombre de la categoría
  coVEntidad: string; // Código de la entidad
  noVEntidad: string; // Nombre de la entidad
  //esCAplicacion: string; // Estado de la aplicación incluido eliminado
  flCVer: string; // Estado de la aplicación (1 o 0)
  noEsCAplicacion: string; // Descripción del estado flCVer (ACTIVA/INACTIVA)

  //adicional para la extension del logo
  extension: string;

}

export interface BuscarAplicacionReq {
  pages: number;
  perPage: number;
  filtros:BuscarAplicacionFiltro;
}

export interface BuscarAplicacionFiltro {
  noVAplicacion: string;
  coAplicacion: string;
  deVSiglas: string;
  idNCategoria: number;
  feDLanzto: Date | string | null;
}

export interface CategoriaResponse {
  idNCategoria: number;
  idNCategoriaPadre: number;
  coVCategoria: string;
  noVCategoria: string;
  noVCategoriaPlural: string;
  deVIcono: string;
  nuNOrden: number;
  esCCategoria: string;
}

export interface BuscarAplicacioResWrap {
  registros: BuscarAplicacioRes[];
  totalPaginas: number;
  totalElementos: number;
}

export interface CategoriaResponse {
  idNCategoria: number;
  idNCategoriaPadre: number;
  coVCategoria: string;
  noVCategoria: string;
  noVCategoriaPlural: string;
  deVIcono: string;
  nuNOrden: number;
  esCCategoria: string;

}

export interface DataModal {
  isVisible: boolean;
  /**isEditForm: boolean;
  aplicacionSelected: BuscarAplicacioRes
  **/
}

export interface AplicacionForm {
  idNAplicacion: number; // ID_N_APLICACION
  coVAplicacion: string; // CO_V_APLICACION
  noVAplicacion: string; // NO_V_APLICACION
  deVSiglas: string; // DE_V_SIGLAS
  idNAplicacionPadre: number; // ID_N_APLICACION_PADRE
  deVRuta: string; // DE_V_RUTA
  deVClaseColor: string; // DE_V_CLASE_COLOR
  feDLanzto: Date; // FE_D_LANZTO
  deVVersion: string; // DE_V_VERSION
  feDVersion: Date; // FE_D_VERSION
  idNDisponibilidad: number; // ID_N_DISPONIBILIDAD
  flCVer: string; // FL_C_VER
  idNCategoria: number; // ID_N_CATEGORIA
}

export interface AplicacionDTOB {
  idNAplicacion: number;
  noVAplicacion: string;
}

export interface DisponibilidadResponse {
  idNCatalogo: number;
  noVDescripcion: string;
}

export interface DisponibilidadResponse {
  idNCatalogo: number;
  noVDescripcion: string;
}

//usado para nuevo y edicion
export interface AgregarAplicacionReq {
  idNAplicacion: number; // ID_N_APLICACION
  coVAplicacion: string; // CO_V_APLICACION
  noVAplicacion: string; // NO_V_APLICACION
  deVSiglas: string; // DE_V_SIGLAS
  idNAplicacionPadre: number; // ID_N_APLICACION_PADRE
  deVRuta: string; // DE_V_RUTA
  deVClaseColor: string; // DE_V_CLASE_COLOR
  feDLanzto: Date; // FE_D_LANZTO
  deVVersion: string; // DE_V_VERSION
  feDVersion: Date; // FE_D_VERSION
  idNDisponibilidad: number; // ID_N_DISPONIBILIDAD
  flCVer: string; // FL_C_VER
  idNCategoria: number; // ID_N_CATEGORIA
  coVUsCreacion: string | null;
}

export interface AgregarAplicacionRes {
  code: number;
  message: string;
  data: boolean;
}

export interface EliminarAplicacioReq {
  idNAplicacion: number;
  coVUsCreacion: string | null;
}

export interface EliminarAplicacioRes {
  PO_V_ERR_COD: string;
  PO_V_ERR_MSG: string;
}

export interface IDatosLogo {
  nombre: string;
  extension: any;
  tamano: number;
  base64: any;
}

export interface AgregarLogoAppReq {
  //idNAplicacionLogo?: number;
  idNAplicacion?: number;
  noVLogo?: string;
  nuNTamanio?: number;
  deVExtension?: string;
  imBlLogo?: Uint8Array;
  imagenLogo?: string; // string en base64 para la imagen
  coVUsCreacion?: string;
}

export interface AgregarLogoAppRes extends IMessage { }

interface IMessage {
  timestamp: string;
  code: string;
  message: string;
}

export interface ActualizarAplicacionRes extends IMessage { }

export interface EliminarLogoAplicacioReq {
  idNAplicacion?: number;
  coVUsModificacion: string | null;
}

export interface EliminarLogoAplicacioRes extends IMessage { }

export interface SiDuplicadoCoVAplicacionRes {
  code: number;
  message: string;
  data: boolean;
}
