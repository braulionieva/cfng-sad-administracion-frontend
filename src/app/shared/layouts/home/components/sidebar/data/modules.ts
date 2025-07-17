import { Module } from '@interfaces/module';

export const MODULES: any[] = [
  {
    name: 'Administrar cuenta',
    url: 'seguridad-cuenta', //seguridad-cuenta
    count: 0,
    extended: false,
    children: [{ name: 'Seguridad', url: 'seguridad-cuenta', count: 0 }],
  },
  {
    name: 'Maestros',
    url: '',
    count: 0,
    extended: false,
    children: [
      {
        name: 'Sedes',
        url: 'administracion-menu/administracion-de-sede',
        count: 0,
      },
      { name: 'Fiscalías', url: 'administrar-dependencia', count: 0 },
      { name: 'Despachos', url: 'bandeja-despachos', count: 0 },
      { name: 'Cargos', url: 'cargos', count: 0 },
      { name: 'Categorías', url: 'aplicaciones-categorias', count: 0 },
      { name: 'Fiscalías padre', url: 'configurar-fiscalia-padre', count: 0 },
    ],
  },
  {
    name: 'Notificaciones',
    url: '',
    count: 0,
    extended: false,
    children: [
      {
        name: ' Centrales de Notificación ',
        url: 'centrales-notificacion',
        count: 0,
      },
      { name: 'Cobertura de Central', url: 'cobertura-central', count: 0 },
      {
        name: 'Estado de Notificación',
        url: 'centrales-notificacion/estado-de-notificacion',
        count: 0,
      },
      // { name: 'Notificador', url: 'administrar-notificador', count: 0 },
    ],
  },
  {
    name: 'Gestión Fiscal',
    url: '',
    count: 0,
    extended: false,
    children: [
      {
        name: 'Actos Procesales',
        url: 'administracion-casos/administracion-de-acto-procesal',
        count: 0,
      },
      {
        name: 'Calendario de días no laborables',
        url: 'calendario-no-laborables',
        count: 0,
      },
      {
        name: 'Contenido Obligatorio en Intermedia',
        url: 'etapa-intermedia',
        count: 0,
      },
      { name: 'Firma de Documentos', url: 'firma-documentos', count: 0 },
      {
        name: 'Plazos de etapa, acto y trámite',
        url: 'plazos-etapa-acto-tramite',
        count: 0,
      },
      {
        name: 'Plazos detención flagrancia',
        url: 'plazos-detencion',
        count: 0,
      },
      { name: 'Plazos Documentos Observados', url: 'plazo-doc-obs', count: 0 },
      {
        name: 'Plazos Bandeja Derivación',
        url: 'configuracion-plazos',
        count: 0,
      },
      {
        name: 'Reglas de Conducta en Ejecución Sentencia',
        url: 'bandeja-regla-conducta',
        count: 0,
      },
      {
        name: 'Trámite por acto procesal',
        url: 'administracion-casos/administracion-de-tramite-por-acto-procesal',
        count: 0,
      },
    ],
  },
  {
    name: 'Distribución y Turnos',
    url: '',
    count: 0,
    extended: false,
    children: [
      {
        name: 'Configurar distribución de denuncia',
        url: 'bandeja-configurar-grupo-aleatorio',
        count: 0,
      },
      { name: 'Turnos Fiscales', url: 'turnos-fiscales', count: 0 },
    ],
  },
  {
    name: 'Sistemas',
    url: '',
    count: 0,
    extended: false,
    children: [
      { name: 'Aplicaciones', url: 'bandeja-aplicacion', count: 0 },
      { name: 'Perfiles', url: 'listar-perfiles', count: 0 },
    ],
  },
  {
    name: 'Usuario',
    url: '',
    count: 0,
    extended: false,
    children: [
      { name: 'Gestionar Usuarios', url: 'usuario-general', count: 0 },
      {
        name: 'Listar mis aplicaciones',
        url: 'listar-mis-aplicaciones',
        count: 0,
      },
    ],
  },
  {
    name: 'Gestión ATF',
    url: '',
    count: 0,
    extended: false,
    children: [{ name: 'Dependencias ATF', url: 'dependencias-atf', count: 0 }],
  },
];
