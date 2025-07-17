import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import { PlazosDetencionService } from './plazos-detencion.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ModalCrearEditarPlazoComponent } from './modals/modal-crear-editar-plazo/modal-crear-editar-plazo.component';
import { Subscription } from 'rxjs';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';
import { PlazoDetencionFlagranciaService } from '@services/plazo-detencion-flagrancia/plazo-detencion-flagrancia.service';
import {
  ICrearPlazoDetencionRequest,
  IEditarPlazoRequest,
  IEliminarPlazoRequest,
  IListPlazoDetencionFlagrancia,
  IListPlazoDetencionFlagranciaExcelRequest,
  IListPlazoDetencionFlagranciaRequest,
  IPaginacionListPlazoDetencionFlagrania,
} from '@interfaces/plazo-detencion-flagrancia/plazo-detencion-flagrancia';
import { Auth2Service } from '@services/auth/auth2.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { MessageService } from 'primeng/api';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  standalone: true,
  selector: 'app-plazos-detencion',
  templateUrl: './plazos-detencion.component.html',
  styleUrls: ['./plazos-detencion.component.scss'],
  imports: [CommonModule, FiltrosComponent, TablaComponent],
  providers: [DynamicDialogConfig, DialogService, MessageService],
})
export class PlazosDetencionComponent implements OnInit, OnDestroy {
  public refModal: DynamicDialogRef;
  plazos: IListPlazoDetencionFlagrancia[] = [];
  plazos2: IListPlazoDetencionFlagrancia[] = [];
  numberArrests: number = 12;

  first = 0;
  filtrosSeleccionados: any;

  // dropdowns
  categoriesDropdown: any[] = [];
  specialtiesDropdown: any[] = [];

  infoUsuario;

  private modalSuccessSubscription: Subscription;

  constructor(
    private plazosDetencionService: PlazosDetencionService,
    private dialogService: DialogService,
    private plazoDetencionFlagranciaService: PlazoDetencionFlagranciaService,
    private userService: Auth2Service,
    private spinner: NgxSpinnerService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.getListPlazos({ pagina: 1, registrosPorPagina: 10 });
    this.getDropdownsData();

    this.infoUsuario = this.userService.getUserInfo();

    this.plazosDetencionService.isCompleteActionPlazo.subscribe((data) =>
      this.createNewPlazo(data)
    );

    this.plazosDetencionService.actualizacionPlazos.subscribe(
      ({ data, codigo }) => {
        this.updatePlazo(data, codigo);
      }
    );

    this.plazosDetencionService.showConfirmModal.subscribe(
      
      ({ setAction, setEspecialidad, setPlazo }) =>
        
        this.openModalConfirmAction({
          
          setAction,
          setEspecialidad,
          setPlazo,
        } )
    );

    this.modalSuccessSubscription =
      this.plazosDetencionService.successModal$.subscribe(
        (action: 'create' | 'save' | 'delete') => {
          this.openModalSuccess(action);
        }
      );
  }

  getListPlazos(event: any) {
    this.spinner.show();
    const datosSolicitud: IListPlazoDetencionFlagranciaRequest = {
      tipoEspecialidad: this.filtrosSeleccionados?.tipoEspecialidad,
      idEspecialidad: this.filtrosSeleccionados?.idEspecialidad,
      pagina: event.pagina,
      registrosPorPagina: event.registrosPorPagina,
    };

    this.plazoDetencionFlagranciaService
      .obtenerListaPlazosDetencionFlagrancia(datosSolicitud)
      .subscribe({
        next: (resp: IPaginacionListPlazoDetencionFlagrania) => {
          this.plazos = resp.registros;
          this.numberArrests = resp.totalElementos;
          this.spinner.hide();
        },
        error: (err) => {
          console.error(
            'Error en la solicitud [obtenerListaPlazosDetencionFlagrancia]: ',
            err
          );
          this.spinner.hide();
        },
      });
  }

