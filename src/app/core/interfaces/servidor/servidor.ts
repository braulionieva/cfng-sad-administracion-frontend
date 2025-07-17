import { Filtros } from "@interfaces/shared/shared";

export interface ServidorBandejaRequest {
    pages: number;
    perPage: number;
    filtros: Filtros;
}

export interface ServidorBandejaResponse {
    registros: ServidorBandeja[];
    totalPaginas: number;
    totalElementos: number;
  }
  
  export interface ServidorBandeja {
            id : number;
            secuencia : number;
            nombre : string;
            tipo : string;
            disponibilidad : string;
            ambiente : string;
            central :  string;
            listaDeApps : string;
            administraCuenta : string;
            estado : string;
  }


  export interface ServidorDTO {

    idServidor?: number;
    nombreServidor : string;
    idTipoServidor : number;
    idDisponibilidad : number;
    idAmbiente : number;
    descripcion ?: string | null;
    estadoServidor : string;
    esCentral : string ;
    contieneListaApps : string;
    contieneAdministracionDeCuenta : string;
    
}