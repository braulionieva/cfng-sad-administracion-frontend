export interface AyudaDetalleObj {
  idCategoria: number;
  idCategoriaPadre: number;
  noCategoria: string;
  noCategoriaPadre: string;
  contenido: string;
  url: string;
  leido: number;
  valoracion: number;
  idTipoCategoria: number;
  tags: TagsObj[];
}

export interface CategoriasPadreObj {
  idCatergoria: number;
  noCategoria: string;
}

export interface TagsObj {
  idTag: number;
  noTag: string;
}

export interface BusquedaObj {
  busqueda: string;
}

export interface CategoriaListadoObj {
  idCategoria: string;
  noCategoria: string;
  idCategoriaPadre: string;
  noCategoriaPadre: string;
  tags: string;
  fechaCreacion: string;
  fechaUpdate: string;
}

export interface CategoriaListadoRowRes {
  registros: CategoriaListadoObj[];
  totalPaginas: number;
  totalElementos: number;
}
