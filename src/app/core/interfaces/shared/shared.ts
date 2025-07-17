export interface Filtros {
    //bandeja grupo aleatorio
    nombreGrupoAleatorio?: string | null;
    idTipoDistribucionAleatoria?: string | null;
    idDistritoFiscal?: string | null;
    nombreSede?: string | null;
    idEspecialidad?: string | null;
    consideraTurnoFiscal?: string | null;
    diferenciaMaxima?: string | null;

    //Filtros adicionales para Acto procesal
    codigoActoProcesal?: string | null;

    //bandeja servidores
    nombreServidor?: string | null;
    idTipoServidor?: string | null;
    idDisponibilidad?: string | null;
    idAmbiente?: string | null;
    estadoServidor?: string | null;
    esCentral?: string | null;
    contieneListaApps?: string | null;
    contieneAdministracionDeCuenta?: string | null;

    filtroGn?: string | null;
    filtroGc?: string | null;
    filtroCn?: string | null;
    filtroApp?: string | null;
    dCreacionInicio?: string | null;
    dCreacionFin?: string | null;
    dModificacionInicio?: string | null;
    dModificacionFin?: string | null;

  }

  export interface FiltrosCalendar {
    nombre?: string | null;
    descripcion?: string | null;
    idDistritoFiscal?: string | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    tipoDia?: string | null;
    tipoAmbito?: string | null;
    //feriado?: string | null;
    //noLaborable?: string | null;
    //nacional?: string | null;
    //regional?: string | null;
    pagina?:number|null;
    porPagina?:number|null;
  }

export interface FiltrosUsuario{
    nombreCompleto?: string | null;
    tipoDocumento?: string | null;
    numeroDocumento?: string | null;
    distritoFiscal?: string | null;
    sede?: string | null;
    tipoDependencia?: string | null;
    codigoDependencia?: string | null;
    codigoDespacho?: string | null;
    relacionLaboral?: string | null;
    estadoActivo?: string | null;
    estadoBloqueado?: string | null;
    pagina?:number|null;
    porPagina?:number|null;
    usuario?: string | null;
    coVCargo?:string | null;
  }

export interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
  }
