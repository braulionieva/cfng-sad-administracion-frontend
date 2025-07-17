export interface IListCargosRequestExcel {
  nombreCargo: string;
  idJerarquia: number;
  idCategoriaCargo: number;
}

export interface IListCargosRequest {
  nombreCargo: string;
  idJerarquia: number;
  idCategoriaCargo: number;
  pagina: number;
  registrosPorPagina: number;
}

export interface IPaginacionListCargos {
  registros: IListCargos[];
  totalPaginas: number;
  totalElementos: number;
}

export interface ICrearCargoRequest {
  nombreCargo: string;
  abreviaturaNombreCargo: string;
  codigoCargo: string;
  idJerarquia: number;
  idCategoriaCargo: number;
  codigoUserName: string;
  ip: string;
}
export interface ICrearCargo {
  responseMessageDTO: ICargoMessage;
  existe: string;
}

export interface IEditarCargoRequest {
  idCargo: number;
  nombreCargo: string;
  abreviaturaNombreCargo: string;
  codigoCargo: string;
  idJerarquia: number;
  idCategoriaCargo: number;
  codigoUserName: string;
  ip: string;
}

export interface IEliminarCargoRequest {
  idCargo: number;
  codigoUserName: string;
}

export interface IEditarCargo {
  responseMessageDTO: ICargoMessage;
  existe: string;
}

export interface IEliminarCargo {
  responseMessageDTO: ICargoMessage;
}

export interface ICargoMessage {
  timestamp: string;
  code: string;
  message: string;
}

interface IListCargos {
  idCargo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  codigoJerarquia: number;
  jerarquia: string;
  codigoCategoria: number;
  categoria: string;
  creacion: string;
  modificacion: string;
  numeracion: number;
}

export interface IListCargosExcel {
  idCargo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  codigoJerarquia: number;
  jerarquia: string;
  codigoCategoria: number;
  categoria: string;
  creacion: string;
  modificacion: string;
}
