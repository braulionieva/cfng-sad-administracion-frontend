//Bandeja despacho

export interface DespachoBandejaRequest {
  pages: number;
  perPage: number;
  filtros: Filtros;

}

export interface Filtros {
  nombreDespacho: string;
  codigoDistritoFiscal: BigInt;
  codigoDependencia: string;
}

export interface DespachoResponse {
  registros: DespachoBandejaResponse[];
  totalPaginas: number;
  totalElementos: number;
}

export interface DespachoBandejaResponse {
  secuencia: bigint;
  codigo: string;
  nombre: string;
  nombreDistritoFiscal: string;
  nombreDependencia: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaCreacionFormato: string;
  fechaModificacionFormato: string;
  noUserCrea: string;
  noUserModi: string;
}

export interface Despacho {
  codigo: string;
  nombre: string;
  coDistritoFiscal: bigint;
  coSede: string;
  coDependencia: string;//codigo real de dependencia
  codigoDependencia: string;//codigo alternativo mostrado en caja
  nuDespacho: bigint;
  coTopologia: string;
  coUsuario: string;
  nombreDistritoFiscal: string;
  nombreDependencia: string;
  nombreSede: string;
}

export interface DistritoFiscal {
  codigo: BigInt;
  nombre: string;
}

export interface Dependencia {
  codigo: string;
  nombre: string;
}

export interface Sede {
  codigo: string;
  nombre: string;
}

export interface Topologia {
  codigo: string;
  nombre: string;
}

/**
// export interface DespachoForm {
//   nombreDespacho: string | null;
//   idDistritoFiscal: number | null;
//   idSede: number | null;
//   idDependencia: number | null;
//   coDependencia: string | null;
//   nuDespacho: string | null;
//   idTopologia: number | null;
// }
**/

export interface DataModalDespacho {
  isVisible: boolean;
  despacho: Despacho,
  cmbDf: any[],
  cmbSede: any[],
  cmbDep: any[]
}

