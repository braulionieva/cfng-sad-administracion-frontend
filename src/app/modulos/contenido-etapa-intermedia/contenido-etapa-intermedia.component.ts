import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoActoprocesal, AcusacionTRow, BuscarAcusacionReq, BuscarAcusacionReqFiltro, SobreseimientoTRow, BuscarSobreseimientoReqFiltro, BuscarSobreseimientoReq, AcusacionObjForm, AgregarAcusacionReq, AgregarAcusacionRes, SobreseimientoObjForm, ActualizarAcusacionReq, ActualizarAcusacionRes, AgregarSobreseimientoReq, AgregarSobreseimientoRes, ActualizarSobreseimientoRes, ActualizarSobreseimientoReq, EliminarAcusacionReq, EliminarAcusacionRes, EliminarSobreseimientoReq, EliminarSobreseimientoRes } from '@interfaces/contenido-etapa-intermedia/ContenidoEtapaIntermedia';
import { ConfigPage } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import { ContenidoEtapaIntermediaService } from '@services/contenido-etapa-intermedia/contenido-etapa-intermedia.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService, ConfirmationService, MenuItem, LazyLoadEvent, ConfirmEventType } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";

@Component({
  selector: 'app-contenido-etapa-intermedia',
  standalone: true,
  templateUrl: './contenido-etapa-intermedia.component.html',
  styleUrls: ['./contenido-etapa-intermedia.component.scss'],
  imports: [CommonModule,
    TableModule,
    ToastModule, DialogModule, ConfirmDialogModule,
    MenuModule, NgIf,
    FormsModule, ReactiveFormsModule, InputTextModule,
    DropdownModule, InputNumberModule, CommonModule,
    InputTextareaModule, InputTextareaModule, CmpLibModule,
  ],
  providers: [MessageService, ConfirmationService,],
})
export class ContenidoEtapaIntermediaComponent {

  formFiltroBuscar: FormGroup;

  //dropdown ddown tipo contenido para búsqueda
  tipoContenidoLst: TipoActoprocesal[] = []

  //variables para acusacion y sobreseimiento
  configPage: ConfigPage;

  //Variables para acusacion
  acusacionTRowLst: AcusacionTRow[] = [];
  acusacionTRowSelected: AcusacionTRow;
  acusacionTRowLstTotal: number = 0;//total de registros de búsqueda

  //Variables para sobreseimiento
  sobreseimientoTRowLst: SobreseimientoTRow[] = [];
  sobreseimientoTRowSelected: SobreseimientoTRow;
  sobreseimientoTRowLstTotal: number = 0;//total de registros de búsqueda

  //permite evitar la búsqueda cuando se carga la tabla por primera vez.
  //la primera vez no debe ejecutarse debido a que el usuario no ha enviado los parámetros de búsqueda
  onLazyLoadActivo: boolean = false;

  //variables para items de cada resultado
  actionItemsAcusacion: MenuItem[];
  actionItemsSobreseimiento: MenuItem[];

  //modal
  //NUEVO REGISTRO ACUSACION
  isVisibleModalAcusacionNewForm: boolean = false;
  //formulario para los campos de nuevo registro y edicion
  formGroupAcusacion: FormGroup;
  //flag para actualizar true para editar y false para nuevo registro
  isEditAcusacionForm: boolean = false;
  //bean para cargar los datos del formulario de registro y edicion
  acusacionObjForm: AcusacionObjForm;

  //Datos para modal notificaciones
  isVisibleModalNotification: boolean;
  modalNotificationTitle: string;
  modalNotificationMsg: string;
  modalNotificationMsg2: string;//segundo mensaje
  modalNotificationType: string = 'success';//success, danger, warning,

  //modal
  //NUEVO REGISTRO SOBRESEIMIENTO
  isVisibleModalSobreseimientoNewForm: boolean = false;
  //formulario para los campos de nuevo registro y edicion
  formGroupSobreseimiento: FormGroup;
  //flag para actualizar true para editar y false para nuevo registro
  isEditSobreseimientoForm: boolean = false;
  //bean para cargar los datos del formulario de registro y edicion
  sobreseimientoObjForm: SobreseimientoObjForm;

