export interface TipoActoprocesal {
    tipoContenido: string;
    nombre: string;
}

export interface AcusacionTRow {
    secuencia: number;
    cantidad: number;
    idNGestionarContenido: number;
    idVEtapa: string;
    idVActoProcesal: string;
    nuVArticulo: string;
    noVArticulo: string;
    esCGestionarContenido: string;
    feDCreacion: Date;
    feDCreacionStr: string;
    coVUsCreacion: string;
    usrCrea: string;
    feDModificacion: Date;
    feDModificacionStr: string;
    coVUsModificacion: string;
    usrModifica: string;
}



export interface BuscarAcusacionReqFiltro {
    idVActoProcesal: string;
    noVArticulo: string;
}

export interface BuscarAcusacionReq {
    pages: number;
    perPage: number;
    filtros: BuscarAcusacionReqFiltro;
}

export interface AcusacionRes {
    registros: AcusacionTRow[];
    totalPaginas: number;
    totalElementos: number;
}

export interface SobreseimientoTRow {
    secuencia: number;
    cantidad: number;
    idNGestionarContenido: number;
    idVEtapa: string;
    idVActoProcesal: string;
    nuVArticulo: string;
    noVArticulo: string;
    esCGestionarContenido: string;
    feDCreacion: Date;
    feDCreacionStr: string;
    coVUsCreacion: string;
    usrCrea: string;
    feDModificacion: Date;
    feDModificacionStr: string;
    coVUsModificacion: string;
    usrModifica: string;
}

export interface BuscarSobreseimientoReqFiltro {
    idVActoProcesal: string;
    noVArticulo: string;
}

export interface BuscarSobreseimientoReq {
    pages: number;
    perPage: number;
    filtros: BuscarSobreseimientoReqFiltro;
}

export interface SobreseimientoRes {
    registros: SobreseimientoTRow[];
    totalPaginas: number;
    totalElementos: number;
}

export interface AcusacionObjForm {
    idNGestionarContenido: number;
    nuVArticulo: string;
    noVArticulo: string;
    coVUsCreacion: string;
    coVUsModificacion: string;
}

export interface AgregarAcusacionReq {
    nuVArticulo: string;
    noVArticulo: string;
    coVUsCreacion: string;
}

export interface AgregarAcusacionRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
    ID_N_GESTIONAR_CONTENIDO: number;
}

export interface ActualizarAcusacionReq {
    idNGestionarContenido: number;
    nuVArticulo: string;
    noVArticulo: string;
    coVUsModificacion: string;
}

export interface ActualizarAcusacionRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface SobreseimientoObjForm {
    idNGestionarContenido: number;
    nuVArticulo: string;
    noVArticulo: string;
    coVUsCreacion: string;
    coVUsModificacion: string;
}

export interface AgregarSobreseimientoReq {
    //nuVArticulo: string;
    noVArticulo: string;
    coVUsCreacion: string;
}

export interface AgregarSobreseimientoRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
    ID_N_GESTIONAR_CONTENIDO: number;
}

export interface ActualizarSobreseimientoReq {
    idNGestionarContenido: number;
    noVArticulo: string;
    coVUsModificacion: string;
}

export interface ActualizarSobreseimientoRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface EliminarAcusacionReq {
    idNGestionarContenido: number;
    coVUsModificacion: string;
}

export interface EliminarAcusacionRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface EliminarSobreseimientoReq {
    idNGestionarContenido: number;
    coVUsModificacion: string;
}

export interface EliminarSobreseimientoRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}
