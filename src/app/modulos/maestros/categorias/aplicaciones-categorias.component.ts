import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import {
  Categorias,
  CategoriasCreate,
  IDropdownsData,
  CategoriasRequest,
} from '@interfaces/categorias/categorias';
import { AplicacionesCategoriasService } from './aplicaciones-categorias.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ModalCrearEditarCategoriaComponent } from './modals/modal-crear-editar-categoria/modal-crear-editar-categoria.component';
import { Subscription } from 'rxjs';
import { ModalLogoComponent } from './modals/modal-logo/modal-logo.component';
import { CategoriaService } from '@services/categoria/categoria.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Auth2Service } from '@services/auth/auth2.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';

@Component({
  standalone: true,
  selector: 'app-aplicaciones-categorias',
  templateUrl: './aplicaciones-categorias.component.html',
  styleUrls: ['./aplicaciones-categorias.component.scss'],
  imports: [CommonModule, FiltrosComponent, TablaComponent],
  providers: [DynamicDialogConfig, DialogService],
})
export class AplicacionesCategoriasComponent implements OnInit, OnDestroy {
  public refModalFormulario: DynamicDialogRef;
  public refModal: DynamicDialogRef;
  public refModalMensaje: DynamicDialogRef;
  categorias: Categorias[] = [];

  private modalSuccessSubscription: Subscription;
  public subscriptions: Subscription[] = [];
  public dropdownsData: IDropdownsData;

  protected infoUsuario;
  protected filtrosSeleccionados: any = {};
  private nombreCategoria: string;

  protected previousTextSearch: string = '';
  public totalRegistros: number = 0;
  public existeCategoria;
  public first: number = 0;

  constructor(
    private readonly aplicacionesCategoriasService: AplicacionesCategoriasService,
    private readonly dialogService: DialogService,
    private readonly categoriaService: CategoriaService,
    private readonly spinner: NgxSpinnerService,
    private readonly userService: Auth2Service
  ) { }

  ngOnInit(): void {
    this.getListCategories();
    this.obtenerCategoriasPadre();

    this.infoUsuario = this.userService.getUserInfo();

    this.subscriptions.push(
      this.aplicacionesCategoriasService.actualizarCategorias.subscribe(
        ({ data, codigo }) => {
          this.updateCategoryService(data, codigo);
        }
      )
    );

    this.subscriptions.push(
      this.aplicacionesCategoriasService.isCompleteCategorias.subscribe(
        (data) => {
          this.createNewCategoryService(data);
        }
      )
    );

    this.subscriptions.push(
      this.aplicacionesCategoriasService.showConfirmModal.subscribe(
        ({ setAction, setNombreCategoria, setCategoria }) =>
          this.openModalConfirmAction({
            setAction,
            setNombreCategoria,
            setCategoria,
          })
      )
    );

    //refactorizado
    this.modalSuccessSubscription =
      this.aplicacionesCategoriasService.successModal$.subscribe(
        (action: 'create' | 'save' | 'delete') => {
          this.openModalSuccess(action);
        }
      );

    this.subscriptions.push(this.modalSuccessSubscription);
    //

    this.subscriptions.push(
      this.categoriaService.getRefreshTableListener().subscribe(() => {
        this.getListCategories();
      })
    );
  }

  onLazyLoad(event: { page: number; rows: number; first: number }) {
    this.first = event.first;
    this.getListCategories(this.filtrosSeleccionados, event.page, event.rows);
  }

