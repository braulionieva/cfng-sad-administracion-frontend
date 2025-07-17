import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FiltrosComponent } from './filtros/filtros.component';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ICargo } from './cargos.interface';
import { TablaComponent } from './tabla/tabla.component';
import { ModalCrearEditarCargoComponent } from './modals/modal-crear-editar-cargo/modal-crear-editar-cargo.component';
import { Subscription } from 'rxjs';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';
import { CargosService } from '@services/cargos/cargos.service';
import {
  ICrearCargo,
  ICrearCargoRequest,
  IEditarCargoRequest,
  IEliminarCargoRequest,
  IListCargosRequest,
  IListCargosRequestExcel,
} from '@interfaces/cargos/cargos';
import { CargosAccionesService } from './cargos-acciones.service';
import { Auth2Service } from '@services/auth/auth2.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  standalone: true,
  selector: 'app-cargos',
  templateUrl: './cargos.component.html',
  styleUrls: ['./cargos.component.scss'],
  imports: [CommonModule, FiltrosComponent, TablaComponent, ToastModule],
  providers: [DynamicDialogConfig, DialogService, MessageService],
})
export class CargosComponent implements OnInit, OnDestroy {
  first = 0;
  public refModal: DynamicDialogRef;
  refModalCrearEditar: DynamicDialogRef;
  refModalMensaje: DynamicDialogRef;
  cargos: ICargo[] = [];
  numberCharges: number = 40;

  filtrosSeleccionados: any;

  public infoUsuario;
  public existeCargo;
  public action;

  // dropdowns
  hierarchiesDropdown = [];
  categoriesDropdown = [];
  sedesDisponiblesParaExportar: boolean = false;

  private readonly subscriptions: Subscription[] = [];

  private modalSuccessSubscription: Subscription;

  constructor(
    private readonly cargosService: CargosService,
    private readonly cargosAccionesService: CargosAccionesService,
    private readonly dialogService: DialogService,
    private readonly userService: Auth2Service,
    private readonly messageService: MessageService,
    private readonly spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.obtenerListaCargos({ pagina: 1, registrosPorPagina: 10 });
    this.getDropdownsData();

    this.infoUsuario = this.userService.getUserInfo();

    this.subscriptions.push(
      this.cargosAccionesService.isCompleteActionCharger.subscribe((data) => {
        this.crearCargo(data);
      })
    );

    this.subscriptions.push(
      this.cargosAccionesService.actualizarPlazo.subscribe(
        ({ data, codigo }) => {
          this.editarCargo(data, codigo);
        }
      )
    );

    this.subscriptions.push(
      this.cargosAccionesService.showConfirmModal.subscribe(
        ({ setAction, setNombre, setCargo }) =>
          this.openModalConfirmAction({ setAction, setNombre, setCargo })
      )
    );

    this.modalSuccessSubscription =
      this.cargosAccionesService.successModal$.subscribe(
        (action: 'create' | 'save' | 'delete') => {
          this.action = action;
        }
      );

    this.subscriptions.push(this.modalSuccessSubscription);
  }

  public obtenerListaCargos(event: any) {
    const datosSolicitud: IListCargosRequest = {
      nombreCargo: this.filtrosSeleccionados?.nombre
        ? this.filtrosSeleccionados.nombre.toUpperCase()
        : '',
      idJerarquia: this.filtrosSeleccionados?.jerarquia
        ? this.filtrosSeleccionados.jerarquia
        : '',
      idCategoriaCargo: this.filtrosSeleccionados?.categoria
        ? this.filtrosSeleccionados.categoria
        : '',
      pagina: event.pagina,
      registrosPorPagina: event.registrosPorPagina,
    };

    this.cargosService.obtenerListaCargos(datosSolicitud).subscribe({
      next: (res: any) => {
        if (!res) return;

        this.cargos = res.registros;
        this.numberCharges = res.totalElementos;
        this.sedesDisponiblesParaExportar = this.cargos.length > 0;
      },
      error: (err: string) => {
        console.error('Error en la solicitud [cargosService]: ', err);
        this.sedesDisponiblesParaExportar = false;
      },
    });
  }

