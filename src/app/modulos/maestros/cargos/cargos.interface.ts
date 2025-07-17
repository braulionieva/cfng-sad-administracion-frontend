export interface ICargo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  jerarquia: string;
  categoria: string;
  creacion: IDetalle;
  modificacion: IDetalle;
}

interface IDetalle {
  nombre: string;
  fecha: string;
}

export interface IDropdown {
  name: string;
  value: any;
}