  getListCategories(filtros?: any, page: number = 1, rows: number = 10) {
    const request: CategoriasRequest = {
      ...filtros,
      pagina: page,
      registrosPorPagina: rows,
    };

    this.spinner.show();

    this.subscriptions.push(
      this.categoriaService.obtenerCategorias(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.categorias = resp.registros;
          this.totalRegistros = resp.totalElementos;
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Error en la solicitud [obtenerCategorias]: ', err);
        },
      })
    );
  }

  obtenerCategoriasPadre() {
    this.subscriptions.push(
      this.categoriaService.obtenerListaCategoriasPadre().subscribe({
        next: (resp) => {
          const sortedData = resp.sort((a, b) => {
            return a.nombre.localeCompare(b.nombre);
          });
  
          this.dropdownsData = {
            ...this.dropdownsData,
            categorias_padre: sortedData,
          };
        },
        error: (err) => {
          console.error('Error en la solicitud [obtenerListaCategoriasPadre]', err);
        },
      })
    );
  }

  createNewCategoryService(data) {
    const request: CategoriasCreate = {
      nombreCategoria: data.nombre,
      nombreCategoriaPlural: data.nombrePlural,
      idCategoriaPadre: data.idCategoriaPadre,
      palabrasClave: data.palabrasClave ? data.palabrasClave.join(',') : '',
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
    };

    this.spinner.show();

    this.subscriptions.push(
      this.categoriaService.crearCategoria(request).subscribe({
        next: (resp: any) => {
          if (resp.existe === '1') {
            if (this.refModal) this.refModal.close();

            this.existeCategoria = true;
            this.spinner.hide();
            this.openModalCategoriaExiste();
          } else {
            this.first = 0;
            this.existeCategoria = false;
            this.getListCategories(this.filtrosSeleccionados, 1, 10);
            this.spinner.hide();

            if (this.refModalFormulario) this.refModalFormulario.close();
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Error en la solicitud [crearCategoria]: ', err);
        },
      })
    );
  }

  updateCategoryService(data, codigo) {
    const request = {
      idCategoria: data.idCategoria,
      nombreCategoria: data.nombre,
      nombreCategoriaPlural: data.nombrePlural,
      idCategoriaPadre: data.idCategoriaPadre,
      palabrasClave: data.palabrasClave ? data.palabrasClave.join(',') : '',
      usuarioCreacion: this.infoUsuario?.usuario.usuario,
    };

    this.spinner.show();

    this.subscriptions.push(
      this.categoriaService.actualizarCategoriaPorId(request).subscribe({
        next: (resp: any) => {
          if (resp.existe === '1') {
            if (this.refModal) this.refModal.close();

            this.existeCategoria = true;
            this.spinner.hide();
            this.openModalCategoriaExiste();
          } else {
            this.first = 0;
            this.existeCategoria = false;
            this.spinner.hide();
            this.getListCategories(this.filtrosSeleccionados, 1, 10);

            if (this.refModalFormulario) this.refModalFormulario.close();
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.error(
            'Error en la solicitud [actualizarCategoriaPorId]: ',
            err
          );
        },
      })
    );
  }

  openModalCategoriaExiste() {
    this.refModalMensaje = this.dialogService.open(ModalMensajeComponent, {
      width: '800px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning-red',
        title: 'CATEGORÍA YA EXISTE',
        subTitle:
          'La categoría ya se encuentra registrada, por favor validar los datos',
        textButtonSecondary: 'Cerrar',
        showOnlySecondaryButton: false,
      },
    });
  }

  public abrirModalAccionAplicaciones(categoria?: any) {
    this.refModalFormulario = this.dialogService.open(
      ModalCrearEditarCategoriaComponent,
      {
        header: categoria ? 'Editar categoría' : 'Nueva categoría',
        width: '768px',
        closable: false,
        contentStyle: { overflow: 'auto' },
        data: {
          categoryDetail: categoria || null,
          categoryDataAll: this.categorias,
          dropdownsData: { ...this.dropdownsData },
        },
      }
    );

    /**
    // this.refModal.onClose.subscribe((categoryData: ICategoria) => {
    //   if (categoryData){
    //     this.createNewCategoryService(categoryData);
    //   }
    // });**/
  }

  deleteCategoria(categoria) {
    const request = {
      idCategoria: categoria.idCategoria,
      usuarioDesactivacion: this.infoUsuario?.usuario.usuario,
    };

    this.spinner.show();

    this.subscriptions.push(
      this.categoriaService.eliminarCategoriaPorId(request).subscribe({
        next: (resp) => {
          this.spinner.hide();
          this.first = 0;
          this.openModalSuccess('delete');
          this.getListCategories(this.filtrosSeleccionados, 1, 10);
        },
        error: (error) => {
          this.spinner.hide();
          console.error(error);
        },
      })
    );
  }

  public aplicarFiltros(selectedValues?: any): void {
    this.filtrosSeleccionados = selectedValues || {};
    this.first = 0;
    this.getListCategories(selectedValues, 1, 10);
  }

  openModalLogo(categoria) {
    this.refModal = this.dialogService.open(ModalLogoComponent, {
      width: '960px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      header: 'Editar Logo',
      data: {
        textButton: 'Aceptar',
        textButtonSecondary: 'Cancelar',

        dataEnvio: categoria,
        infoUsuario: this.infoUsuario.usuario,
      },
    });
  }

  //refactorizado
  openModalConfirmAction(data): void {
    if (!data) return;

    this.nombreCategoria = data.setNombreCategoria;
    const setAction = data.setAction;
    const categoria = data.setCategoria;
    const action = this.obtenerAccion(setAction);

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: this.obtenerDatosModal(setAction, action),
    });

    this.subscriptions.push(
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.ejecutarAccion(setAction, categoria);
          }
        },
      })
    );
  }

  private obtenerAccion(setAction: string): string {
    const actions = {
      create: 'registrar',
      save: 'modificar',
      delete: 'eliminar',
    };

    return actions[setAction] || '';
  }

  private obtenerDatosModal(setAction: string, action: string): any {
    return {
      icon: 'question',
      title: this.obtenerTituloModal(setAction),
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      description: this.obtenerDescripcionModal(setAction, action),
      confirm: true,
    };
  }

  private obtenerTituloModal(setAction: string): string | null {
    const titles = {
      save: 'Editar datos de la categoría',
      create: 'Registrar nueva categoría',
      delete: 'Eliminar categoría',
    };

    return titles[setAction] || null;
  }

  private obtenerDescripcionModal(setAction: string, action: string): string {
    const articulo = setAction === 'delete' ? 'la' : '';
    const tipoCategoria = setAction === 'create' ? 'nueva' : '';
    const datos =
      setAction === 'create' || setAction === 'save' ? 'los datos de la ' : '';

    return `A continuación, se procederá a ${action} ${datos} ${articulo} ${tipoCategoria} categoría <strong>${this.nombreCategoria}</strong>. ¿Está seguro de realizar esta acción?`;
  }

  private ejecutarAccion(setAction: string, categoria: any): void {
    if (setAction === 'create' || setAction === 'save') {
      this.aplicacionesCategoriasService.notifyAction(setAction);
    } else if (setAction === 'delete' && categoria) {
      this.deleteCategoria(categoria);
    }
  }
  //

  openModalSuccess(setAction: 'create' | 'save' | 'delete') {
    let title: string | null;
    let description: string;

    switch (setAction) {
      case 'create':
        title = 'Categoría registrada';
        description = `El registro de los datos de la nueva categoría <strong>${this.nombreCategoria}</strong> se realizó de forma exitosa.`;
        break;

      case 'save':
        title = 'Categoría editada';
        description = `La actualización de los datos de la categoría <strong>${this.nombreCategoria}</strong> se realizó de forma exitosa.`;
        break;

      case 'delete':
        title = 'Categoría eliminada';
        description = `La eliminación de la categoría <strong>${this.nombreCategoria}</strong> se realizó de forma exitosa.`;
        break;

      default:
        title = null;
        description = '';
        break;
    }

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'success',
        confirmButtonText: 'Listo',
        title: title,
        description: description,
      },
    });
  }

  ngOnDestroy(): void {
    if (this.modalSuccessSubscription)
      this.modalSuccessSubscription.unsubscribe();

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
