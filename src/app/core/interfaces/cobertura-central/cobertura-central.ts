export interface ListaDepartamento {
  codigoReniec: string;
  codigoInei: string;
  departamento: string;
}

export interface ListaProvincia {
  codigoDptoReniec: string;
  codigoProvReniec: string;
  codigoDptoInei: string;
  codigoProvInei: string;
  provincia: string;
}

export interface ListaDistrito {
  idUbigeo: number;
  distrito: string;
  idCentralCobertura: any;
  idCentral: any;
  flagInei: any;
  flagReniec: any;
  estado: any;
}

export interface IPaginacionListaDistrito {
  registros: ListaDistrito[];
  totalPaginas: number;
  totalElementos: number;
}
