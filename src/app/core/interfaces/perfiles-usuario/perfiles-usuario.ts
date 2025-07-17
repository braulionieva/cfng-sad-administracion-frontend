export interface PerfilCategoria {
  id: number;
  categoria: string;
}

export interface PerfilSistema {
  id: number;
  sigla: string;
  aplicacion: string;
}

export interface DataTreeNodeRequest {
  idPerfilAplicacion: bigint;
  idPerfiles: Array<number>;
  idAplicacion: any;
  estado: string;
  ipAcceso: string;
  codUser: string;
  noUsuario: string;
}
