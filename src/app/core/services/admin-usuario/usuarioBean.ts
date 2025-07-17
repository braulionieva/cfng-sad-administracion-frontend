interface IMessage {
  timestamp: string;
  code: string;
  message: string;
}

export interface SiDuplicadoDocumentoRes {
  code: number;
  message: string;
  data: boolean;
}
