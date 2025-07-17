export interface FiltroActosProcesales {

  // Campo: "Ingrese el código"
  idActoProcesalConfigura?: string;

  // Campo: "Seleccione el acto procesal"
  idActoProcesal?: string;

  // Campo: "Seleccione carpeta o tipo de cuaderno"
  idClasificadorExpediente?: number;

  // Campo: "Seleccione el tipo especialidad"
  idTipoEspecialidad?: number;

  // Campo: "Seleccione la Especialidad"
  idEspecialidad?: string;

  // Campo: "Seleccione la jerarquía"
  idJerarquia?: number;

  // Campo: "Seleccione el tipo proceso"
  idTipoProceso?: number;

  // Campo: "Seleccione el subtipo proceso"
  idSubtipoProceso?: string;

  // Campo: "Seleccione la etapa"
  idEtapa?: string;
}

export interface ActosProcesalesRequest {
  pages: number;
  perPage: number;
  filtros: FiltroActosProcesales;
}
