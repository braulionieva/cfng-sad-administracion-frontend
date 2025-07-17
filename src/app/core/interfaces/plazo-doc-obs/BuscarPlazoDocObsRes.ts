export interface BuscarPlazoReq {
    pages: number;
    perPage: number;
    filtros: BuscarPlazoReqFiltro;
}

export interface BuscarPlazoReqFiltro{
    idConfiguradoPor: string;
    idNDistritoFiscal: number;
    idNTipoEspecialidad: number;
    idVEspecialidad: string;
}
export interface BuscarPlazoDocObsRes{
    registros:BuscarPlazoDocObsRow[];
    totalPaginas: number;
    totalElementos: number;
}

export interface BuscarPlazoDocObsRow {
    secuencia: number;
    idVPlazoCaso:string;
    noVDescripcion: string;
    noVDistritoFiscal: string;
    noVTipoEspecialidad: string;
    noVEspecialidad: string;
    nuNPlazoEvaluar: string;
    nuNPlazoAlerta: string;
    feDCreacion: Date;
    usrCrea: string;
    feDModificacion: Date;
    usrModifica: string;
    cantidadRegistro: number;
}

export interface TipoConfiguracionPlazo{
    idNTipoConfiguracion:number;
    //noConfiguradoPor:string;//NO_V_DESCRIPCION
    noVDescripcion:string;
}

export interface DistritoFiscalDTOB {
    idNDistritoFiscal: number;
    noVDistritoFiscal: string;
}

export interface EspecialidadDTOB {
    idVEspecialidad: string;
    noVEspecialidad: string;
}

export interface TipoEspecialidadDTOB {
    idNTipoEspecialidad: number;
    noVTipoEspecialidad: string;
}

//para nuevo registro
export interface PlazoForm{
    idVPlazoCaso:string;
    idNTipoConfiguracion:number;
    idNDistritoFiscal: number;
    idNTipoEspecialidad: number;
    idVEspecialidad: string;
    nuNPlazoEvaluar: number;
    nuNPlazoAlerta: number;
    feDCreacion: Date;
    usrCrea: string;
    feDModificacion: Date;
    usrModifica: string;
    idNTipoDiasEvaluar:number;
    idNTipoDiasAlerta:number;
    flCTipoBandeja:number;//siempre es 2 para este cus
}

export interface TipoDias{
    idNCatalogo:number;
    noVDescripcion:string;
}

export interface InsertarPlazoRes{
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
    PO_ID_V_PLAZO_CASO: string;
}

//usado para obtener datos y editarlos
export interface PlazoFormEdit {
    idVPlazoCaso: string;
    idNTipoConfiguracion: number;
    noVDescripcion: string;
    idNDistritoFiscal: number;
    noVDistritoFiscal: string;
    idNTipoEspecialidad: number;
    noVTipoEspecialidad: string;
    idVEspecialidad: string;
    noVEspecialidad: string;
    idNTipoDiasEvaluar: number;
    nuNPlazoEvaluar: number;
    nuNPlazoEvaluarConDias: string;
    idNTipoDiasAlerta: number;
    nuNPlazoAlerta: number;
    nuNPlazoAlertaConDias: string;
    feDCreacion: string;
    usCrea: string;
    feDModificacion: string;
    usModifica: string;
}

export interface ActualizarPlazoRes{
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
    PO_ID_V_PLAZO_CASO: string;
}

//para eliminar registro
export class EliminarPlazoReq {
  idVPlazoCaso: string;
  esCPlazoCaso: string;
  coVUsModificacion: string | null;
  coVUsDesactivacion: string | null;
}

export interface EliminarPlazoRes{
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface ConfigPage{
    pages:number,
    perPage:number
}

export interface ValidarUnicidadPlazPorEspecialidad {
    idNTipoConfiguracion: number;
    idNDistritoFiscal: number;
    idNTipoEspecialidad: number;
    idVEspecialidad: string;
}