  //declaración del tipo de contenido
  co_tipo_contenido_acusacion: string;
  co_tipo_contenido_sobreseimiento: string;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private contenidoEtapaIntermediaService: ContenidoEtapaIntermediaService,
  ) {

  }

  ngOnInit() {
    this.co_tipo_contenido_acusacion = "000022"
    this.co_tipo_contenido_sobreseimiento = "000023"

    this.tipoContenidoLst = [
      { tipoContenido: this.co_tipo_contenido_acusacion, nombre: "Contenido Obligatorio" },
      { tipoContenido: this.co_tipo_contenido_sobreseimiento, nombre: "Procede con" }
    ]

    /**
    // this.tipoContenidoLst[0].tipoContenido=this.co_tipo_contenido_acusacion;
    // this.tipoContenidoLst[0].nombre="Contenido Obligatorio"
    // this.tipoContenidoLst[1].tipoContenido=this.co_tipo_contenido_sobreseimiento;
    // this.tipoContenidoLst[1].nombre="Procede con"
    **/

    this.actionItemsAcusacion = [
      {
        label: 'Editar',
        command: () => {
          this.openModalUpdateAcusacionForm();
        }
      },
      {
        label: 'Eliminar',
        command: () => {
          this.deleteAcusacionForm();
        }
      },
    ];

    this.actionItemsSobreseimiento = [
      {
        label: 'Editar',
        command: () => {
          this.openModalUpdSobreseimientoForm();
        }
      },
      {
        label: 'Eliminar',
        command: () => {
          this.deleteSobreseimientoForm();
        }
      },
    ];

    //inicializa limpiando y creando objetos vacíos
    this.limpiarFiltrosBusqueda();


    //inicializa formulario Acusacion
    this.initAcusacionForm();

    //inicializa formulario sobreseimiento
    this.initSobreseimientoForm();
  }

  /**
  // private confirmarEliminacionDeGrupoAleatorio(icon: string): void {
  //   this.refModal = this.dialogService.open(AlertModalDistribucionComponent, {
  //     width: '750px',
  //     showHeader: false,
  //     data: {
  //       icon: icon,
  //       title: 'ELIMINAR DATOS DEL GRUPO ALEATORIO',
  //       confirm: true,
  //       description:
  //         'A continuación el registro, ¿Esta seguro de realizar esta acción?',
  //     },
  //   });
  // } **/

  limpiarFiltrosBusqueda() {
    this.formFiltroBuscar = this.formBuilder.group({
      tipoContenido: new FormControl(null, [Validators.required]),
      descripcion: new FormControl(null, [Validators.required]),
    });

    //configuracion de paginas
    this.configPage = {
      pages: 1,//pagina_i
      perPage: 10//número de páginas
    };

  }

  //obtiene cada tecla y si cumple con la cantidad de registros, puede buscar el registro
  buscarFiltroKeyUp() {
    const tipoContenido: string = this.formFiltroBuscar.get('tipoContenido').value;
    const descripcion = this.formFiltroBuscar.get('descripcion').value;
    // if (this.formFiltroBuscar.valid && descripcion.length >= 3) {
    // }
    if (tipoContenido == this.co_tipo_contenido_acusacion) {
      this.buscarAcusacionFiltroForm()
    } else if (tipoContenido == this.co_tipo_contenido_sobreseimiento) {
      this.buscarSobreseimientoFiltroForm()
    }

    //configuracion de paginas
    this.configPage = {
      pages: 1,//pagina_i
      perPage: 10//número de páginas
    };

  }

  //inicia el procedo de búsqueda de contenido obligatorio a partir del filtro
  buscarAcusacionFiltroForm() {
    this._buscarAcusasionFiltro();

    //activamos luego de los resultados de busqueda para que permita la paginación
    this.onLazyLoadActivo = true;

  }

  _buscarAcusasionFiltro() {
    this.spinner.show();

    const tipoContenido = this.formFiltroBuscar.get('tipoContenido').value;
    const descripcion = this.formFiltroBuscar.get('descripcion').value;

    const filtros: BuscarAcusacionReqFiltro = {
      //...this.formFiltroBuscar.value,
      idVActoProcesal: tipoContenido,
      noVArticulo: descripcion
    }

    const buscarAcusacionReq: BuscarAcusacionReq = {
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: filtros
    }


    this.contenidoEtapaIntermediaService.buscarAcusacion(buscarAcusacionReq).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.acusacionTRowLst = response.registros;
        this.acusacionTRowLstTotal = response.totalElementos;
      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al leer datos del servidor. ", err);
      }
    });

  }

  buscarAcusacionFiltroPaginacion(event: LazyLoadEvent) {
    if (this.onLazyLoadActivo) {
      //configurando page cuyos valores son (0,10,20,30,... deben ser convertidos a 1,2,3,...)
      this.configPage.pages = (event.first / 10) + 1;

      this._buscarAcusasionFiltro()
    }
  }

  itemSelectedAcusacion(activeItem: any) {
    this.acusacionTRowSelected = activeItem;
  }

  exportarExcel() {
    const tipoContenido: string = this.formFiltroBuscar.get('tipoContenido').value;
    const descripcion = this.formFiltroBuscar.get('descripcion').value;

    if (tipoContenido == this.co_tipo_contenido_acusacion) {
      this._buscarAcusacionExcel();
    } else if (tipoContenido == this.co_tipo_contenido_sobreseimiento) {
      this._buscarSobreseimientoExcel();
    } else {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Seleccione tipo de contenido para proceder con la búsqueda o descarga.' });
    }
  }

  _buscarAcusacionExcel() {
    this.spinner.show();

    const tipoContenido = this.formFiltroBuscar.get('tipoContenido').value;
    const descripcion = this.formFiltroBuscar.get('descripcion').value;

    const request: BuscarAcusacionReqFiltro = {
      idVActoProcesal: tipoContenido,
      noVArticulo: descripcion
    }

    this.contenidoEtapaIntermediaService.buscarAcusacionExcel(request).subscribe({
      next: (response) => {
        this.spinner.hide();

        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'AcusacionesExcel.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);

      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al leer datos del servidor. ", err);
      }
    });
  }

  _buscarSobreseimientoExcel() {
    this.spinner.show();

    const tipoContenido = this.formFiltroBuscar.get('tipoContenido').value;
    const descripcion = this.formFiltroBuscar.get('descripcion').value;

    const request: BuscarSobreseimientoReqFiltro = {
      idVActoProcesal: tipoContenido,
      noVArticulo: descripcion
    }

    this.contenidoEtapaIntermediaService.buscarSobreseimientoExcel(request).subscribe({
      next: (response) => {
        this.spinner.hide();

        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'SobreseimientoExcel.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);

      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al leer datos del servidor. ", err);
      }
    });
  }

  //inicia el procedo de búsqueda de contenido obligatorio a partir del filtro
  buscarSobreseimientoFiltroForm() {
    this._buscarSobreseimientoFiltro();

    //activamos luego de los resultados de busqueda para que permita la paginación
    this.onLazyLoadActivo = true;
  }

  _buscarSobreseimientoFiltro() {
    this.spinner.show();

    const tipoContenido = this.formFiltroBuscar.get('tipoContenido').value;
    const descripcion = this.formFiltroBuscar.get('descripcion').value;

    const filtros: BuscarSobreseimientoReqFiltro = {
      //...this.formFiltroBuscar.value,
      idVActoProcesal: tipoContenido,
      noVArticulo: descripcion
    }

    const buscarSobreseimientoReq: BuscarSobreseimientoReq = {
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: filtros
    }

    this.contenidoEtapaIntermediaService.buscarSobreseimiento(buscarSobreseimientoReq).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.sobreseimientoTRowLst = response.registros;
        this.sobreseimientoTRowLstTotal = response.totalElementos;

      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al leer datos del servidor. ", err);
      }
    });

  }

  buscarSobreseimientoFiltroPaginacion(event: LazyLoadEvent) {
    if (this.onLazyLoadActivo) {
      //configurando page cuyos valores son (0,10,20,30,... deben ser convertidos a 1,2,3,...)
      this.configPage.pages = (event.first / 10) + 1;

      this._buscarSobreseimientoFiltro()
    }
  }

  openModalNewAcusacionForm() {
    this.isVisibleModalAcusacionNewForm = true;
    this.cleanFormAcusacion();
    this.isEditAcusacionForm = false;
  }

  cleanFormAcusacion() {
    this.formGroupAcusacion.reset();
  }

  itemSelectedSobreseimiento(activeItem: any) {
    this.sobreseimientoTRowSelected = activeItem;
  }

  initAcusacionForm() {
    this.acusacionObjForm = Object.create(null)
    this.setDataAcusacionForm(this.acusacionObjForm)
  }

  setDataAcusacionForm(acusacionObjForm: AcusacionObjForm) {
    this.formGroupAcusacion = this.formBuilder.group({
      idNGestionarContenido: new FormControl(acusacionObjForm.idNGestionarContenido),
      nuVArticulo: new FormControl(acusacionObjForm.nuVArticulo, [
        Validators.required,
        Validators.maxLength(10),
      ]),
      noVArticulo: new FormControl(acusacionObjForm.noVArticulo, [
        Validators.required,
        Validators.maxLength(500),
      ]),
    });
  }

  onCloseModalAcusacion() {
    this.isVisibleModalAcusacionNewForm = false;
  }

  /**
  // cancelarAddFormAcusacionBtn() {
  //   this.onCloseModalAcusacion();
  // }**/

  async addFormAcusacionBtn() {
    if (this.formGroupAcusacion.valid) {
      const request: AgregarAcusacionReq = {
        ...this.formGroupAcusacion.value,
        coVUsCreacion: '40131447'
      }
      const agregarAcusacionRes: AgregarAcusacionRes = await this.contenidoEtapaIntermediaService.agregarAcusacion(request);
      if (agregarAcusacionRes.PO_V_ERR_COD == '0') {
        this.onOpenModalNotificationSuccess(
          `Contenido Obligatorio de Acusación registrado`,
          `Se guardó exitosamente el Contenido Obligatorio:`,
          `${this.formGroupAcusacion.get('nuVArticulo').value} ${this.formGroupAcusacion.get('noVArticulo').value}`
        );
      } else {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: agregarAcusacionRes.PO_V_ERR_MSG });
      }
    } else {
      this.marcarCamposComoTocados(this.formGroupAcusacion);
    }

  }

  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  onOpenModalNotificationWarning(title: string, msg: string, msg2?: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationMsg2 = msg2;
    this.modalNotificationType = 'warning';
    this.isVisibleModalNotification = true;

  }

  onOpenModalNotificationError(title: string, msg: string, msg2?: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationMsg2 = msg2;
    this.modalNotificationType = 'danger';
    this.isVisibleModalNotification = true;
  }

  //default success
  onOpenModalNotificationSuccess(title: string, msg: string, msg2?: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationMsg2 = msg2;
    this.modalNotificationType = 'success';
    this.isVisibleModalNotification = true;
  }

  onCloseModalNotification() {
    this.isVisibleModalNotification = false;
    this.onCloseModalAcusacion();
    this.onCloseModalSobreseimiento();
    this.buscarFiltroKeyUp()
  }

  onCloseModalNotificationBtn() {
    this.onCloseModalNotification();
    /**this.isVisibleModalNotification = false;
    this.onCloseModalAcusacion();
    this.onCloseModalSobreseimiento();
    this.buscarFiltroKeyUp()**/
  }

  openModalUpdateAcusacionForm() {
    this.isVisibleModalAcusacionNewForm = true;
    this.cleanFormAcusacion();
    this.isEditAcusacionForm = true;
    this.acusacionObjForm = { ...this.acusacionTRowSelected }
    this.setDataAcusacionForm(this.acusacionObjForm)
  }

  /**
  // cancelarUpdFormAcusacionBtn() {
  //   this.onCloseModalAcusacion();
  // }**/

  async updFormAcusacionBtn() {
    if (this.formGroupAcusacion.valid) {
      const request: ActualizarAcusacionReq = {
        ...this.formGroupAcusacion.value,
        coVUsModificacion: '40131447'
      }

      try {
        this.spinner.show();
        const actualizarAcusacionRes: ActualizarAcusacionRes = await this.contenidoEtapaIntermediaService.actualizarAcusacion(request);

        if (actualizarAcusacionRes.PO_V_ERR_COD == '0') {
          this.onOpenModalNotificationSuccess(
            `Contenido obligatorio de Acusación modificado`,
            `Se modificaron los datos del Contenido Obligatorio:`,
            `${this.formGroupAcusacion.get('nuVArticulo').value} ${this.formGroupAcusacion.get('noVArticulo').value}`
          );
        } else {
          this.messageService.add({ severity: 'error', summary: 'Rejected', detail: actualizarAcusacionRes.PO_V_ERR_MSG });
        }

      } catch (err) {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: "Ocurrió un error, intente otra vez." });
      } finally {
        this.spinner.hide();
      }
    } else {
      this.marcarCamposComoTocados(this.formGroupAcusacion);
    }

  }

  //SOBRESEIMIENTO
  openModalNewSobreseimientoForm() {

    this.isVisibleModalSobreseimientoNewForm = true;
    this.cleanFormSobreseimiento();
    this.isEditSobreseimientoForm = false;
  }

  cleanFormSobreseimiento() {
    this.formGroupSobreseimiento.reset();
  }

  onCloseModalSobreseimiento() {
    this.isVisibleModalSobreseimientoNewForm = false;
  }

  initSobreseimientoForm() {
    this.sobreseimientoObjForm = Object.create(null)
    this.setDataSobreseimientoForm(this.sobreseimientoObjForm)
  }

  setDataSobreseimientoForm(sobreseimientoObjForm: SobreseimientoObjForm) {
    this.formGroupSobreseimiento = this.formBuilder.group({
      idNGestionarContenido: new FormControl(sobreseimientoObjForm.idNGestionarContenido),
      noVArticulo: new FormControl(sobreseimientoObjForm.noVArticulo, [
        Validators.required,
        //Validators.pattern(/^([a-zA-Z0-9 ])*$/),
        //Validators.minLength(3),
        Validators.maxLength(500),
      ]),
    });
  }

  openModalUpdSobreseimientoForm() {
    this.isVisibleModalSobreseimientoNewForm = true;
    this.cleanFormSobreseimiento();
    this.isEditSobreseimientoForm = true;
    this.sobreseimientoObjForm = { ...this.sobreseimientoTRowSelected }
    this.setDataSobreseimientoForm(this.sobreseimientoObjForm)
  }

  async addFormSobreseimientoBtn() {
    if (this.formGroupSobreseimiento.valid) {
      const request: AgregarSobreseimientoReq = {
        ...this.formGroupSobreseimiento.value,
        coVUsCreacion: '40131447'
      }
      const agregarSobreseimientoRes: AgregarSobreseimientoRes = await this.contenidoEtapaIntermediaService.agregarSobreseimiento(request);
      if (agregarSobreseimientoRes.PO_V_ERR_COD == '0') {
        this.onOpenModalNotificationSuccess(
          `Procedencia de Sobreseimiento registrada`,
          `Se guardó exitosamente Procede por:`,
          `${this.formGroupSobreseimiento.get('noVArticulo').value}`
        );
      } else {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: agregarSobreseimientoRes.PO_V_ERR_MSG });
      }
    } else {
      this.marcarCamposComoTocados(this.formGroupSobreseimiento);
    }
  }

  async updFormSobreseimientoBtn() {
    if (this.formGroupSobreseimiento.valid) {
      const request: ActualizarSobreseimientoReq = {
        ...this.formGroupSobreseimiento.value,
        coVUsModificacion: '40131447'
      }

      try {
        this.spinner.show();
        const actualizarSobreseimientoRes: ActualizarSobreseimientoRes = await this.contenidoEtapaIntermediaService.actualizarSobreseimiento(request);

        if (actualizarSobreseimientoRes.PO_V_ERR_COD == '0') {
          this.onOpenModalNotificationSuccess(
            `Procedencia de Sobreseimiento modificada`,
            `Se modificaron los datos de Procede por:`,
            `${this.formGroupSobreseimiento.get('noVArticulo').value}`
          );
        } else {
          this.messageService.add({ severity: 'error', summary: 'Rejected', detail: actualizarSobreseimientoRes.PO_V_ERR_MSG });
        }

      } catch (err) {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: "Ocurrió un error, intente otra vez." });
      } finally {
        this.spinner.hide();
      }
    } else {
      this.marcarCamposComoTocados(this.formGroupSobreseimiento);
    }
  }

  async deleteAcusacionForm() {
    let msgEliminar: string;
    msgEliminar = `¿Está seguro de eliminar el registro?`
    this.confirmationService.confirm({
      message: `${msgEliminar}`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        await this._deleteAcusacionForm();
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            break;
          case ConfirmEventType.CANCEL:
            break;
        }
      }
    });

  }

  async _deleteAcusacionForm() {

    const request: EliminarAcusacionReq = {
      idNGestionarContenido: this.acusacionTRowSelected.idNGestionarContenido,
      coVUsModificacion: '40131447'
    }

    try {
      this.spinner.show();
      const eliminarAcusacionRes: EliminarAcusacionRes = await this.contenidoEtapaIntermediaService.eliminarAcusacion(request);

      if (eliminarAcusacionRes.PO_V_ERR_COD == '0') {
        this.onOpenModalNotificationSuccess(
          `Contenido obligatorio de Acusación eliminado`,
          `Se eliminó correctamente el contenido obligatorio:`,
          `${this.acusacionTRowSelected.nuVArticulo} ${this.acusacionTRowSelected.noVArticulo}`
        );
      } else {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: eliminarAcusacionRes.PO_V_ERR_MSG });
      }

    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Rejected', detail: "Ocurrió un error, intente otra vez." });
    } finally {
      this.spinner.hide();
    }
  }

  async deleteSobreseimientoForm() {
    let msgEliminar: string;
    msgEliminar = `¿Está seguro de eliminar el registro?`
    this.confirmationService.confirm({
      message: `${msgEliminar}`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        await this._deleteSobreseimientoForm();
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            break;
          case ConfirmEventType.CANCEL:
            break;
        }
      }
    });
  }

  async _deleteSobreseimientoForm() {
    const request: EliminarSobreseimientoReq = {
      idNGestionarContenido: this.sobreseimientoTRowSelected.idNGestionarContenido,
      coVUsModificacion: '40131447'
    }

    try {
      this.spinner.show();
      const eliminarSobreseimientoRes: EliminarSobreseimientoRes = await this.contenidoEtapaIntermediaService.eliminarSobreseimiento(request);

      if (eliminarSobreseimientoRes.PO_V_ERR_COD == '0') {
        this.onOpenModalNotificationSuccess(
          `Procedencia de Sobreseimiento eliminada`,
          `Se eliminó correctamente Procede por:`,
          `${this.sobreseimientoTRowSelected.noVArticulo}`
        );
      } else {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: eliminarSobreseimientoRes.PO_V_ERR_MSG });
      }

    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Rejected', detail: "Ocurrió un error, intente otra vez." });
    } finally {
      this.spinner.hide();
    }
  }

  protected readonly obtenerIcono = obtenerIcono;
}