  descargarExcel($event) {
    this.spinner.show();

    const datosSolicitud: IListPlazoDetencionFlagranciaExcelRequest = {
      tipoEspecialidad: $event?.tipoEspecialidad,
      idEspecialidad: $event?.idEspecialidad,
    };

    this.plazoDetencionFlagranciaService
      .obtenerListaPlazosDetencionFlagranciaExcel(datosSolicitud)
      .subscribe({
        next: (resp: any) => {
          this.spinner.hide();
          saveAs(resp, 'PlazoDetencionFlagrancia.xlsx');
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
      });
  }

  getDropdownsData() {
    this.getCategoriesData();
  }

  getCategoriesData() {
    this.plazoDetencionFlagranciaService.obtenerListaCategorias().subscribe({
      next: (resp: any[]) => {
        resp.sort((a, b) =>
          a.nombreTipoEspecialidad.localeCompare(b.nombreTipoEspecialidad, 'es', {
            sensitivity: 'base',
          })
        );
  
        this.categoriesDropdown = resp;
      },
      error: (err) => {
        console.error('Error en la solicitud [obtenerListaCategorias]: ', err);
      },
    });
  }

  getSpecialtiesData(idTipoCategoria: number) {
    this.plazoDetencionFlagranciaService
      .obtenerListaEspecialidad(idTipoCategoria)
      .subscribe({
        next: (resp: any[]) => {
          resp.sort((a, b) =>
            a.nombreEspecialidad.localeCompare(
              b.nombreEspecialidad,
              'es',
              { sensitivity: 'base' }
            )
          );
          this.specialtiesDropdown = resp;
        },
        error: (err) => {
          console.error(
            'Error en la solicitud [obtenerListaEspecialidad]: ',
            err
          );
        },
      });
  }

  exportarExcel($event) {
    this.descargarExcel($event);
  }

  aplicarFiltros(selectedValue?: any) {
    this.first = 0;
    this.filtrosSeleccionados = selectedValue;
    this.getListPlazos({ pagina: 1, registrosPorPagina: 10 });
  }

  cleanFilters(clean) {
    // simulando peticion
    this.first = 0;
    this.plazos = [];
    this.filtrosSeleccionados = clean;
    this.getListPlazos({ pagina: 1, registrosPorPagina: 10 });
    this.specialtiesDropdown = []; // Limpia también las especialidades
  }

  actionPlazoDetencion(plazo?: any) {
    this.refModal = this.dialogService.open(ModalCrearEditarPlazoComponent, {
      header: plazo
        ? 'Editar Plazo de Detención por Flagrancia'
        : 'Agregar Plazo de Detención por Flagrancia',
      width: '768px',
      closable: false,
      contentStyle: { overflow: 'auto' },
      data: {
        dropdownsData: {
          categorias: this.categoriesDropdown,
        },
        plazoDetail: plazo ? plazo : null,
      },
    });
  }

  createNewPlazo(data) {
    this.spinner.show();
    const datosSolicitud: ICrearPlazoDetencionRequest = {
      tipoEspecialidad: data.categoria,
      idEspecialidad: data.especialidad,
      plazo: data.plazo_horas,
      comentario: data.descripcion,
      codigoUserName: this.infoUsuario?.usuario.usuario,
    };

    this.plazoDetencionFlagranciaService
      .crearNuevoPlazo(datosSolicitud)
      .subscribe({
        next: () => {
          this.getListPlazos({ pagina: 1, registrosPorPagina: 10 });
          this.spinner.hide();
        },
        error: (err) => {
          console.error('Error en la solicitud [crearNuevoPlazo]: ', err);
          this.spinner.hide();
        },
      });
  }

  updatePlazo(data, codigo) {
    this.spinner.show();
    const datosSolicitud: IEditarPlazoRequest = {
      idPlazoFlagrancia: codigo,
      tipoEspecialidad: data.categoria,
      idEspecialidad: data.especialidad,
      plazo: data.plazo_horas,
      comentario: data.descripcion,
      codigoUserName: this.infoUsuario?.usuario.usuario,
    };

    this.plazoDetencionFlagranciaService.editarPlazo(datosSolicitud).subscribe({
      next: () => {
        this.spinner.hide();
        this.getListPlazos({ pagina: 1, registrosPorPagina: 10 });
        this.plazosDetencionService.notifySuccessModal('save');
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error en la solicitud [editarPlazo]: ', err);
      },
    });
  }

  deletePlazo(plazo) {
    this.spinner.show();
    const datosSolicitud: IEliminarPlazoRequest = {
      idPlazoFlagrancia: plazo.idPlazoTurno,
      codigoUserName: this.infoUsuario?.usuario.usuario,
    };

    this.plazoDetencionFlagranciaService
      .eliminarPlazo(datosSolicitud)
      .subscribe({
        next: () => {
          this.spinner.hide();
          this.openModalSuccess('delete');
          this.getListPlazos({ pagina: 1, registrosPorPagina: 10 });
        },
        error: (err: string | any) => {
          this.spinner.hide();
          console.error('Error en la solicitud [eliminarPlazo]: ', err);
        },
      });
  }

  openModalConfirmAction(data) {
    if (!data) return;
  
    const { setAction, setEspecialidad, setPlazo } = data;
  
    const actions = {
      create: 'registrar',
      save: 'modificar',
      delete: 'eliminar',
    };
  
    const action = actions[setAction] || '';
    const title = this.getTitle(setAction, action);
    const subTitle = this.getSubTitle(setAction, action, setEspecialidad);
  
    // Abrimos el AlertModalComponent
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '678px',
      showHeader: false,
      data: {
        icon: 'question',
        title: title,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        description: subTitle,
        confirm: true,
      },
    });
  
