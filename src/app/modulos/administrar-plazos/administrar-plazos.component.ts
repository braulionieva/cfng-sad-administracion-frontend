import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {
  IEditarPlazoRequest,
  IEliminarPlazoRequest,
  IListPlazosRequest,
  IDropdownsData,
} from '@interfaces/administrar-plazos/administrar-plazos';
import { AdministrarPlazosService } from '@services/administrar-plazos/administrar-plazos.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { ModalCrearEditarPlazoComponent } from './modales/modal-crear-editar-plazo/modal-crear-editar-plazo.component';
import { Auth2Service } from '@services/auth/auth2.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-administrar-plazos',
  standalone: true,
  imports: [CommonModule, FiltrosComponent, TablaComponent],
  templateUrl: './administrar-plazos.component.html',
  styleUrls: ['./administrar-plazos.component.scss'],
  providers: [DynamicDialogConfig, DialogService, MessageService],
})
export class AdministrarPlazosComponent implements OnInit {
  
  first = 0;
  @ViewChild(TablaComponent) tablaComponent!: TablaComponent;
  public refModalCrearEditar: DynamicDialogRef;
  public refModalConfirmarAccion: DynamicDialogRef;
  public refModalAccionCompletada: DynamicDialogRef;
  public plazos: any[];
  public dropdownsData: IDropdownsData;
  private filtrosSeleccionados: any;
  private readonly messageService: MessageService;
  public existePlazo;
  public registrosTotales: number = 0;

  totalRegistros: number = 40;

  public plazoInputLength = 0;

