export interface BandejaEstadoDeNotificacionResponse {
    idRow?: string,
    idEstadoCedula?: number,
    notificacion?: string,
    citacion?: string,
    esGenNotificaciones?: string,
    esCenNotificaciones?: string,
    esGenCitaciones?: string,
    esGeneral?: string,
    esApp?: string,
    flagEstado?: string,
    flagEditarApp?: string,
    usuarioCreador?: string,
    usuarioModificador?: string,
    observacion?: string
}

export interface EstadoDeNotificacionRequest {
    idEstadoCedula?: number,
    esGenNotificaciones?: string,
    esGenCitaciones?: string,
    esCenNotificaciones?: string,
    esApp?: string,
    esGeneral?: string,
    flagEditarApp?: string,
    observacion?: string,
    usuarioCreador?: string,
    usuarioModificador?: string
}

export interface FiltroEstadoNotificacionRequest {
  pages: number;
  perPage: number;
  filtros: FiltroEstadoNotificacion;

}

//cambiar en el futuro para los valores reales o correctos y borrar este comentario
export interface FiltroEstadoNotificacion {
  codigo: string;
  filtroGn: string;
  filtroGc: string;
  filtroCn: string;
  filtroApp: string;
  dCreacionInicio: Date | null;
  dCreacionFin: Date | null;
  dModificacionInicio: Date | null;
  dModificacionFin: Date | null;
}
