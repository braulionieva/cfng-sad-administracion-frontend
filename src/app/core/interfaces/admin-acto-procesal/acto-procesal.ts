export interface BandejaActoProcesal {
  idRow?: number,
  idActoProcesal?: string,
  actoProcesal?: string,
  opciones?: string
}

export interface ActoProcesalBandejaResponse {
  registros: BandejaActoProcesal[];
  totalElementos: number;
}

export interface ActoProcesaleResponseWrapper {
  registros: ActoProcesalBandejaDetalleResponse[];
  totalPaginas: number;
  totalElementos: number;
}

export interface ActoProcesalBandejaDetalleResponse {
  indexRow?: number,
  codigo?: string,
  idActoProcesal?: string,
  actoProcesal?: string,
  usuarioCrea?: string,
  usuarioModifica?: string,
  tipoCarpetaCuaderno?: string,
  tipoEspecialidad?: string,
  especialidad?: string,
  jerarquia?: string,
  tipoProceso?: string,
  subTipoProceso?: string,
  etapa?: string
}

export interface ContadorTramites {
  totalTramites?: number
}

export interface ActoProcesalConfiguracionRequest {
  idActoProcesal?: string,
  idConfiguracion?: string,
  nombreActoProcesal?: string,
  usuarioDesactivador?: string,
  usuarioCreador?: string
}

export interface ActoProcesalMensajeResponse {
  timestamp?: string,
  code?: string,
  message?: string
}

export interface ActoProcesalRegistradoResponse {
  idActoProcesal?: string
}

export interface ConfiguracionRequest {
  usuarioCreador: string,
  flagCarpetaPrincipal: string,
  idActoProcesal: string,
  idTipoCuaderno: string,
  idTipoEspecialidad: string,
  idEspecialidad: string,
  idJerarquia: string,
  idTipoProceso: string,
  idSubTipoProceso: string,
  idEtapa: string
}
