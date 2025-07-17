import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalCrearEditarCentralComponent } from './modals/modal-crear-editar-central/modal-crear-editar-central.component';
import { Subscription } from 'rxjs';
import { CentralesNotificacionesService } from '@modulos/notificaciones/centrales-notificacion/centrales-notificacion.service';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  ICrearCentralNotificacionRequest,
  IEditarCentralNotificacionRequest,
  IEliminarCentralNotificacionRequest,
  IListCentralNotificacionesRequest,
} from '@interfaces/central-notifcaciones/central-notificaciones';
import { CentralNotificacionesService } from '@services/central-notificaciones/central-notificaciones.service';
import { Auth2Service } from '@services/auth/auth2.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  standalone: true,
  selector: 'app-centrales-notificacion',
  templateUrl: './centrales-notificacion.component.html',
  styleUrls: ['./centrales-notificacion.component.scss'],
  imports: [CommonModule, FiltrosComponent, TablaComponent],
  providers: [DialogService],
})
export class CentralesNotificacionComponent implements OnInit {
  first = 0;
  @ViewChild(TablaComponent) tablaComponent!: TablaComponent;
  private refModal: DynamicDialogRef;
  private refModalCrearEditar: DynamicDialogRef;
  refModalMensaje: DynamicDialogRef;
  public errorModalRef: DynamicDialogRef;
  public centrales = [];

  public totalRegistros: number = 0;
  public filasTabla: number = 10;

  currentFilters: any = {
    nombreCentral: '',
    codigoCentral: '',
  };

  private taxDistrictsDropdown: any[] = [];

  private modalSuccessSubscription: Subscription;

  private readonly centralesNotificacionesService: CentralesNotificacionesService =
    inject(CentralesNotificacionesService);
  private readonly dialogService: DialogService = inject(DialogService);
  public subscriptions: Subscription[] = [];
  public existeSede;
  infoUsuario;

