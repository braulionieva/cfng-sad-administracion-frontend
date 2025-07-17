export interface IListPlazoDetencionFlagranciaRequest {
  tipoEspecialidad: number;
  idEspecialidad: number;
  pagina: number;
  registrosPorPagina: number;
}

export interface IListPlazoDetencionFlagranciaExcelRequest {
  tipoEspecialidad: number;
  idEspecialidad: number;
}

export interface IPaginacionListPlazoDetencionFlagrania {
  registros: IListPlazoDetencionFlagrancia[];
  totalPaginas: number;
  totalElementos: number;
}

export interface IListPlazoDetencionFlagrancia {
  idPlazoTurno: number;
  categoria: string;
  especilidad: string;
  plazoDeDetencionHoras: number;
  plazoDeDetencionDias: number;
  usuarioCrea: string;
  usuarioModifica: string;
  numeracion: number;
}

export interface ICrearPlazoDetencionRequest {
  tipoEspecialidad: number;
  idEspecialidad: string;
  plazo: number;
  comentario: string;
  codigoUserName: string;
}

export interface ICrearPlazoDetencion extends IMessage {}

export interface IEditarPlazoRequest {
  idPlazoFlagrancia: number;
  tipoEspecialidad: number;
  idEspecialidad: string;
  plazo: number;
  comentario: string;
  codigoUserName: string;
}

export interface IEditarPlazoDetencion extends IMessage {}

export interface IEliminarPlazoRequest {
  idPlazoFlagrancia: number;
  codigoUserName: string;
}

export interface IEliminarPlazoDetencion extends IMessage {}
interface IMessage {
  timestamp: string;
  code: string;
  message: string;
}
