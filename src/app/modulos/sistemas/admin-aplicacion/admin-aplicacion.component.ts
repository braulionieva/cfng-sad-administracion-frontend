import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CalendarModule } from "primeng/calendar";
import { NgIf } from "@angular/common";
import { NgxSpinnerService } from "ngx-spinner";
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { Auth2Service } from "@services/auth/auth2.service";
import { PlazoDocObsService } from "@services/plazo-doc-obs/plazo-doc-obs.service";
import { ConfigPage } from "@interfaces/administrar-dependencia/administrar-dependencia";
import { obtenerIcono } from "@utils/icon";
import { Menu, MenuModule } from "primeng/menu";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import {
  BuscarAplicacioRes,
  CategoriaResponse,
  DataModal, EliminarAplicacioReq,
  BuscarAplicacionFiltro, BuscarAplicacionReq
} from "@interfaces/aplicacion-bandeja/aplicacionBean";
import { Router } from "@angular/router";
import { AdminAplicacionService } from "@services/aplicacion-bandeja/admin-aplicacion.service";
import {
  AddEditAplicacionComponent
} from "@modulos/sistemas/admin-aplicacion/add-edit-aplicacion/add-edit-aplicacion.component";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { ModalLogoAppComponent } from "@modulos/sistemas/admin-aplicacion/modal-logo-app/modal-logo-app.component";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'app-admin-aplicacion',
  standalone: true,
  templateUrl: './admin-aplicacion.component.html',
  styleUrls: ['./admin-aplicacion.component.scss'],
  imports: [
    ButtonModule,
    CmpLibModule,
    DropdownModule,
    InputTextModule,
    PaginatorModule,
    ReactiveFormsModule,
    CalendarModule,
    NgIf,
    MenuModule,
    TableModule,
    TagModule,
    AddEditAplicacionComponent,
  ],
  providers: [MessageService, ConfirmationService, DialogService],

})
export class AdminAplicacionComponent {

  @ViewChild(AddEditAplicacionComponent) childComponent: AddEditAplicacionComponent;

  actionItems: MenuItem[];
  @ViewChild(Menu) menu: Menu;

  //variables del filtro
  formFiltroSearch: FormGroup;
  showMoreFiltro: boolean;

  exportarExcelDisabled: boolean = true;

  categoriaLstFilter: CategoriaResponse[];
  buscarAplicacionFiltro: BuscarAplicacionFiltro;

  //listado de aplicaciones
  aplicacionLst: BuscarAplicacioRes[];
  aplicacionLstTotal: number = 0;

  //opciones para el listado de aplicaciones
  aplicacionSelected: BuscarAplicacioRes;

  //actionItems: MenuItem[];

  //configuración
  configPage: ConfigPage;

  //permite evitar la búsqueda cuando se carga la tabla por primera vez.
  //la primera vez no debe ejecutarse debido a que el usuario no ha enviado los parámetros de búsqueda
  onLazyLoadActivo: boolean = false;

  //flag para actualizar
  isEditForm: boolean;

  //dinamic dialog for confirm:
  public refModal: DynamicDialogRef;

  //variables a enviar al modal formGetters
  dataModal: DataModal;

  //usuario session
  public usuarioSesion;

