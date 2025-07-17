import { FormControl } from '@angular/forms';

export interface IPlazo {
  descripcionTipoPlazo: string;
  diasCalendarios: string;
  distritoFiscal: number | null;
  especialidad: null;
  etapa: null;
  flagDiasCalendarios: string;
  flagRestrictivo: string;
  idConfiguraPlazo: string;
  idDistritoFiscal: number | any;
  idEspecialidad: string | null;
  idEtapa: string | null;
  idTipoEspecialidad: number | any;
  idTipoPlazo: number | any;
  idTramite: string;
  numeracion: 1;
  plazo: number | null;
  restrictivo: string | null;
  tipoEspecialidad: number | null;
  tramite: string;
}

export interface IDropdownsData {
  tipos?: Array<any>;
  distritos_fiscales?: Array<any>;
  tipos_especialidad?: Array<any>;
  preEtapas_etapas?: Array<any>;
  preEtapas?: Array<any>;
  etapas?: Array<any>;
  unidades_medida?: Array<any>;
  complejidades?: Array<any>;
}

export interface IListPlazosRequestExcel {}

export interface IListPlazosRequest {}

export interface IPaginacionListPlazos {
  registros: IPlazo[];
  totalPaginas: number;
  totalElementos: number;
}

export interface ICrearPlazoRequest {}

export interface ICrearPlazo {}

export interface IEditarPlazoRequest {}

export interface IEditarPlazo {}

export interface IEliminarPlazoRequest {
  idConfiguraPlazo: string;
  idTipoPlazo: number;
  idNivelPlazo: number;
  usuarioCreacion: string;
}

export interface IEliminarPlazo {
  timestamo: string;
  code: string;
  message: string;
}
export interface IFormularioFiltros {
  tipo: number | null;
  plazo: string;
  distritoFiscal: number | null;
  tipoEspecialidad: number | null;
  especialidad: number | null;
  etapaPreEtapa: number | null;
  codigoTramite: string;
  tramite: string;
  diasCalendario: string | null;
  restrictivo: string | null;
}

export type IFormularioFiltrosControls = {
  [key in keyof IFormularioFiltros]: FormControl<IFormularioFiltros[key]>;
};
