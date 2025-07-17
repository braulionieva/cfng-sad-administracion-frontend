export interface Module {
  idOrder?: number;
  name: string;
  url: string;
  count: number;
  extended: boolean;
  options: Option[];
}

export interface Option {
  idOrder?: number;
  name: string;
  url: string;
  count: number;
}
