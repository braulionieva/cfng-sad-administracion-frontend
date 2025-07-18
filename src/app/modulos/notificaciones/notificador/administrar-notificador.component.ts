import { NgIf, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ActualizarNotificReq,
  ActualizarNotificRes,
  AgregarNotificadorReq,
  AgregarNotificadorRes,
  BuscarNotificadoresReq,
  BuscarNotificadoresResRow,
  BuscarNotificadoresResWrapper,
  CentralNotificacionesDTOB,
  DesactivarNotifiReq,
  DesactivarNotificRes,
  FiltroBuscarNotificadoresReq,
  NotificadorForm,
} from '@interfaces/administrar-notificador/administrar-notificador';
import { MessageService, ConfirmationService, MenuItem, LazyLoadEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { AdministrarNotificadorService } from '@services/administrar-notificador/administrar-notificador.service';
import { AgregarDependenciaUsService } from '@services/agregar-dependencia-us/agregar-dependencia-us.service';
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { Auth2Service } from "@services/auth/auth2.service";
import { ConfigPage } from "@interfaces/administrar-dependencia/administrar-dependencia";
import { NgxSpinnerService } from "ngx-spinner";
import { TagModule } from "primeng/tag";
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { DistritoFiscalDTOB } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import { IP_MOD } from '@environments/environment';

@Component({
  selector: 'app-administrar-notificador',
  standalone: true,
  templateUrl: './administrar-notificador.component.html',
  styleUrls: ['./administrar-notificador.component.scss'],
  imports: [TableModule,
    ToastModule, DialogModule, ConfirmDialogModule, ButtonModule,
    MenuModule, NgIf,
    DialogModule, FormsModule, ReactiveFormsModule, InputTextModule,
    DropdownModule, InputNumberModule, CommonModule, TagModule, CmpLibModule],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class AdministrarNotificadorComponent {
  //formulario para el filtro de busqueda de notificadores
  formFiltroBuscar: FormGroup;

  //configuración
  configPage: ConfigPage;
  exportarExcelDisabled: boolean = true;

  //variables de la tabla y response
  //resultado de notificadores
  buscarNotificadoresResWrapper: BuscarNotificadoresResWrapper;
  buscarNotificadoresResLst: BuscarNotificadoresResRow[];
  buscarNotificadoresResTotal: number = 0;
  notificadorSelected: BuscarNotificadoresResRow;

  //variables del filtro
  distritoFiscalLst: DistritoFiscalDTOB[] = [];
  centralNotificacionLst: CentralNotificacionesDTOB[] = [];
  buscarNotificadoresReq: BuscarNotificadoresReq = null;
  filtroBuscarNotificadoresReq: FiltroBuscarNotificadoresReq

  //variables para items
  actionItems: MenuItem[];

  //VARIABLES PARA MODAL DEL NUEVO REGISTRO
  //flag de la ventana modal donde se muestra el formulario de nuevo registro
  isVisibleModalNewForm: boolean;

  //flag para actualizar o editar formulario
  isEditForm: boolean = false;//todos: añadido, pero falta por implementar

  //formulario para los campos de nuevo registro de notificadores
  formNotificadorNew: FormGroup;
  //bean para cargar los datos del formulario de registro y edicion
  notificadorForm: NotificadorForm;

  agregarNotificadorReq: AgregarNotificadorReq;

  agregarNotificadorRes: AgregarNotificadorRes;

  //permite evitar la búsqueda cuando se carga la tabla por primera vez.
  //la primera vez no debe ejecutarse debido a que el usuario no ha enviado los parámetros de búsqueda
  onLazyLoadActivo: boolean = false;

  //dinamic dialog for confirm:
  public refModal: DynamicDialogRef;

  //usuario session
  public usuarioActual;


  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly formBuilder: FormBuilder,
    private readonly agregarDependenciaUsService: AgregarDependenciaUsService,
    private readonly administrarNotificadorService: AdministrarNotificadorService,
    private readonly messageService: MessageService,
    public readonly dialogService: DialogService,
    private readonly userService: Auth2Service,
  ) { }

  ngOnInit() {
    this.actionItems = [
      {
        label: 'Modificar',
        //icon: 'pi pi-trash',
        command: () => {
          this.editNotificadorBtn(this.notificadorSelected)
        }
      },
      {
        label: 'Desactivar',
        //icon: 'pi pi-trash',
        command: () => {
          this.desactivarNotificadorConfirm(this.notificadorSelected)
        }
      },
    ];

    //inicializa formulario para crear o editar
    this.initForm();
    this.initConfigPage();
    this.initFormFiltroBusqueda();
    this.getDistritoFiscalLst();
    this.getCentralNotificacionLst();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioActual = this.userService.getUserInfo();
    }, 100);

    //buscamos y mostramos resultados de búsqueda
    this.buscarNotificadoresFormFiltro();
  }

  initForm() {

    // Inicializamos todas las propiedades a null
    //this.notificadorForm = objectNull<NotificadorForm>();

    this.notificadorForm = Object.create(null)
    this.setDataForm(this.notificadorForm)
  }

  setDataForm(notificadorForm: NotificadorForm) {
    this.formNotificadorNew = this.formBuilder.group({
      idVCentral: new FormControl(notificadorForm.idVCentral, [Validators.required]),
      nuVDocumento: new FormControl(notificadorForm.nuVDocumento, [Validators.required, Validators.maxLength(10)]),
      noVNotificador: new FormControl(notificadorForm.noVNotificador, [Validators.required, Validators.maxLength(40)]),
    })
  }

  initConfigPage() {
    //configuracion de paginas
    this.configPage = {
      pages: 1,//pagina_i
      perPage: 10//número de páginas
    };
  }

  public onClearFilters(): void {
    this.initConfigPage();
    this.initFormFiltroBusqueda();
    this.buscarNotificadoresFormFiltro();
  }

  initFormFiltroBusqueda() {
    this.formFiltroBuscar = this.formBuilder.group({
      idNDistritoFiscal: new FormControl(null, [Validators.required]),
      idVCentral: new FormControl(null, [Validators.required]),
      nuVDocumento: new FormControl("", [Validators.required]),
      noVNotificador: new FormControl("", [Validators.required]),
    });
  }

  getDistritoFiscalLst() {
    this.agregarDependenciaUsService.getDistritoFiscalLst().subscribe({
      next: (response) => {
        this.distritoFiscalLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getCentralNotificacionLst() {
    this.administrarNotificadorService.getCentralNotificacionLst().subscribe({
      next: (response) => {
        this.centralNotificacionLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  //buscamos por numero de documento
  buscarNotificadoresFormFiltroNuVDocumentoKeyUp() {
    const descripcion = this.formFiltroBuscar.get('nuVDocumento').value;
    if (descripcion && descripcion.length >= 3) {
      this.buscarNotificadoresFormFiltro();
    }
  }

  //buscamos por nombre del notificador
  buscarNotificadoresFormFiltroNoVNotificadorKeyUp() {
    const descripcion = this.formFiltroBuscar.get('noVNotificador').value;
    if (descripcion && descripcion.length >= 3) {
      this.buscarNotificadoresFormFiltro();
    }
  }


  buscarNotificadoresFormFiltro() {
    this._buscarNotificador();

    //activamos luego de los resultados de busqueda para que permita la paginación
    this.onLazyLoadActivo = true;
  }

  buscarNotificadorPaginacion(event: LazyLoadEvent) {
    if (this.onLazyLoadActivo) {
      //configurando page cuyos valores son (0,10,20,30,... deben ser convertidos a 1,2,3,...)
      this.configPage.pages = (event.first / 10) + 1;
      this._buscarNotificador()
    }
  }

  _buscarNotificador() {
    this.spinner.show();
    this.filtroBuscarNotificadoresReq = { ...this.formFiltroBuscar.value };
    this.buscarNotificadoresReq = {
      ...this.buscarNotificadoresReq,
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: this.filtroBuscarNotificadoresReq
    };

    this.administrarNotificadorService.buscarNotificadores(this.buscarNotificadoresReq).subscribe({
      next: (response) => {
        this.buscarNotificadoresResWrapper = response;
        this.buscarNotificadoresResLst = this.buscarNotificadoresResWrapper.registros;
        this.buscarNotificadoresResTotal = this.buscarNotificadoresResWrapper.totalElementos;
        if (this.buscarNotificadoresResTotal > 0) {
          this.exportarExcelDisabled = false;
        } else {
          this.exportarExcelDisabled = true;
        }
        this.spinner.hide();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error al consultar datos.' });
        this.spinner.hide();
      }
    })
  }


  exportarNotificadoresForm() {
    const request: FiltroBuscarNotificadoresReq = { ...this.formFiltroBuscar.value }
    this.administrarNotificadorService.exportarexcel(request).subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'Notificadores.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al consultar datos")
      }
    });
  }

  itemSelected(activeItem: any) {
    this.notificadorSelected = activeItem;

  }

  agregarNotificadorBtn() {
    this.initForm();
    this.isVisibleModalNewForm = true;
    this.isEditForm = false;
  }

  onCloseModal() {
    this.isVisibleModalNewForm = false;
  }

  // openModalFormEdit() {
  //   this.isVisibleModalFormEdit = true;
  // }
  // onCloseModalFormEdit() {
  //   this.isVisibleModalFormEdit = false;
  // }
  cancelarAddNotificadorSubmit() {
    this.onCloseModal();
  }

  agregarNotificadorSubmit() {
    if (this.formNotificadorNew.valid) {
      this.confirmarAgregarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._agregarNotificadorNewSubmit()
          }
        },
        error: (err) => {
          console.error('Error al agregar registro.', err);
          throw new Error('Error al agregar registro');
        },
      });
    } else {
      this.formNotificadorNew.markAllAsTouched();
    }
  }

  _agregarNotificadorNewSubmit() {
    try {
      this.spinner.show();
      /**const noVNotificador = this.formNotificadorNew.get('noVNotificador').value**/

      this.agregarNotificadorReq = {
        ...this.formNotificadorNew.value,
        esCNotificador: '1',
        coVUsCreacion: this.usuarioActual?.usuario.usuario,
      }

      this.administrarNotificadorService.agregarNotificador(this.agregarNotificadorReq).subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.PO_V_ERR_COD == '0') {
            this.refModal = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'success',
                title: 'Notificador Guardado',
                description: `Se guardó el notificador correctamente`,
                confirmButtonText: 'Listo'
              },
            });

            this.refModal.onClose.subscribe({
              next: (resp) => {
                if (resp === 'confirm') {
                  this.buscarNotificadoresFormFiltro()
                  this.onCloseModal()
                }
              },
              error: (err) => {
                console.error('Error al agregar registro.', err);
                throw new Error('Error al agregar registro');
              },
            });

          } else {
            this.messageService.add({ severity: 'error', summary: '', detail: response.PO_V_ERR_MSG });
          }
        },
        error: (err) => {
          console.error("error al leer datos del servidor. ", err);
        }
      })
    } catch (error) {
      throw new Error('Error al procesar los datos');
    }

  }

  desactivarNotificadorConfirm(notificadorSelected: BuscarNotificadoresResRow) {
    this.confirmarDesactivarRegistro('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.desactivarNotificadorSubmit(notificadorSelected);
        }
      },
      error: (err) => {
        console.error('Error al agregar registro.', err);
        throw new Error('Error al agregar registro');
      },
    });
  }

  desactivarNotificadorSubmit(notificadorSelected: BuscarNotificadoresResRow) {
    const desactivarNotifiReq: DesactivarNotifiReq = {
      idVNotificador: notificadorSelected.idVNotificador,
      coVUsDesactivacion: this.usuarioActual?.usuario.usuario,
      coVUsModificacion: this.usuarioActual?.usuario.usuario,
      ipVModificacion: IP_MOD
    };

    this.administrarNotificadorService.desactivarNotificador(desactivarNotifiReq).subscribe({
      next: (response) => {
        const desactivarNotifiRes: DesactivarNotificRes = response;
        if (desactivarNotifiRes.PO_V_ERR_COD == '0') {
          this.buscarNotificadoresFormFiltro()
        }
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  //mostramos formulario, el método de envío es actualizarNotificadorNewSubmit()
  editNotificadorBtn(notificadorSelected: BuscarNotificadoresResRow) {
    this.isVisibleModalNewForm = true;
    this.isEditForm = true;
    this.notificadorForm = { ...notificadorSelected }
    this.setDataForm(this.notificadorForm);
    /**
    // this.formNotificadorEdit = this.formBuilder.group({
    //   idVCentral: new FormControl(notificadorSelected.idVCentral, [Validators.required]),
    //   nuVDocumento: new FormControl({ value: notificadorSelected.nuVDocumento, disabled: true }, [Validators.required]),
    //   noVNotificador: new FormControl({ value: notificadorSelected.noVNotificador, disabled: true }, [Validators.required]),
    // })**/

    //desabilitar nuVDocumento
    this.formNotificadorNew.get('nuVDocumento').disable();

    //desabilitar noVNotificador
    this.formNotificadorNew.get('noVNotificador').disable();

  }

  /**
  // cancerlarNotificadorEditSubmit() {
  //   this.onCloseModalFormEdit();
  // }**/
  editNotificadorSubmit() {
    if (this.formNotificadorNew.valid) {
      this.confirmarActualizarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._editNotificadorForm();
          }
        },
        error: (err) => {
          console.error('Error al agregar registro.', err);
          throw new Error('Error al agregar registro');
        },
      });
    } else {
      this.formNotificadorNew.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos' });
    }
  }

  _editNotificadorForm() {
    try {
      this.spinner.show();
      const noVNotificador = this.formNotificadorNew.get('noVNotificador').value

      const actualizarNotificReq: ActualizarNotificReq = {
        ...this.formNotificadorNew.value,
        idVNotificador: this.notificadorSelected.idVNotificador,
        coVUsModificacion: this.usuarioActual?.usuario.usuario,
        ipVModificacion: IP_MOD
      }

      this.administrarNotificadorService.actualizarNotificador(actualizarNotificReq).subscribe({
        next: (response) => {
          this.spinner.hide();
          const actualizarNotificRes: ActualizarNotificRes = response;
          if (actualizarNotificRes.PO_V_ERR_COD == '0') {
            this.refModal = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'success',
                title: 'Notificador Editador',
                description: `La actualización del notificador <b>"${noVNotificador}"</b> se realizó de forma exitosa`,
                confirmButtonText: 'Listo'
              },
            });

            this.refModal.onClose.subscribe({
              next: (resp) => {
                if (resp === 'confirm') {
                  this.onCloseModal()
                  this.buscarNotificadoresFormFiltro()
                }
              },
              error: (err) => {
                console.error('Error al actualizar registro.', err);
                throw new Error('Error al actualizar registro');
              },
            });

          } else {
            this.messageService.add({ severity: 'error', summary: '', detail: actualizarNotificRes.PO_V_ERR_MSG });
          }
        },
        error: (error) => {
          throw new Error('Error al procesar los datos');
        }
      })

    } catch (error) {
      throw new Error('Error al procesar los datos');
    }

  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  private confirmarAgregarRegistro(icon: string): void {
    const noVNotificador = this.formNotificadorNew.get('noVNotificador').value
    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '750px',
        showHeader: false,
        data: {
          icon: icon,
          title: 'REGISTRAR NOTIFICADOR',
          confirm: true,
          description:
            'A continuación, se procederá a registrar los datos del notificador ' +
            `<b>"${noVNotificador}"</b>` +
            '.<br>¿Esta seguro de realizar esta acción?',
          confirmButtonText: 'Aceptar'
        },
      });
  }

  private confirmarActualizarRegistro(icon: string): void {
    const noVNotificador = this.formNotificadorNew.get('noVNotificador').value
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'MODIFICAR NOTIFICADOR',
        confirm: true,
        description:
          'A continuación, se procederá a modificar los datos del notificador ' +
          `<b>"${noVNotificador}"</b>` +
          '.<br>¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  private confirmarDesactivarRegistro(icon: string): void {
    const noVNotificador = this.notificadorSelected.noVNotificador
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'DESACTIVAR NOTIFICADOR',
        confirm: true,
        description:
          'A continuación, se procederá a desactivar los datos del notificador ' +
          `<b>"${noVNotificador}"</b>` +
          '.<br>¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  protected readonly obtenerIcono = obtenerIcono;
}

