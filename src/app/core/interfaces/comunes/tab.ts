import {TipoIcono} from "@core/types/IconType";

export interface Tab {
  id?:number,
  titulo: string,
  ancho?: number,
  icono?: TipoIcono,
  cantidad?: number,
  oculto?: boolean,
  color?: string,
}