  //paginacion
  first = 0;

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    public readonly dialogService: DialogService,
    private readonly userService: Auth2Service,
    private readonly plazoDocObsService: PlazoDocObsService,
    private readonly aplicacionService: AdminAplicacionService,
    private readonly router: Router,
  ) {

  }

  ngOnInit() {

    this.dataModal = { isVisible: false }
    this.isEditForm = false;

    this.initConfigPage()
    this.initFormFiltroBuscar();
    this.getCategoriaLst();

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);

    //buscamos y mostramos resultados de búsqueda
    this.buscarAplicacionFormFiltro();

    //activamos busqueda al change values
    this.buscarAplicacionChangeValues();
  }

  initConfigPage() {
    //configuracion de paginas
    this.first = 0; // Añadir esta línea
    this.configPage = {
      pages: 1,//pagina_i
      perPage: 10//número de páginas
    };
  }

  //búsqueda no requiere validación
  initFormFiltroBuscar() {

    this.formFiltroSearch = this.formBuilder.group({
      noVAplicacion: new FormControl(null,),
      coAplicacion: new FormControl(null,),
      deVSiglas: new FormControl(null,),
      idNCategoria: new FormControl(null,),
      feDLanzto: new FormControl(null,),
    }, { emitEvent: false });
  }

  buscarAplicacionChangeValues() {
    this.formFiltroSearch.valueChanges
      .pipe(
        debounceTime(300),
      )
      .subscribe(() => {
        this.first = 0;
        this.initConfigPage();
        this.buscarAplicacionFormFiltro();
      });
  }

  buscarAplicacionFormFiltro() {
    this._buscarAplicacionFormFiltro()

    //activamos luego de los resultados de busqueda para que permita la paginación
    this.onLazyLoadActivo = true;
  }

  buscarAplicacionPaginacion(event: LazyLoadEvent) {
    if (this.onLazyLoadActivo) {
      //configurando page cuyos valores son (0,10,20,30,... deben ser convertidos a 1,2,3,...)
      this.first = event.first;
      this.configPage.pages = (event.first / 10) + 1;
      this._buscarAplicacionFormFiltro()
    }
  }

  _buscarAplicacionFormFiltro() {
    this.spinner.show();

    this.buscarAplicacionFiltro = { ...this.formFiltroSearch.value };
    const buscarAplicacionReq: BuscarAplicacionReq = {
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: this.buscarAplicacionFiltro,
    }

    this.aplicacionService.buscarAplicacionesFormFiltro(buscarAplicacionReq).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.aplicacionLst = response.registros;
        this.aplicacionLstTotal = response.totalElementos;
        if (this.aplicacionLstTotal > 0) {
          this.exportarExcelDisabled = false;
        } else {
          this.exportarExcelDisabled = true;
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al consultar datos")
      }
    });
  }

  // buscarAplicacionKeuUpNoVaplicacionFormFiltro() {
  //   const descripcion = this.formFiltroSearch.get('noVAplicacion').value;
  //   if (descripcion && descripcion.length >= 3) {
  //     this.buscarAplicacionFormFiltro();
  //   }
  // }

  toggleMasFiltros() {
    this.showMoreFiltro = !this.showMoreFiltro
  }

  onClearFiltersAndSearch(): void {
    this.initConfigPage();
    
    this.formFiltroSearch.reset({
      noVAplicacion: null,
      coAplicacion: null,
      deVSiglas: null,
      idNCategoria: null,
      feDLanzto: null,
    }, { emitEvent: false }); 
  
    this.buscarAplicacionFormFiltro();
  }

  exportarExcelForm() {
    const filtroSearchReq: BuscarAplicacionFiltro = { ...this.formFiltroSearch.value };
    this.aplicacionService.exportarexcel(filtroSearchReq).subscribe({
      next: (response) => {
        this.spinner.hide();
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'lista_aplicaciones.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al consultar datos")
      }
    });
  }

  protected readonly obtenerIcono = obtenerIcono;

  getCategoriaLst() {
    this.aplicacionService.getCategoriaLst().subscribe({
      next: (response) => {
        this.categoriaLstFilter = response.sort((a, b) =>
          a.noVCategoria.localeCompare(b.noVCategoria)
        );
      },
      error: (err) => {
        console.error("error al consultar datos");
      }
    });
  }

  verOpcionesAplicacion(event: MouseEvent, item: BuscarAplicacioRes) {
    this.aplicacionSelected = item;

    this.actionItems = [
      {
        label: 'Menú',
        command: () => {
          const coAplicacion = this.aplicacionSelected.coVAplicacion;
          const deVSiglas = this.aplicacionSelected.deVSiglas;
          const noVAplicacion = this.aplicacionSelected.noVAplicacion;
          const idAplicacion = this.aplicacionSelected.idNAplicacion;
          this.router.navigate(['/app/administracion-menu/administracion-de-menu'], {
            queryParams: {
              coAplicacion: encodeURIComponent(coAplicacion),
              deVSiglas: encodeURIComponent(deVSiglas),
              noVAplicacion: encodeURIComponent(noVAplicacion),
              idAplicacion: encodeURIComponent(idAplicacion)
            }
          });

        },
      },
      {
        label: 'Logo',
        //icon: 'pi pi-wrench',
        command: () => {
          this.openModalLogo(this.aplicacionSelected);
        },
      },
      {
        label: 'Editar',
        //icon: 'pi pi-pencil',
        command: () => {
          this.openModalEditForm();
        },
      },
      {
        label: 'Eliminar',
        //icon: 'pi pi-trash',
        command: () => {
          this.eliminarAplicacion(this.aplicacionSelected)
        },
      }]

    this.menu.toggle(event);
  }

  openModalFormNew() {
    /**this.cleanFormDependencia();
    this.isVisibleModalNewForm = true;
    this.isEditForm = false;**/
    this.isEditForm = false;
    this.dataModal.isVisible = true;
    this.childComponent.initData();
  }

  //modificacion de openModalEditForm()
  openModalEditForm() {
    this.isEditForm = true;
    this.dataModal.isVisible = true;
    this.childComponent.initDataEdit(this.aplicacionSelected);
  }

  closeModalAplicacion() {
    this.dataModal.isVisible = false;
  }

  closeModalResponseAplicacion(data: any) {
    this.dataModal.isVisible = false;
  }

  closeModalAndUpdateAplicacion() {
    this.dataModal.isVisible = false;
    this.buscarAplicacionFormFiltro();
  }

  eliminarAplicacion(aplicacionSelected: BuscarAplicacioRes) {
    this.confirmarEliminarRegistro(aplicacionSelected);
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this._deleteForm(aplicacionSelected);
        }
      },
      error: (err) => {
        console.error('Error al eliminar registro.', err);
        throw new Error('Error al eliminar registro');
      },
    });
  }

  confirmarEliminarRegistro(aplicacionSelected: BuscarAplicacioRes) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Eliminar aplicación',
        confirm: true,
        description:
          `A continuación, se procederá a eliminar la aplicación <b>${aplicacionSelected.noVAplicacion}</b>. ¿Está seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar'
      },
    });
  }

  _deleteForm(aplicacionSelected: BuscarAplicacioRes) {
    const eliminarAplicacioReq: EliminarAplicacioReq = {
      idNAplicacion: aplicacionSelected.idNAplicacion,
      coVUsCreacion: this.usuarioSesion?.usuario.usuario,
    };

    this.aplicacionService.eliminarAplicacion(eliminarAplicacioReq).subscribe({
      next: (response) => {
        if (response.PO_V_ERR_COD === "0") {
          this.buscarAplicacionFormFiltro();
          this.eliminarRegistroOkMessage(aplicacionSelected);
        } else if (response.PO_V_ERR_COD === "1") {
          this.dialogError('Error', 'No se pudo completar la operación. Por favor, inténtalo de nuevo.');
        }
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error al eliminar los datos.' });
      }
    });

  }

  eliminarRegistroOkMessage(aplicacionSelected: BuscarAplicacioRes) {
    const noVAplicacion = aplicacionSelected.noVAplicacion

    this.dialogSuccess(
      'Aplicación eliminada',
      `La eliminación de la aplicación <b>${noVAplicacion}</b> se realizó de forma exitosa.`
    )
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.buscarAplicacionFormFiltro()
        }
      },
      error: (err) => {
        throw new Error('Error al aliminar registro');
      },
    });
  }

  public dialogSuccess(title: string, description: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'success',
        title: title,
        description: description,
        confirmButtonText: 'Listo'
      },
    });
  }

  public dialogWarning(title: string, description: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: title,
        description: description,
        confirmButtonText: 'Listo'
      },
    });
  }

  public dialogError(title: string, description: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'error',
        title: title,
        description: description,
        confirmButtonText: 'Listo'
      },
    });
  }

  openModalLogo(aplicacionSelected: BuscarAplicacioRes) {
    /**const logoImg = aplicacionSelected.logo;**/
    this.refModal = this.dialogService.open(ModalLogoAppComponent, {
      width: '960px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      header: 'Editar Logo',
      data: {
        textButton: 'Aceptar',
        textButtonSecondary: 'Cancelar',

        dataEnvio: aplicacionSelected,
        usuarioSesion: this.usuarioSesion
        // logoImg,
        // infoUsuario: this.usuarioSesion.usuario,
        // idCategoria: aplicacionSelected.idNAplicacion,
        //extension: "aplicacionSelected.extension",
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.buscarAplicacionFormFiltro();
        }
      },
      error: (err) => {
        console.error('Error al actualizar registro.', err);
        throw new Error('Error al actualizar registro');
      },
    });
  }

}
