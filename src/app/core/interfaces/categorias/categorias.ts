export interface IDropdownsData {
  categorias_padre?: Array<any>;
}
export interface CategoriasRequest {
  nombreCategoria?: string;
  codigoCategoria?: string;
  nombreCategoriaPlural?: string;
  idCategoriaPadre?: number | null;
  palabrasClave?: string;
  pagina: number;
  registrosPorPagina: number;
}

export interface CategoriasResponse {
  registros: Categorias[];
  totalPaginas: number;
  totalElementos: number;
}

export interface Categorias {
  logo: any;
  nombreLogo: string;
  tamanhoLogo: number;
  extension: string;
  idCategoria: number;
  codigo: string;
  nombre: string;
  nombrePlural: string;
  padre: number;
  nombreDeCategoriaPadre: string;
  palabrasClave: string;
}

export interface CategoriasCreate {
  nombreCategoria: string;
  nombreCategoriaPlural: string;
  idCategoriaPadre: number;
  palabrasClave: string;
  usuarioCreacion: string;
}

export interface IAgregarLogoCategoriaRequest {
  idCategoria: number;
  nombreLogo: string;
  tamanoLogo: number;
  extensionLogo: string;
  imagenLogo: any;
  codigoUserName: string;
}

export interface IAgregarLogoCategoria extends IMessage {}

interface IMessage {
  timestamp: string;
  code: string;
  message: string;
}

export interface IEliminarLogoCategoriaRequest {
  idCategoria: number;
  codigoUserName: string;
}

export interface IEliminarLogoCategoria extends IMessage {}

export interface IDatosLogo {
  nombre: string;
  extension: any;
  tamano: number;
  base64: any;
}
