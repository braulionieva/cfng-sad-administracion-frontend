/**
//todos los beans de aplicacion
export interface BuscarAplicacioRes {
    secuencia:number;
    idNAplicacion: number;
    coAplicacion: string;
    logo: Blob;
    devSiglas: string;
    noVAplicacion: string;
    idNCategoria: number;
    noVCategoria: string;
    idNCategoriaFuncional: number;
    idNModuloSig: number;
    noVModuloSig: string;
    //idNEntidad: number;
    coVEntidad: string | null;
    noVEntidad: string;
    idNSad: number;
    flCNueva: string;
    deFlCNueva: string;
    esCAplicacion: string;
    noEsCAplicacion: string;

    //datos de oauth
    idVAppLogin: string;
}

export interface BuscarAplicacioResWrap {
    registros: BuscarAplicacioRes[];
    totalPaginas: number;
    totalElementos: number;
}

// export interface Disponibilidad {
//     idNDisponibilidad: number;
//     noVdisponibilidad: string;
//     esCdisponibilidad: string;
// }

// export interface DisponibilidadResponse {
//     idNDisponibilidad: number;
//     noVdisponibilidad: string;
//     esCdisponibilidad: string;
// }

export interface DisponibilidadResponse {
    idNCatalogo: number;
    noVDescripcion: string;
}

export interface TargetResponse {
    idNCatalogo: number;
    coVDescripcion: string;
    noVDescripcion: string;
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

export interface CategoriaFuncionalResponse {
    idNCategoriaFuncional: number;
    coVCategoriaFuncional: string;
    noVCategoriaFuncional: string;
    nuNOrden: number;
    esCCategoriaFuncional: string;
}

export interface ModuloSigResponse {
    idNModuloSig: number;
    coVModuloSig: string;
    coVAbrvSig: string;
    noVModuloSig: string;
    idNModuloSigPadre: number;
    nuNOrdenSig: number;
}

export interface SubModuloSigResponse {
    idNModuloSig: number;
    coVModuloSig: string;
    coVAbrvSig: string;
    noVModuloSig: string;
    idNModuloSigPadre: number;
    nuNOrdenSig: number;
}

export interface DependenciaPropietariaResponse {
    //idNEntidad: number;
    coVEntidad: string | null;
    noVEntidad: string;
    noVEntidadCorto: string;
    deVSiglas: string;
    coVSiga: string;
    coVSigaDf: string;
    esCEntidad: string;
}


export interface ArquitecturaResponse {
    idNArquitectura: number;
    coVArquitectura: string;
    deVLogo: string;
    noVArquitectura: string;
}

export interface AgregarAplicacionReq {
    idNAplicacion: number;
    coVAplicacionLogo: string | null;
    coVAplicacion: string;
    noVAplicacion: string;
    deVSiglas: string;
    noVCortoAplicacion: string | null;
    deVFuncion: string | null;
    nuNOrden: number;
    deVRuta: string | null;
    deVClaseColor: string | null;
    feDLanzto: Date | string | null;
    deVVersion: string | null;
    feDVersion: Date | string | null;
    esCAplicacion: string;
    ipVAcceso: string | null;
    //feDCreacion: Date | string;
    feDModificacion: Date | string | null;
    idNSad: number | null;
    flCVer: string;
    idNTipo: number;
    deVPalabClvs: string | null;
    flCNueva: string;
    noVAnt: string | null;
    deVSiglasAnt: string | null;
    noVCortoAnt: string | null;
    deCRutaAnt: string | null;
    deVLogoAnt: string | null;
    idNArquitectura: number | null;
    idNCategoria: number;
    idNCategoriaFuncional: number | null;
    //idNEntidad: number | null;
    coVEntidad: string | null;
    idNModuloSig: number | null;
    idNAplicacionPadre: number | null;
    coVUsCreacion: string | null;
    idNTipoSistema: number | null;
    coVUsModificacion: string | null;
    deVEncrPass: string | null;
    idNTarget: number | null;
    idNDisponibilidad: number | null;
    idNCategoriaAnt: number | null;
    deVTag: string | null;
    coVUsDesactivacion: string | null;
    feDDesactivacion: Date | string | null;


}
export interface AgregarAplicacionRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
    PO_N_ID_N_APLICACION: number;
}

export interface AgregarSatvOAuth2AppLoginReq {
    idVAppLogin: string | null;
    idNApplication?: number | null;//preguntar si se usa
    esCAppLogin: string;
    nuNDurToken: number;
    nuNDurRefrToken: number;
    ipVAcceso?: string | null;
    feDCreacion?: Date | null;
    feDModificacion?: Date | null;
    idNAplicacion?: number | null;
    coVUsCreacion?: string | null;
    coVUsModificacion?: string | null;
    coVAuthApi: string; //*
    coVUsDesactivacion?: string | null;
    feDDesactivacion?: Date | null;
    deVRutaDireccionamiento?: string | null;
    coVClienteid: string | null;
}

export interface AgregarSatvOAuth2AppLoginRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface AgregarAplicacionFormReq {
    aplicacionReq: AgregarAplicacionReq;
    authReq: AgregarSatvOAuth2AppLoginReq;
}

export interface AgregarAplicacionFormRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
    PO_N_ID_N_APLICACION: number;
}

export interface Character {
    name: string;
    power: number;
}

export interface AplicacionDTOB {
    idNAplicacion: number;
    noVAplicacion: string;
}

export interface AplicacionDTO {
    idNAplicacion: number;
    coVAplicacionLogo: string | null;
    coVAplicacion: string;
    noVAplicacion: string;
    deVSiglas: string;
    noVCortoAplicacion: string | null;
    deVFuncion: string | null;
    nuNOrden: number;
    deVRuta: string | null;
    deVClaseColor: string | null;
    feDLanzto: Date | string | null;
    deVVersion: string | null;
    feDVersion: Date | string | null;
    esCAplicacion: string;
    ipVAcceso: string | null;
    feDCreacion: Date | string;
    feDModificacion: Date | string | null;
    idNSad: number | null;
    flCVer: string;
    idNTipo: number;
    deVPalabClvs: string | null;
    flCNueva: string;
    noVAnt: string | null;
    deVSiglasAnt: string | null;
    noVCortoAnt: string | null;
    deCRutaAnt: string | null;
    deVLogoAnt: string | null;
    idNArquitectura: number | null;
    idNCategoria: number;
    idNCategoriaFuncional: number | null;
    //idNEntidad: number | null;
    coVEntidad: string | null;
    idNModuloSig: number | null;
    idNAplicacionPadre: number | null;
    coVUsCreacion: string | null;
    idNTipoSistema: number | null;
    coVUsModificacion: string | null;
    deVEncrPass: string | null;
    idNTarget: number | null;
    idNDisponibilidad: number | null;
    idNCategoriaAnt: number | null;
    deVTag: string | null;
    coVUsDesactivacion: string | null;
    feDDesactivacion: Date | string | null;
}

export interface Oauth2AppLoginDTO {
    idVAppLogin: string;
    idNApplication: number | null;
    esCAppLogin: string;
    nuNDurToken: number;
    nuNDurRefrToken: number;
    ipVAcceso: string | null;
    feDCreacion: Date | string | null;
    feDModificacion: Date | string | null;
    idNAplicacion: number | null;
    coVUsCreacion: string | null;
    coVUsModificacion: string | null;
    coVAuthApi: string;
    coVUsDesactivacion: string | null;
    feDDesactivacion: Date | string | null;
    deVRutaDireccionamiento: string | null;
    coVClienteid: string | null;
}

// export interface ActualizarAplicacionFormReq {
//     aplicacionReq: AgregarAplicacionReq;
//     authReq: AgregarSatvOAuth2AppLoginReq;
// }

export interface ActualizarAplicacionFormRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface EliminarAplicacioRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface EliminarAplicacioReq {
    idNAplicacion: number;
    coVUsCreacion: string | null;
    //datos de oauth
    idVAppLogin: string|null;
}

export interface FiltroSearchReq{
    keyword:string;
}

export interface ServidorDTOB {
    idNServidor: string;
    noVServidor: string;
}

export interface ServidorAplicacionRow {
    idNAplicacionServidor: number;
    idNAplicacion: number;
    idNServidor: number;
    noVServidor: string; // Adicionado para mostrar nombre del servidor
    deVDisponibilidad: string; // Adicionado para mostrar disponibilidad
}

export interface ServidorAplicacionDTO {
    idNAplicacionServidor: number;
    idNFormaAuth: number;
    ipVAcceso: string;
    feDCreacion: Date;
    feDModificacion: Date;
    idNAplicacion: number;
    coVUsCreacion: string;
    idNServidor: number;
    coVUsModificacion: string;
    noVServidor: string;
    deVDisponibilidad: string;
}

export interface AsociarServidorAplicacionRes {
    PO_V_ERR_COD: string;
    PO_V_ERR_MSG: string;
}

export interface DataModal {
  isVisible:boolean;
  //isEditForm: boolean;
  //aplicacionSelected: BuscarAplicacioRes
}
**/