  public descargarExcel() {
    const datosSolicitud: IListCargosRequestExcel = {
      nombreCargo: this.filtrosSeleccionados?.nombre
        ? this.filtrosSeleccionados?.nombre.toUpperCase()
        : '',
      idJerarquia: this.filtrosSeleccionados?.jerarquia
        ? this.filtrosSeleccionados?.jerarquia
        : '',
      idCategoriaCargo: this.filtrosSeleccionados?.categoria
        ? this.filtrosSeleccionados.categoria
        : '',
    };

    this.spinner.show();

    this.subscriptions.push(
      this.cargosService.obtenerListaCargosExcel(datosSolicitud).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          saveAs(res, 'Cargos.xlsx');
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Error en la solicitud [descargarExcel]: ', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error descargando el archivo Excel',
          });
        },
      })
    );
  }

  public crearCargo(data) {
    const datosSolicitud: ICrearCargoRequest = {
      nombreCargo: data.nombre,
      abreviaturaNombreCargo: data.descripcion,
      codigoCargo: data.codigo,
      idJerarquia: data.jerarquia ? data.jerarquia : null,
      idCategoriaCargo: data.categoria ? data.categoria : null,
      codigoUserName: this.infoUsuario?.usuario.usuario,
      ip: '',
    };

    this.subscriptions.push(
      this.cargosService.crearCargo(datosSolicitud).subscribe({
        next: (resp: ICrearCargo) => {
          if (resp.existe === '1') {
            this.existeCargo = true;
            this.openModalCargoExistente();
          } else {
            this.existeCargo = false;
            this.obtenerListaCargos({ pagina: 1, registrosPorPagina: 10 });
            this.openModalSuccess(this.action, data.nombre);
            this.closeModalFromCargos();
          }
        },
        error: (err: string) => {
          console.error('Error en la solicitud [crearCargo]: ', err);
        },
      })
    );
  }

  public editarCargo(data, codigo) {
    const datosSolicitud: IEditarCargoRequest = {
      idCargo: codigo,
      nombreCargo: data.nombre,
      abreviaturaNombreCargo: data.descripcion,
      codigoCargo: data.codigo,
      idJerarquia: data.jerarquia ? data.jerarquia : null,
      idCategoriaCargo: data.categoria ? data.categoria : null,
      codigoUserName: this.infoUsuario?.usuario.usuario,
      ip: '',
    };

    this.subscriptions.push(
      this.cargosService.editarCargo(datosSolicitud).subscribe({
        next: (resp: ICrearCargo) => {
          if (resp.existe === '1') {
            this.existeCargo = true;
            this.openModalCargoExistente();
          } else {
            this.existeCargo = false;
            this.obtenerListaCargos({ pagina: 1, registrosPorPagina: 10 });
            this.openModalSuccess(this.action, data.nombre);
            this.closeModalFromCargos();
          }
        },
        error: (err: string) => {
          console.error('Error en la solicitud [editarCargo]: ', err);
        },
      })
    );
  }

  public eliminarCargo(data) {
    const datosSolicitud: IEliminarCargoRequest = {
      idCargo: data.idCargo,
      codigoUserName: this.infoUsuario?.usuario.usuario,
    };

    this.subscriptions.push(
      this.cargosService.eliminarCargo(datosSolicitud).subscribe({
        next: (resp: any) => {
          if (resp.code === '0') {
            this.obtenerListaCargos({ pagina: 1, registrosPorPagina: 10 });
          }
        },
      })
    );
  }

  aplicarFiltros(selectedValue?: any) {
    this.first = 0;
    this.filtrosSeleccionados = selectedValue;
    this.obtenerListaCargos({ pagina: 1, registrosPorPagina: 10 });
  }

  exportarExcel(filtros?: any) {
    this.filtrosSeleccionados = filtros;
    this.descargarExcel();
  }

  getDropdownsData() {
    this.getHierarchiesData();
    this.getCategoriesData();
  }

  getHierarchiesData() {
    this.subscriptions.push(
      this.cargosService.obtenerJerarquias().subscribe({
        next: (resp: any) => {
          if (!resp) return;
          this.hierarchiesDropdown = resp.data;
        },
      })
    );
  }

  getCategoriesData() {
    this.subscriptions.push(
      this.cargosService.obtenerCargosJerarquias().subscribe({
        next: (resp: any) => {
          if (!resp) return;
          this.categoriesDropdown = resp;
        },
      })
    );
  }

  cleanFilters(clean) {
    this.first = 0;
    this.filtrosSeleccionados = clean;
    this.obtenerListaCargos({ pagina: 1, registrosPorPagina: 10 });
  }

  actionCharger(cargo?: any) {
    this.refModalCrearEditar = this.dialogService.open(
      ModalCrearEditarCargoComponent,
      {
        header: cargo ? 'Editar Cargo' : 'Nuevo Cargo',
        width: '768px',
        closable: false,
        contentStyle: { overflow: 'auto' },
        data: {
          dropdownsData: {
            jerarquias: this.hierarchiesDropdown,
            categorias: this.categoriesDropdown,
          },
          cargoDetail: cargo || null,
          closeModal: this.closeModalFromCargos.bind(this), // Pasar la función para cerrar el modal
        },
      }
    );
  }

  closeModalFromCargos() {
    if (this.refModalCrearEditar) {
      this.refModalCrearEditar.close();
    }
  }

  deleteCargo(cargo) {
    this.openModalSuccess('delete', cargo.nombre);
    this.eliminarCargo(cargo);
  }

  openModalCargoExistente() {
    this.refModalMensaje = this.dialogService.open(ModalMensajeComponent, {
      width: '800px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning-red',
        title: 'CARGO YA EXISTE',
        subTitle:
          'El código del cargo ya se encuentra registrado, por favor validar los datos.',
        textButtonSecondary: 'Cerrar',
        showOnlySecondaryButton: false,
      },
    });
  }

  //refactorizado
  openModalConfirmAction(data) {
    if (!data) return;

    const action = this.getActionLabel(data.setAction);
    if (data.setAction === 'delete' && data.setCargo) {
      this.openDeleteModal(data.setNombre, action, data.setCargo);
    } else {
      this.cargosAccionesService.notifyAction(data.setAction);
    }
  }

  private getActionLabel(actionKey: string): string {
    const actions = {
      create: 'crear',
      save: 'guardar',
      delete: 'eliminar',
    };
    return actions[actionKey] || '';
  }

  private openDeleteModal(nombre: string, action: string, cargo: any) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Eliminar cargo',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        description: `A continuación, se procederá a eliminar el cargo <strong>${nombre}</strong>. ¿Está seguro de realizar esta acción?`,
        confirm: true,
      },
    });

    this.handleModalClose(cargo);
  }

  private handleModalClose(cargo: any) {
    this.subscriptions.push(
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.deleteCargo(cargo);
          }
        },
      })
    );
  }

  openModalSuccess(
    setAction: 'create' | 'save' | 'delete',
    nombreCargo: string
  ) {
    let title: string;
    let subTitle: string;

    switch (setAction) {
      case 'create':
        title = 'Cargo registrado';
        subTitle = `El registro de los datos del nuevo cargo <strong>${nombreCargo}</strong> se realizó de forma exitosa.`;
        break;
      case 'save':
        title = 'Cargo editado';
        subTitle = `La actualización de los datos del cargo <strong>${nombreCargo}</strong> se realizó de forma exitosa.`;
        break;
      case 'delete':
        title = 'Cargo eliminado';
        subTitle = `La eliminación del cargo <strong>${nombreCargo}</strong> se realizó de forma exitosa.`;
        break;
    }

    this.refModal = this.dialogService.open(ModalMensajeComponent, {
      width: '576px',
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

  ngOnDestroy(): void {
    if (this.modalSuccessSubscription) {
      this.modalSuccessSubscription.unsubscribe();
    }
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
