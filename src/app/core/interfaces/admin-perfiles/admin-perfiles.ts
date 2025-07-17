export interface IListPerfilesRequest {
  idAplicacion: number;
  pagina: number;
  registrosPorPagina: number;
}

export interface IPaginacionListPerfiles {
  registros: Perfil[];
  totalPaginas: number;
  totalElementos: number;
}

export interface Categoria {
  idCategoria: number;
  nombreCategoria: string;
}

export interface Aplicacion {
  idAplicacion: number;
  idCategoria: number;
  idOpcion: number;
  nombreAplicacion: string;
  deSiglas: string;
}

export interface Perfil {
  idPerfil: number;
  idAplicacion: number;
  nombrePerfil: string;
  descripcionPerfil: string;
  cantOpciones: number;
}

export interface TreeNode {
  data: DataTreeNode;
  expanded: boolean;
  children: TreeNode[];
}

export interface DataTreeNode {
  idPerfilAplicacion: number;
  idPerfil: number;
  idAplicacion: number;
  nomOpcion: string;
  codOpcion: string;
  siglasOpcion: string;
  esEstado: boolean;
  icon: string;
  key: string;
}

export interface DataTreeNodeRequestDTO {
  idPerfilAplicacion: number;
  idPerfil: number;
  idAplicacion: number;
  idOpcion: number;
  estado: string;
  direccionIp: string;
  coUsuario: string;
  noUsuario: string;
}
