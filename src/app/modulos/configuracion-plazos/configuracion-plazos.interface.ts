export interface EliminacionPlazoResponse {
  timestamp: string;
  code: string;
  message: string;
}

export interface PlazoResponse {
  registros: Plazo[];
  totalPaginas: number;
  totalElementos: number;
}

export interface Plazo {
  rnum: string;
  codigoPlazo: string;
  tipoConfiguracion: number;
  configuradoPor: string;
  idDistrito: number;
  DistritoFiscal: string;
  idTipoEspecialidad: number;
  tipoEspecialidad: string;
  idEspecialidad: string; // string code
  especialidad: string;
  plazoEvaluar: number;
  tipoDiasEvaluar: number;
  plazoParaEvaluar: string;
  plazoAlerta: number;
  tipoDiasAlerta: number;
  plazoParaMostrarAlerta: string;
  creacion: string;
  modificacion: string;
}
export interface IPlazo {
  id: number;
  configurado: string;
  distrito_fiscal: string;
  tipo_especialidad: string;
  especialidad: string;
  plazo_evaluar: ITipoPlazo;
  plazo_mostrar: ITipoPlazo;
  creacion: IDetalle;
  modificacion: IDetalle;
}
interface ITipoPlazo {
  cantidad: number;
  tipo: number;
}

interface IDetalle {
  nombre: string;
  fecha: string;
}

export interface IDropdown {
  name: string;
  value: any;
}

export type action = 'create' | 'save' | 'delete';