  private nombreCentralAccion: string;

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly centralNotificacionesService: CentralNotificacionesService,
    private readonly userService: Auth2Service
  ) { }

  public ngOnInit(): void {
    this.getDropdownsData();

    this.infoUsuario = this.userService.getUserInfo();

    this.subscriptions.push(
      this.centralesNotificacionesService.isCompleteCentrales.subscribe(
        (data) => {
          this.createNewCentral(data);
        }
      )
    );

    this.subscriptions.push(
      this.centralesNotificacionesService.actualizarCentrales.subscribe(
        ({ data, codigo }) => this.updateCentral(data, codigo)
      )
    );

    this.subscriptions.push(
      this.centralesNotificacionesService.showConfirmModal.subscribe(
        ({ setAction, setCentral }) =>
          this.openModalConfirmAction({
            setAction,
            setCentral,
          })
      )
    );

    /**this.subscriptions.push(
      (this.modalSuccessSubscription =
        this.centralesNotificacionesService.successModal$.subscribe(
          (action: 'create' | 'save' | 'delete') => {
            this.openModalSuccess(action, this.nombreCentralAccion);
          }
        ))
    );**/

    const subscription =
      this.centralesNotificacionesService.successModal$.subscribe(
        (action: 'create' | 'save' | 'delete') => {
          this.openModalSuccess(action, this.nombreCentralAccion);
        }
      );

    this.modalSuccessSubscription = subscription;
    this.subscriptions.push(subscription);
  }

  public getListCentrales(filters?: any): void {
    const datosSolicitud: IListCentralNotificacionesRequest = {
      nombreCentral: this.currentFilters.nombreCentral, //filters?.nombreCentral,
      codigoCentral: this.currentFilters.codigoCentral, //filters?.codigoCentral,
      pagina: filters?.pagina || 1,
      registrosPorPagina: filters?.registrosPorPagina || 10,
    };

    this.spinner.show();

    this.subscriptions.push(
      this.centralNotificacionesService
        .obtenerListaCentralesNotificaciones(datosSolicitud)
        .subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (!res) return;
            this.centrales = res.registros || [];
            this.totalRegistros = res.totalElementos || 0;
          },
          error: (err: string) => {
            this.spinner.hide();
            console.error(
              'Error en la solicitud [obtenerListaCentralesNotificaciones]: ',
              err
            );
          },
        })
    );
  }

  // Cuando se aplican filtros
  applyFilters(filters: any) {
    this.first = 0;
    this.currentFilters = filters;
    this.getListCentrales(this.currentFilters);
  }

  getDropdownsData() {
    this.getTaxDistrictsData();
  }

  getTaxDistrictsData() {
    this.subscriptions.push(
      this.centralNotificacionesService.getListaDistritosFiscales().subscribe({
        next: (res) => {
          if (!res.data) return;
          this.taxDistrictsDropdown = res.data
          .sort((a, b) =>
            (a.distritoFiscal || '').toLowerCase()
              .localeCompare((b.distritoFiscal || '').toLowerCase())
          );
        },
        error: (err: string) => {
          console.error('Error en la solicitud [getListaDistritosFiscales]: ', err);
        },
      })
    );
  }

  createNewCentral(data) {
    this.spinner.show();
    const datosSolicitud: ICrearCentralNotificacionRequest = {
      nombreCentral: data.nombre,
      idDistritoFiscal: data.distrito_fiscal,
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
      codigoCentral: data.codigo,
    };

    // Asignar nombreCentralAccion antes de hacer la solicitud
    this.nombreCentralAccion = data.nombre;

    this.subscriptions.push(
      this.centralNotificacionesService
        .crearNuevaCentral(datosSolicitud)
        .subscribe({
          next: (response) => {
            if (response.existe === '1') {
              this.existeSede = true;
              this.spinner.hide();
              this.openModalSedeExiste();
            } else {
              this.spinner.hide();
              this.tablaComponent.reiniciarTabla();
              this.centralesNotificacionesService.notifySuccessModal('create');
              if (this.refModalCrearEditar) {
                this.refModalCrearEditar.close();
              }
            }
          },
          error: (err) => {
            console.error('Error en la solicitud [crearNuevaCentral]: ', err);
            this.spinner.hide();

            let errorMessage =
              'Ocurrió un error al crear la central. Por favor, inténtelo nuevamente.';

            // Si el error tiene una estructura conocida
            if (err.error?.message) {
              errorMessage = err.error.message;
            }

            // Mostrar modal con el mensaje de error
            this.errorModalRef = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'error',
                title: 'Error',
                description: errorMessage,
                confirmButtonText: 'Listo',
              },
            });
          },
          complete: () => {
            this.nombreCentralAccion = '';
          },
        })
    );
  }

  updateCentral(data, codigo) {
    this.spinner.show();
    const datosSolicitud: IEditarCentralNotificacionRequest = {
      idCentralNotificacion: codigo,
      nombreCentral: data.nombre,
      idDistritoFiscal: data.distrito_fiscal,
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
      codigoCentral: data.codigo,
    };

    // Asignar nombreCentralAccion antes de hacer la solicitud
    this.nombreCentralAccion = data.nombre;

    this.subscriptions.push(
      this.centralNotificacionesService
        .editarCentral(datosSolicitud)
        .subscribe({
          next: (response) => {
            if (response.existe === '1') {
              this.existeSede = true;
              this.spinner.hide();
              this.openModalSedeExiste();
            } else {
              this.spinner.hide();
              this.tablaComponent.reiniciarTabla();
              this.centralesNotificacionesService.notifySuccessModal('save');
              if (this.refModalCrearEditar) {
                this.refModalCrearEditar.close();
              }
            }
          },
          error: (err) => {
            console.error('Error en la solicitud [editarCentral]: ', err);
            this.spinner.hide();

            let errorMessage =
              'Ocurrió un error al editar la central. Por favor, inténtelo nuevamente.';

            // Si el error tiene una estructura conocida
            if (err.error?.message) {
              errorMessage = err.error.message;
            }

            // Mostrar modal con el mensaje de error
            this.errorModalRef = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'error',
                title: 'Error',
                description: errorMessage,
                confirmButtonText: 'Listo',
              },
            });
          },
          complete: () => {
            this.nombreCentralAccion = '';
          },
        })
    );
  }

  deleteCentral(plazo) {
    this.spinner.show();
    const datosSolicitud: IEliminarCentralNotificacionRequest = {
      idCentralNotificacion: plazo.idCentral,
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
    };

    this.subscriptions.push(
      this.centralNotificacionesService
        .eliminarCentral(datosSolicitud)
        .subscribe({
          next: () => {
            this.nombreCentralAccion = plazo.nombreCentral;
            this.spinner.hide();
            this.tablaComponent.reiniciarTabla();
            this.openModalSuccess('delete', this.nombreCentralAccion);
          },
          error: (err) => {
            console.error('Error en la solicitud [eliminarCentral]: ', err);
            this.spinner.hide();

            let errorMessage =
              'Ocurrió un error al eliminar la central. Por favor, inténtelo nuevamente.';

            // Si el error tiene una estructura conocida
            if (err.error?.message) {
              errorMessage = err.error.message;
            }

            // Mostrar modal con el mensaje de error
            this.errorModalRef = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'error',
                title: 'Error',
                description: errorMessage,
                confirmButtonText: 'Listo',
              },
            });
          },
          complete: () => {
            this.nombreCentralAccion = '';
          },
        })
    );
  }

  cleanFilters() {
    this.first = 0;
    this.centrales = [];
    this.tablaComponent.reiniciarTabla();
  }

  actionCentral(central?: any) {
    this.refModalCrearEditar = this.dialogService.open(
      ModalCrearEditarCentralComponent,
      {
        header: central
          ? 'Editar Central de Notificaciones'
          : 'Nueva Central de Notificaciones',
        width: '850px',
        closable: false,
        contentStyle: { overflow: 'auto' },
        data: {
          dropdownsData: {
            distritos: this.taxDistrictsDropdown,
          },
          centralDetail: central || null,
        },
      }
    );
  }

  private openModalConfirmAction(data): void {
    if (!data) return;

    const setAction = data.setAction;
    this.nombreCentralAccion = data.setCentral?.nombre
      ? data.setCentral?.nombre
      : data.setCentral?.nombreCentral;
    const setCentral = data.setCentral;

    /**const actions: { create: string; save: string; delete: string } = {
      create: 'crear',
      save: 'guardar',
      delete: 'eliminar',
    };**/

    /**let action = actions[setAction] || '';**/

    if (setAction === 'delete' && setCentral) {
      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '828px',
        contentStyle: { overflow: 'auto' },
        closable: false,
        showHeader: false,
        data: {
          icon: 'question',
          title: 'Eliminar central de notificaciones',
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
          description: `A continuación, se procederá a eliminar la central de notificaciones <strong>${this.nombreCentralAccion}</strong>. ¿Está seguro de realizar esta acción? `,
          confirm: true,
        },
      });

      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.deleteCentral(setCentral);
          }
        },
      });
    } else {
      this.centralesNotificacionesService.notifyAction(setAction);
    }
  }

  //refactorizado
  private openModalSuccess(setAction: 'create' | 'save' | 'delete', nombreCentral: string): void {
    const tieneEspacios = /\s/.test(nombreCentral);
    let nombreTruncado = '';

    if (!tieneEspacios) {
      nombreTruncado = nombreCentral.length > 38 ? nombreCentral.substring(0, 38) + '...' : nombreCentral;
      nombreCentral = nombreTruncado;
    }

    let title: string;
    let subTitle: string;

    switch (setAction) {
      case 'create':
        title = 'Central de notificaciones registrada';
        subTitle = `El registro de los datos de la nueva central de notificaciones <strong>${nombreCentral}</strong> se realizó de forma exitosa.`;
        break;
      case 'save':
        title = 'Central de notificaciones editada';
        subTitle = `La actualización de los datos de la central de notificaciones <strong>${nombreCentral}</strong> se realizó de forma exitosa.`;
        break;
      case 'delete':
        title = 'Central de notificaciones eliminada';
        subTitle = `La eliminación de la central de notificaciones <strong>${nombreCentral}</strong> se realizó de forma exitosa.`;
        break;
    }

    this.refModal = this.dialogService.open(ModalMensajeComponent, {
      width: '596px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'success',
        title: title,
        subTitle: subTitle,
        textButton: 'Listo',
      },
    });
  }
  //

  /**private openModalSuccess(
    setAction: 'create' | 'save' | 'delete',
    nombreCentral: string
  ): void {
    const tieneEspacios = /\s/.test(nombreCentral);
    let nombreTruncado = '';

    if (!tieneEspacios) {
      nombreTruncado =
        nombreCentral.length > 38
          ? nombreCentral.substring(0, 38) + '...'
          : nombreCentral;

      nombreCentral = nombreTruncado;
    }

    this.refModal = this.dialogService.open(ModalMensajeComponent, {
      width: '596px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'success',
        title:
          setAction === 'create'
            ? 'Central de notificaciones registrada'
            : setAction === 'save'
            ? 'Central de notificaciones editada'
            : setAction === 'delete'
            ? 'Central de notificaciones eliminada'
            : '',
        subTitle:
          setAction === 'create'
            ? `El registro de los datos de la nueva central de notificaciones <strong>${nombreCentral}</strong> se realizó de forma exitosa.`
            : setAction === 'save'
            ? `La actualización de los datos de la central de notificaciones <strong>${nombreCentral}</strong> se realizó de forma exitosa.`
            : setAction === 'delete'
            ? `La eliminación de la central de notificaciones <strong>${nombreCentral}</strong> se realizó de forma exitosa.`
            : '',
        textButton: 'Listo',
      },
    });
  }**/

  openModalSedeExiste() {
    this.refModalMensaje = this.dialogService.open(ModalMensajeComponent, {
      width: '800px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning-red',
        title: 'CENTRAL YA EXISTE',
        subTitle:
          'La Central de Notificaciones ya se ecuentra registrada, por favor validar los datos.',
        textButtonSecondary: 'Cerrar',
        showOnlySecondaryButton: false,
      },
    });
  }

  closeModalFromCargos() {
    if (this.refModal) {
      this.refModal.close();
    }
  }

  ngOnDestroy(): void {
    if (this.modalSuccessSubscription)
      this.modalSuccessSubscription.unsubscribe();

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