  infoUsuario = this.userService.getUserInfo();

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly administrarPlazosService: AdministrarPlazosService,
    private readonly dialogService: DialogService,
    private readonly userService: Auth2Service
  ) { }

  ngOnInit(): void {
    this.obtenerDropdownsData();
  }

  public obtenerListaPlazos(filtros?: any): void {
    const datosSolicitud: IListPlazosRequest = {
      ...filtros,
      pagina: filtros?.pagina || 1,
      registrosPorPagina: filtros?.registrosPorPagina || 10,
    };
    this.spinner.show();
    this.administrarPlazosService.obtenerListaPlazos(datosSolicitud)
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (res: any) => {
          if (!res)
            return;

          this.plazos = res.registros;

          if (!res.totalElementos)
            return;

          this.totalRegistros = res.totalElementos;
        },
        error: (err: string) => {
          console.error('Error en la solicitud [obtenerListaPlazos]: ', err);
        },
      });
  }

  private descargaExcel(filtros?: any): void {
    const datosSolicitud: IListPlazosRequest = {
      ...filtros,
    };
    this.spinner.show();
    this.administrarPlazosService.obtenerListaPlazosExcel(datosSolicitud)
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (res: any) => {
          saveAs(res, 'Plazos.xlsx');
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error descargando el archivo Excel',
          });
        },
      });
  }

  public crearPlazo({ accion, data, descripcionModal }) {
    const getValue = (value) => value || null;
    const getNumberValue = (value) => (value ? Number(value) : null);

    const datosSolicitud = {
      idTipoPlazo: getValue(data.plazoAplica),
      idNivelPlazo: getValue(data.nivelDelPlazo),
      flagDiasCalendarios: getValue(data.diasCalendario),
      idTipoConfiguracion: getValue(data.plazoConfigurado),
      flagRestriccion: getValue(data.restrictivo),
      numeroPlazo: getValue(data.plazo),
      idTipoUnidadPlazo: getValue(data.tipoUnidadPlazo),
      idPreEtapa: getNumberValue(data.preEtapa),
      idEtapa: getValue(data.etapa),
      idDistritoFiscal: getNumberValue(data.distritoFiscal),
      idTipoEspecialidad: getNumberValue(data.tipoEspecialidad),
      idEspecialidad: getValue(data.especialidad),
      flagPlazoAlerta: getValue(data.tienePlazoAlerta),
      numeroPlazoAlerta: getValue(data.plazoAlerta),
      idTipoUnidadPlazoAlerta: getValue(data.tipoUnidadPlazoAlerta),
      idTipoComplejidad: getValue(data.complejidad),
      idTramite: getValue(data.idTramite),
      listaIdActosTramitesEtapas: getValue(data.listaIdActosTramitesEtapas),
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
    };


    this.spinner.show();
    this.administrarPlazosService.crearNuevotramite(datosSolicitud)
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: () => {
          this.modalAccionCompletada({ accion, descripcionModal });
          this.refModalCrearEditar.close();
          this.tablaComponent.reiniciarTabla();
        },
        error: (err: string) => {
          console.error('Error en la solicitud [crearNuevotramite]: ', err);
        },
      });
  }

  public editarPlazo({ accion, data, descripcionModal }) {
    const getNumberValue = (value) => (value ? Number(value) : null);
    const getValue = (value) => value || null;

    const datosSolicitud: IEditarPlazoRequest = {
      idConfiguraPlazo: getValue(data.idConfiguraPlazo),
      idTipoPlazo: getValue(data.plazoAplica),
      idNivelPlazo: getValue(data.nivelDelPlazo),
      flagDiasCalendarios: getValue(data.diasCalendario),
      idTipoConfiguracion: getValue(data.plazoConfigurado),
      flagRestriccion: getValue(data.restrictivo),
      numeroPlazo: getValue(data.plazo),
      idTipoUnidadPlazo: getValue(data.tipoUnidadPlazo),
      idPreEtapa: getNumberValue(data.preEtapa),
      idEtapa: getValue(data.etapa),
      idDistritoFiscal: getNumberValue(data.distritoFiscal),
      idTipoEspecialidad: getNumberValue(data.tipoEspecialidad),
      idEspecialidad: getValue(data.especialidad),
      flagPlazoAlerta: getValue(data.tienePlazoAlerta),
      numeroPlazoAlerta: getValue(data.plazoAlerta),
      idTipoUnidadPlazoAlerta: getValue(data.tipoUnidadPlazoAlerta),
      idTipoComplejidad: getValue(data.complejidad),
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
    };

    /**public editarPlazo({ accion, data, descripcionModal }) {
    const datosSolicitud: IEditarPlazoRequest = {
      idConfiguraPlazo: data.idConfiguraPlazo ? data.idConfiguraPlazo : null,
      idTipoPlazo: data.plazoAplica ? data.plazoAplica : null,
      idNivelPlazo: data.nivelDelPlazo ? data.nivelDelPlazo : null,
      flagDiasCalendarios: data.diasCalendario ? data.diasCalendario : null,
      idTipoConfiguracion: data.plazoConfigurado ? data.plazoConfigurado : null,
      flagRestriccion: data.restrictivo ? data.restrictivo : null,
      numeroPlazo: data.plazo ? data.plazo : null,
      idTipoUnidadPlazo: data.tipoUnidadPlazo ? data.tipoUnidadPlazo : null,
      idPreEtapa: data.preEtapa ? Number(data.preEtapa) : null,
      idEtapa: data.etapa ? data.etapa : null,
      idDistritoFiscal: data.distritoFiscal
        ? Number(data.distritoFiscal)
        : null,
      idTipoEspecialidad: data.tipoEspecialidad
        ? Number(data.tipoEspecialidad)
        : null,
      idEspecialidad: data.especialidad ? data.especialidad : null,
      flagPlazoAlerta: data.tienePlazoAlerta ? data.tienePlazoAlerta : null,
      numeroPlazoAlerta: data.plazoAlerta ? data.plazoAlerta : null,
      idTipoUnidadPlazoAlerta: data.tipoUnidadPlazoAlerta
        ? data.tipoUnidadPlazoAlerta
        : null,
      idTipoComplejidad: data.complejidad ? data.complejidad : null,
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
    };**/

    this.spinner.show();
    this.administrarPlazosService.editarPlazo(datosSolicitud)
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: () => {
          this.modalAccionCompletada({ accion, descripcionModal });
          this.refModalCrearEditar.close();
          this.tablaComponent.reiniciarTabla();
        },
        error: (err: string) => {
          console.error('Error en la solicitud [editarPlazo]: ', err);
        },
      });
  }

  public eliminarPlazo({ accion, data, descripcionModal }) {
    const datosSolicitud: IEliminarPlazoRequest = {
      idConfiguraPlazo: data.idConfiguraPlazo ? data.idConfiguraPlazo : null,
      idTipoPlazo: data.idTipoPlazo ? data.idTipoPlazo : null,
      idNivelPlazo: data.idNivelPlazo ? data.idNivelPlazo : null,
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
    };

    this.spinner.show();
    this.administrarPlazosService.eliminarPlazo(datosSolicitud)
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (res: any) => {
          this.modalAccionCompletada({ accion, descripcionModal });
          this.refModalCrearEditar.close();
          this.tablaComponent.reiniciarTabla();
        },
        error: (err: string) => {
          console.error('Error en la solicitud [eliminarPlazo]: ', err);
        },
      });
  }

  public confirmarAccion({ accion, data, descripcionModal }): void {
    const accionTitulo = this.obtenerAccionTitulo(accion);
    const accionDescripcion = this.obtenerAccionDescripcion(accion);
    const tipoDePlazo = descripcionModal.tipoDePlazo;

    const description = this.obtenerDescripcion(
      accion,
      accionDescripcion,
      tipoDePlazo,
      descripcionModal
    );

    this.refModalConfirmarAccion = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'question',
          title: `${accionTitulo} PLAZO`,
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          description: description,
          confirm: true,
        },
      }
    );

    this.refModalConfirmarAccion.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          if (accion === 'crear') {
            this.crearPlazo({ accion, data, descripcionModal });
          }
          if (accion === 'editar') {
            this.editarPlazo({ accion, data, descripcionModal });
          }
          if (accion === 'eliminar') {
            this.eliminarPlazo({ accion, data, descripcionModal });
          }
        }
      },
    });
  }

  private obtenerAccionTitulo(accion: string): string {
    const acciones = {
      crear: 'REGISTRAR',
      editar: 'EDITAR',
      eliminar: 'ELIMINAR',
    };
    return acciones[accion] || '';
  }

  private obtenerAccionDescripcion(accion: string): string {
    const descripciones = {
      crear: 'registrar',
      editar: 'modificar',
      eliminar: 'eliminar',
    };
    return descripciones[accion] || '';
  }

  //refactorizado
  private obtenerDescripcion(
    accion: string,
    accionDescripcion: string,
    tipoDePlazo: string,
    descripcionModal: any
  ): string {
    const esEliminarConPeriodoDePlazo = this.verificarEliminarConPeriodoDePlazo(
      accion,
      descripcionModal
    );
    const esTipoNoTramite = this.verificarTipoNoTramite(tipoDePlazo);
    const esCrearTramite = this.verificarCrearTramite(accion, tipoDePlazo);
    const esEditarEliminarTramite = this.verificarEditarEliminarTramite(
      accion,
      tipoDePlazo
    );
    const esEliminarTramite = this.verificarEliminarTramite(
      accion,
      descripcionModal
    );

    let plazoTexto = accion === 'crear' ? 'nuevo' : '';
    let periodoTexto = esEliminarConPeriodoDePlazo
      ? `<strong>de ${descripcionModal?.periodoDePlazo}</strong>`
      : '';

    let tipoTexto = '';
    if (esTipoNoTramite) {
      tipoTexto = `para la <strong>${tipoDePlazo} ${descripcionModal?.nombrePreEtapa_Etapa}</strong>.`;
    } else if (esCrearTramite) {
      tipoTexto = `para el(los) <strong>trámites seleccionados</strong>.`;
    } else if (esEditarEliminarTramite) {
      tipoTexto = `para el <strong>trámite</strong> <strong>${descripcionModal?.nombreTramite}</strong>`;
      if (esEliminarTramite) {
        tipoTexto += ` <strong>con el código ${descripcionModal?.codigoTramite}</strong>`;
      }
      tipoTexto += '.';
    }

    return `A continuación, se procederá a <strong>${accionDescripcion}</strong> el ${plazoTexto} <strong>plazo</strong> ${periodoTexto} ${tipoTexto} ¿Está seguro de realizar esta acción?`;
  }

  /**private obtenerDescripcion(
    accion: string,
    accionDescripcion: string,
    tipoDePlazo: string,
    descripcionModal: any
  ): string {
    const esEliminarConPeriodoDePlazo = this.verificarEliminarConPeriodoDePlazo(accion, descripcionModal);
    const esTipoNoTramite = this.verificarTipoNoTramite(tipoDePlazo);
    const esCrearTramite = this.verificarCrearTramite(accion, tipoDePlazo);
    const esEditarEliminarTramite = this.verificarEditarEliminarTramite(accion, tipoDePlazo);
    const esEliminarTramite = this.verificarEliminarTramite(accion, descripcionModal);

    return `A continuación, se procederá a <strong>${accionDescripcion}</strong> el ${
      accion === 'crear' ? 'nuevo' : ''
    } <strong>plazo</strong> ${
      esEliminarConPeriodoDePlazo ? `<strong>de ${descripcionModal?.periodoDePlazo}</strong>` : ''
    } ${
      esTipoNoTramite
        ? `para la <strong>${tipoDePlazo} ${descripcionModal?.nombrePreEtapa_Etapa}</strong>.`
        : esCrearTramite
          ? `para el(los) <strong>trámites seleccionados</strong>.`
          : esEditarEliminarTramite
            ? `para el <strong>trámite</strong> <strong>${descripcionModal?.nombreTramite}</strong> ${
                esEliminarTramite ? `<strong>con el código ${descripcionModal?.codigoTramite}</strong>` : ''
              }.`
            : ''
    } ¿Está seguro de realizar esta acción?`;
  }**/

  private verificarEliminarConPeriodoDePlazo(
    accion: string,
    descripcionModal: any
  ): boolean {
    return accion === 'eliminar' && descripcionModal?.periodoDePlazo;
  }

  private verificarTipoNoTramite(tipoDePlazo: string): boolean {
    return tipoDePlazo !== 'tramite';
  }

  private verificarCrearTramite(accion: string, tipoDePlazo: string): boolean {
    return tipoDePlazo === 'tramite' && accion === 'crear';
  }

  private verificarEditarEliminarTramite(
    accion: string,
    tipoDePlazo: string
  ): boolean {
    return (
      tipoDePlazo === 'tramite' &&
      (accion === 'editar' || accion === 'eliminar')
    );
  }

  private verificarEliminarTramite(
    accion: string,
    descripcionModal: any
  ): boolean {
    return accion === 'eliminar' && descripcionModal?.codigoTramite;
  }
  //

  /**private obtenerDescripcion(
    accion: string,
    accionDescripcion: string,
    tipoDePlazo: string,
    descripcionModal: any
  ): string {

    const esEliminarConPeriodoDePlazo = accion === 'eliminar' && descripcionModal?.periodoDePlazo;
    const esTipoNoTramite = tipoDePlazo !== 'tramite';
    const esCrearTramite = tipoDePlazo === 'tramite' && accion === 'crear';
    const esEditarEliminarTramite = tipoDePlazo === 'tramite' && (accion === 'editar' || accion === 'eliminar');
    const esEliminarTramite = accion === 'eliminar' && descripcionModal?.codigoTramite;

    return `A continuación, se procederá a <strong>${accionDescripcion}</strong> el ${
      accion === 'crear' ? 'nuevo' : ''
    } <strong>plazo</strong> ${
      esEliminarConPeriodoDePlazo ? `<strong>de ${descripcionModal?.periodoDePlazo}</strong>` : ''
    } ${
      esTipoNoTramite
        ? `para la <strong>${tipoDePlazo} ${descripcionModal?.nombrePreEtapa_Etapa}</strong>.`
        : esCrearTramite
          ? `para el(los) <strong>trámites seleccionados</strong>.`
          : esEditarEliminarTramite
            ? `para el <strong>trámite</strong> <strong>${descripcionModal?.nombreTramite}</strong> ${
                esEliminarTramite ? `<strong>con el código ${descripcionModal?.codigoTramite}</strong>` : ''
              }.`
            : ''
    } ¿Está seguro de realizar esta acción?`;
  }**/

  /**private obtenerDescripcion(
    accion: string,
    accionDescripcion: string,
    tipoDePlazo: string,
    descripcionModal: any
  ): string {
    return `A continuación, se procederá a <strong>${accionDescripcion}</strong> el ${
      accion === 'crear' ? 'nuevo' : ''
    } <strong>plazo</strong> ${
      accion === 'eliminar' && descripcionModal?.periodoDePlazo
        ? `<strong>de ${descripcionModal?.periodoDePlazo}</strong>`
        : ''
    } ${
      tipoDePlazo !== 'tramite'
        ? `para la <strong>${tipoDePlazo} ${descripcionModal?.nombrePreEtapa_Etapa}</strong>.`
        : tipoDePlazo === 'tramite' && accion === 'crear'
          ? `para el(los) <strong>trámites seleccionados</strong>.`
          : tipoDePlazo === 'tramite' &&
          (accion === 'editar' || accion === 'eliminar')
            ? `para el <strong>trámite</strong> <strong>${
              descripcionModal?.nombreTramite
            }</strong> ${
              accion === 'eliminar'
                ? `<strong>con el código ${descripcionModal?.codigoTramite}</strong>`
                : ''
            }.`
            : ''
    } ¿Está seguro de realizar esta acción?`;
  }**/

  private modalAccionCompletada({ accion, descripcionModal }): void {
    const modalTitulo = this.obtenerModalTitulo(accion);
    const tipoDePlazo = descripcionModal.tipoDePlazo;

    const description = this.obtenerDescripcionModal(
      accion,
      tipoDePlazo,
      descripcionModal
    );

    this.refModalAccionCompletada = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'success',
          title: modalTitulo,
          confirmButtonText: 'Listo',
          description: description,
        },
      }
    );
  }

  private obtenerModalTitulo(accion: string): string {
    const titulos = {
      crear: 'REGISTRO REALIZADO CORRECTAMENTE',
      editar: 'MODIFICACIÓN REALIZADA CORRECTAMENTE',
      eliminar: 'PLAZO ELIMINADO',
    };
    return titulos[accion] || '';
  }

  private obtenerDescripcionModal(
    accion: string,
    tipoDePlazo: string,
    descripcionModal: any
  ): string {
    if (accion === 'crear' || accion === 'editar') {
      const registroExitoso = 'Se registró el plazo para ';
      let detallePlazo = '';

      if (tipoDePlazo !== 'tramite') {
        detallePlazo = `la ${tipoDePlazo}`;
      } else if (tipoDePlazo === 'tramite' && accion === 'crear') {
        detallePlazo = 'el(los) trámites seleccionados';
      } else if (tipoDePlazo === 'tramite' && accion === 'editar') {
        detallePlazo = 'el trámite';
      }

      return `${registroExitoso}${detallePlazo}, de forma exitosa.`;
    } else if (accion === 'eliminar') {
      const plazo = descripcionModal?.periodoDePlazo;
      let detallePlazo = '';

      if (tipoDePlazo !== 'tramite') {
        detallePlazo = `la ${tipoDePlazo}`;
      } else if (tipoDePlazo === 'tramite') {
        const nombreTramite = descripcionModal?.nombreTramite || '';
        const codigoTramite = descripcionModal?.codigoTramite || '';
        detallePlazo = `el trámite ${nombreTramite} con el código ${codigoTramite}`;
      }

      return `El plazo de ${plazo} para ${detallePlazo} ha sido eliminado correctamente.`;
    } else {
      return '';
    }
  }

  public aplicarFiltros(selectedValues?: any): void {
    this.filtrosSeleccionados = selectedValues;
    this.first = 0;
    this.obtenerListaPlazos(selectedValues);
  }

  public exportacionPlazos(filtros?: any): void {
    this.filtrosSeleccionados = filtros;
    this.descargaExcel(this.filtrosSeleccionados);
  }

  public abrirModalAccionPlazo(plazo?: any): void {
    this.refModalCrearEditar = this.dialogService.open(
      ModalCrearEditarPlazoComponent,
      {
        header: plazo ? 'Editar Plazo' : 'Nuevo Plazo',
        width: '80vw',
        closable: false,
        contentStyle: { overflow: 'auto' },
        style: { minWidth: '768px' },
        data: {
          dropdownsData: { ...this.dropdownsData },
          plazoDetail: plazo || null,
          confirmarAccion: this.confirmarAccion.bind(this),
          crearPlazo: this.crearPlazo.bind(this),
          editarPlazo: this.editarPlazo.bind(this),
        },
      }
    );
  }

  private obtenerDropdownsData(): void {
    this.obtenerTiposDropdown();
    this.obtenerDistritosFiscalesDropdown();
    this.obtenerTiposEspecialidadDropdown();
    this.obtenerEtapasDropdown('0');
    this.obtenerEtapasDropdown('1');
    this.obtenerEtapasDropdown('2');
    this.obtenerUnidadesMedidaDropdown();
    this.obtenerComplejidadesDropdown();
  }

  private obtenerTiposDropdown(): void {
    this.administrarPlazosService.listaTipos().subscribe({
      next: (res: any) => {
        if (!res.data) return;
        res.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  
        this.dropdownsData = {
          ...this.dropdownsData,
          tipos: res.data,
        };
      },
      error: (err: string) => {
        console.error('Error en la solicitud [listaTipos]: ', err);
      },
    });
  }

  private obtenerDistritosFiscalesDropdown(): void {
    this.administrarPlazosService.listaDistritosFiscales().subscribe({
      next: (res: any) => {
        if (!res.data) return;
        res.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  
        this.dropdownsData = {
          ...this.dropdownsData,
          distritos_fiscales: res.data,
        };
      },
      error: (err: string) => {
        console.error('Error en la solicitud [listaDistritosFiscales]: ', err);
      },
    });
  }

  private obtenerTiposEspecialidadDropdown(): void {
    this.administrarPlazosService.listaTiposEspecialidad().subscribe({
      next: (res: any) => {
        if (!res.data) return;
        res.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
        this.dropdownsData = {
          ...this.dropdownsData,
          tipos_especialidad: res.data,
        };
      },
      error: (err: string) => {
        console.error('Error en la solicitud [listaTiposEspecialidad]: ', err);
      },
    });
  }

  private obtenerEtapasDropdown(codigoPlazo: string): void {
    const datosSolicitud = {
      plazoPreEtapaEtapa: codigoPlazo,
    };
  
    this.administrarPlazosService.listaEtapas(datosSolicitud).subscribe({
      next: (res: any) => {
        if (!res) return;
  
        // Verificar si res es un array
        if (Array.isArray(res)) {
          // Ordenar usando la propiedad "Descripcion"
          res.sort((a, b) =>
            a.Descripcion.localeCompare(b.Descripcion, 'es', { sensitivity: 'base' })
          );
        }
  
        switch (codigoPlazo) {
          case '0':
            this.dropdownsData = {
              ...this.dropdownsData,
              preEtapas_etapas: res,
            };
            break;
          case '1':
            this.dropdownsData = {
              ...this.dropdownsData,
              preEtapas: res,
            };
            break;
          case '2':
            this.dropdownsData = {
              ...this.dropdownsData,
              etapas: res,
            };
            break;
        }
      },
      error: (err: string) => {
        console.error('Error en la solicitud [listaEtapas]: ', err);
      },
    });
  }

  private obtenerUnidadesMedidaDropdown(): void {
    this.administrarPlazosService.listaUnidadesMedida().subscribe({
      next: (res: any) => {
        if (!res.data) return;
        res.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );
        this.dropdownsData = {
          ...this.dropdownsData,
          unidades_medida: res.data,
        };
      },
      error: (err: any) => {
        console.error('Error en la solicitud [listaUnidadesMedida]: ', err);
      },
    });
  }

  private obtenerComplejidadesDropdown(): void {
    this.administrarPlazosService.listaComplejidad().subscribe({
      next: (res: any) => {
        if (!res.data) return;
        this.dropdownsData = {
          ...this.dropdownsData,
          complejidades: res.data,
        };
      },
    });
  }
}
