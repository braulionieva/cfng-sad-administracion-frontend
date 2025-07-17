export interface Categoria {
  nombre: string,
  id: number
}

export interface RequestCategoria {
  coUser: string,
}

export interface RequestSistema {
  coUser: string,
  idCategoria: number
}
