export interface TramitePorActoProcesalBandejaResponse {
    registros: TramiteBandejaResponse[];
    totalElementos: number;
}

export interface TramiteBandejaResponse {
    codigo?: string,
    idTramite?: string,
    tramite?: string,
    tipoCuaderno?: string,
    tipoEspecialidad?: string,
    esppecialidad?: string,
    jerarquia?: string,
    tipoProceso?: string,
    subTipoProceso?: string,
    etapa?: string,
    actoProcesal?: string,
    estado?: string,
    usuarioCrea?: string,
    usuarioModifica?: string
}

export interface ConfiguracionesResponse {
    codigoConfiguracion?: string,
    idEstadoCaso?: string,
    estadoCaso?: string,
    codigoActoProcesal?: string,
    actoProcesal?: string
}

export interface TramiteEliminacionRequest {
    idActoProcesal?: string,
    idConfiguracion?: string,
    nombreActoProcesal?: string,
    usuarioDesactivador?: string,
    usuarioCreador?: string
}

export interface TramitelMensajeResponse {
    timestamp?: string,
    code?: string,
    message?: string
}

export interface TramiteConfiguracionRequest {
    idTramite?: string,
    idConfiguracion?: string,
    nombreTramite?: string,
    usuarioDesactivador?: string,
    usuarioCreador?: string
}

export interface ActoProcesalRelacionadoResponse {
    codigoConfiguracion?: string,
    cuaderno?: string,
    tipoEspecialidad?: string,
    especialidad?: string,
    jerarquia?: string,
    tipoProceso?: string,
    subTipoProceso?: string,
    etapa?: string
}