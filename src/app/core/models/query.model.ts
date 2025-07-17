export interface QueryModel {
    limit: number;
    page: number;
    where: Filtros;
  }

  export interface Filtros {

    nombreGrupoAleatorio: string;
    tipoDistribucion: number;
    distritoFiscal: number;
    especialidad: number;
    consideraTurnoFiscal: number;

  }
