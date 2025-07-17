import { Routes } from '@angular/router';
import { HomeComponent } from '@layouts/home/home.component';

import { NotFoundComponent } from '@components/not-found/not-found.component';
import { BandejaServidoresComponent } from './maestros/servidores/bandeja-servidores/bandeja-servidores.component';
import { AgregarServidorComponent } from './maestros/servidores/agregar-servidor/agregar-servidor.component';
import { MenusComponent } from './sistemas/menus/menus.component';
import { ConfiguracionPlazosComponent } from './configuracion-plazos/configuracion-plazos.component';
import { CargosComponent } from '@modulos/maestros/cargos/cargos.component';
import { CentralesNotificacionComponent } from '@modulos/notificaciones/centrales-notificacion/centrales-notificacion.component';
import { PlazosDetencionComponent } from '@modulos/gestion-fiscal/plazos/plazos-detencion.component';
import { PlazoDocObsComponent } from '@modulos/plazo-doc-obs/plazo-doc-obs.component';
import { BandejaSedesComponent } from '@modulos/maestros/sedes/bandeja-sedes/bandeja-sedes.component';
import { BandejaTramitePorActoProcesalComponent } from './gestion-fiscal/tramite-por-acto-procesal/bandeja/bandeja-tramite-por-acto-procesal.component';
import { BandejaActoProcesalComponent } from './gestion-fiscal/acto-procesal/bandeja/bandeja-acto-procesal.component';
import { FirmaDocumentosComponent } from './gestion-fiscal/firma-documentos/firma-documentos.component';
import { TurnosFiscalesComponent } from './distribucion-y-turnos/turnos-fiscales/turnos-fiscales.component';
import { AdminUsuarioComponent } from '@modulos/usuario/usuario-general/admin-usuario/admin-usuario.component';
import { BandejaDespachosComponent } from '@modulos/maestros/despachos/bandeja-despachos/bandeja-despachos.component';
import { AdministrarNotificadorComponent } from '@modulos/notificaciones/notificador/administrar-notificador.component';
import { AdministrarDependenciaComponent } from '@modulos/maestros/fiscalias/administrar-dependencia.component';
import { AplicacionesCategoriasComponent } from '@modulos/maestros/categorias/aplicaciones-categorias.component';
import { AdminPerfilesComponent } from '@modulos/sistemas/perfiles/admin-perfiles.component';
import { BandejaEstadoDeNotificacionComponent } from './notificaciones/estado-de-notificacion/bandeja/bandeja-estado-de-notificacion.component';
import { CoberturaDeCentralComponent } from './notificaciones/cobertura-de-central/cobertura-de-central.component';
import { ConfigurarMasDeUnaFiscaliaComponent } from './configurar-mas-de-una-fiscalia/configurar-mas-de-una-fiscalia.component';
import { SeguridadCuentaComponent } from './seguridad-cuenta/seguridad-cuenta.component';
import { BandejaReglaComponent } from './gestion-fiscal/regla-conducta/bandeja-regla/bandeja-regla.component';
import { ContenidoEtapaIntermediaComponent } from './contenido-etapa-intermedia/contenido-etapa-intermedia.component';
import { ListarMisAplicacionesComponent } from './sistemas/listar-mis-aplicaciones/listar-mis-aplicaciones.component';
import { DependenciasAtfComponent } from '@modulos/dependencias-atf/dependencias-atf.component';
import { AdministrarPlazosComponent } from './administrar-plazos/administrar-plazos.component';
import { BandejaConfiguracionAleatoriaComponent } from './distribucion-y-turnos/distribucion-aleatoria/bandeja/bandeja-distribucion-aleatoria.component';
import { CalendarioNoLaborableComponent } from './gestion-fiscal/calendario-no-laborable/calendario-no-laborable.component';
import { AdminAplicacionComponent } from '@modulos/sistemas/admin-aplicacion/admin-aplicacion.component';
import {AyudaComponent} from "@modulos/ayuda/ayuda.component";

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      // { path: '', redirectTo: 'bandeja-despachos', pathMatch: 'full' },
      {
        path: 'not-found',
        component: NotFoundComponent,
      },
      {
        path: 'bandeja-grupo-aleatorio',
        //component: BandejaDistribucionAleatoriaComponent,
        component: BandejaConfiguracionAleatoriaComponent,
        //component: BandejaGruposAleatoriosComponent,
      },
      {
        path: 'bandeja-servidor',
        component: BandejaServidoresComponent,
      },
      {
        path: 'agregar-servidor',
        component: AgregarServidorComponent,
      },
      {
        path: 'aplicaciones-categorias',
        component: AplicacionesCategoriasComponent,
      },
      {
        path: 'plazos-detencion',
        component: PlazosDetencionComponent,
      },
      {
        path: 'centrales-notificacion',
        component: CentralesNotificacionComponent,
      },
      {
        path: 'administracion-menu/administracion-de-menu',
        component: MenusComponent,
      },
      {
        path: 'administracion-menu/administracion-de-sede',
        component: BandejaSedesComponent,
      },
      {
        path: 'turnos-fiscales',
        component: TurnosFiscalesComponent,
      },
      {
        path: 'firma-documentos',
        component: FirmaDocumentosComponent,
      },
      {
        path: 'calendario-no-laborables',
        component: CalendarioNoLaborableComponent,
      },
      {
        path: 'administracion-casos/administracion-de-acto-procesal',
        component: BandejaActoProcesalComponent,
      },
      {
        path: 'administracion-casos/administracion-de-tramite-por-acto-procesal',
        component: BandejaTramitePorActoProcesalComponent,
      },
      {
        path: 'cargos',
        component: CargosComponent,
      },
      {
        path: 'configuracion-plazos',
        component: ConfiguracionPlazosComponent,
      },
      {
        path: 'listar-perfiles',
        component: AdminPerfilesComponent,
      },
      {
        path: 'bandeja-despachos',
        component: BandejaDespachosComponent, //no levanta
      },
      /*{
        path: 'bandeja-aplicacion',
        component: BandejaAplicacionComponent,
      },*/
      {
        path: 'bandeja-aplicacion',
        component: AdminAplicacionComponent,
      },
      {
        path: 'administrar-notificador',
        component: AdministrarNotificadorComponent, // ?? no jala info
      },
      {
        path: 'administrar-dependencia',
        component: AdministrarDependenciaComponent,
      },
      {
        path: 'plazo-doc-obs',
        component: PlazoDocObsComponent,
      },
      {
        path: 'usuario-general',
        component: AdminUsuarioComponent,
      },
      {
        path: 'centrales-notificacion/estado-de-notificacion',
        component: BandejaEstadoDeNotificacionComponent,
      },
      {
        path: 'cobertura-central',
        component: CoberturaDeCentralComponent,
      },
      {
        path: 'configurar-fiscalia-padre',
        component: ConfigurarMasDeUnaFiscaliaComponent,
      },
      {
        path: 'seguridad-cuenta',
        component: SeguridadCuentaComponent,
      },
      {
        path: 'bandeja-regla-conducta',
        component: BandejaReglaComponent,
      },
      {
        path: 'etapa-intermedia',
        component: ContenidoEtapaIntermediaComponent,
      },
      {
        path: 'listar-mis-aplicaciones',
        component: ListarMisAplicacionesComponent,
      },
      {
        path: 'dependencias-atf',
        component: DependenciasAtfComponent,
      },
      {
        path: 'administrar-plazos',
        component: AdministrarPlazosComponent,
      },
      {
        path: 'bandeja-distribucion-aleatorio',
        component: TurnosFiscalesComponent,
      },
      {
        path: 'bandeja-configurar-grupo-aleatorio',
        component: BandejaConfiguracionAleatoriaComponent,
      },
      // {
      //   path: 'listar-fiscales',
      //   component: ListarFiscalesComponent,
      // },
      {
        path: 'plazos-etapa-acto-tramite',
        component: AdministrarPlazosComponent,
      },
      {
        path: 'ayuda',
        component: AyudaComponent,
      },
    ],
  },
];