    // Suscribirse cuando el modal se cierra
    this.refModal.onClose.subscribe((resp) => {
      // Si el modal se cerró con 'confirm'
      if (resp === 'confirm') {
        // ver qué acción hay que ejecutar
        this.handleConfirmAction(setAction, setPlazo);
      }
    });
  }

  private handleConfirmAction(setAction: string, plazo?: any) {
    switch (setAction) {
      case 'create':
      case 'save':
        this.plazosDetencionService.notifyAction(setAction);
        break;
  
      case 'delete':
        if (plazo) {
          this.deletePlazo(plazo);
        }
        break;
  
      default:
        // No hace nada
        break;
    }
  }

  getTitle(setAction, action) {
    return `${this.capitalizeFirstLetter(
      action
    )} plazo de detención por flagrancia`;
  }

  getSubTitle(setAction, action, setEspecialidad) {
    return `A continuación, se procederá a ${action} el plazo de detención por flagrancia de la especialidad ${setEspecialidad}. ¿Está seguro de realizar esta acción?`;
  }

  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getOnConfirm(setAction, setPlazo) {
    if (setAction === 'create' || setAction === 'save') {
      return () => this.plazosDetencionService.notifyAction(setAction);
    }
    if (setAction === 'delete' && setPlazo) {
      return () => this.deletePlazo(setPlazo);
    }
    return null;
  }

  //refactorizado
  openModalSuccess(setAction: 'create' | 'save' | 'delete') {
    let title: string;
    let subTitle: string;

    if (setAction === 'create' || setAction === 'save') {
      title = 'Plazo de Detención por Flagrancia Guardado';
      subTitle = 'Se guardó el plazo de detención por flagrancia correctamente';
    } else if (setAction === 'delete') {
      title = 'Plazo de Detención por Flagrancia Eliminado';
      subTitle =
        'Se eliminó el plazo de detención por flagrancia correctamente';
    } else {
      title = '';
      subTitle = '';
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

  /**openModalSuccess(setAction: 'create' | 'save' | 'delete') {
    this.refModal = this.dialogService.open(ModalMensajeComponent, {
      width: '576px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'success',
        title:
          setAction === 'create' || setAction === 'save'
            ? 'Plazo de Detención por Flagrancia Guardado'
            : setAction === 'delete'
            ? 'Plazo de Detención por Flagrancia Eliminado'
            : '',
        subTitle:
          setAction === 'create' || setAction === 'save'
            ? 'Se guardó el plazo de detención por flagrancia correctamente'
            : setAction === 'delete'
            ? 'Se eliminó el plazo de detención por flagrancia correctamente'
            : '',
        textButton: 'Listo',
      },
    });
  }**/

  onCategoryChange(categoryId: any) {
    this.getSpecialtiesData(categoryId);
  }

  ngOnDestroy(): void {
    if (this.modalSuccessSubscription)
      this.modalSuccessSubscription.unsubscribe();
  }
}
