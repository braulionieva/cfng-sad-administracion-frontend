export interface IListCentralNotificacionesRequest {
  nombreCentral: string;
  codigoCentral: string;
  pagina: number;
  registrosPorPagina: number;
}

export interface IPaginacionListCentralNotificaciones {
  registros: IListCentralNotificaciones[];
  totalPaginas: number;
  totalElementos: number;
}

export interface IListCentralNotificaciones {
  idCentral: string;
  nombreCentral: string;
  codigoCentral: string;
  idDistritoFiscal: number;
  nombreDistritoFiscal: string;
  usuarioCrea: string;
  usuarioModifica: string;
  numeracion: number;
}

export interface ICrearCentralNotificacionRequest {
  nombreCentral: string;
  idDistritoFiscal: number;
  usuarioCreacion: string;
  codigoCentral: string;
}

export interface ICrearCentralNotificacion extends IMessage {}

export interface IEditarCentralNotificacionRequest {
  idCentralNotificacion: string;
  nombreCentral: string;
  idDistritoFiscal: number;
  usuarioCreacion: string;
  codigoCentral: string;
}

export interface IEditarCentralNotificacion extends IMessage {}

export interface IEliminarCentralNotificacionRequest {
  idCentralNotificacion: string;
  usuarioCreacion: string;
}

export interface IEliminarCentralNotificacion extends IMessage {}

interface IMessage {
  timestamp: string;
  code: string;
  message: string;
}

export interface IMessageDuplicado {
  responseMessageDTO: IMessage;
  existe: string;
}

export interface IEditarCentralNotificacionDuplicado {
  responseMessageDTO: IMessage;
  existe: string;
}
