import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { JerarquiaDTOB } from '@interfaces/administrar-dependencia/administrar-dependencia';
import { SedeDTOB } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import {
  BuscarFiscaliaConfigReqFiltro,
  BuscarFiscaliaConfigReqWrap,
  BuscarFiscaliaConfigResRow,
  BuscarFiscaliaConfigResWrap,
  FiscaliaConfigForm,
  FiscaliaPorDFDTO,
  FiscaliaPadreTableRow,
  GetFiscaliasXCustomParamsReq,
  GetFiscaliaXCoEntidadBasicRes,
  AgregarFiscaliaPadreReq,
  AgregarFiscaliaPadreRes,
  EliminarFiscaliaPadreReq,
  ActualizarFiscaliaPadreReq,
} from '@interfaces/configurarMasDeUnaFiscalia/ConfigurarMasDeUnaFiscalia';
import {
  ConfigPage,
  DistritoFiscalDTOB,
  EspecialidadDTOB,
  TipoEspecialidadDTOB,
} from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import { AdministrarDependenciaService } from '@services/administrar-dependencia/administrar-dependencia.service';
import { ConfigurarMasDeUnaFiscaliaService } from '@services/configurarMasDeUnaFiscalia/configurar-mas-de-una-fiscalia.service';
import { PlazoDocObsService } from '@services/plazo-doc-obs/plazo-doc-obs.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  MessageService,
  ConfirmationService,
  MenuItem,
  LazyLoadEvent,
} from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import {AlertModalComponent} from "@components/alert-modal/alert-modal.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {Auth2Service} from "@services/auth/auth2.service";
import {finalize} from "rxjs";

@Component({
  selector: 'app-configurar-mas-de-una-fiscalia',
  standalone: true,
  templateUrl: './configurar-mas-de-una-fiscalia.component.html',
  styleUrls: ['./configurar-mas-de-una-fiscalia.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    MenuModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    CommonModule,
    CmpLibModule,
  ],
  providers: [MessageService, ConfirmationService,DialogService ],
})
export class ConfigurarMasDeUnaFiscaliaComponent {
  formFiltroBuscar: FormGroup;

  distritoFiscalLst: DistritoFiscalDTOB[] = [];

  //listado de sedes por Distrito Fiscal
  sedeXDFLst: SedeDTOB[] = [];

  fiscaliaXDFLst: FiscaliaPorDFDTO[] = [];

  buscarFiscaliaConfigReqFiltro: BuscarFiscaliaConfigReqFiltro;
  //buscarFiscaliaConfigRes:BuscarFiscaliaConfigResWrap={registros:[],totalPaginas:0,totalElementos:0};
  buscarFiscaliaConfigRes: BuscarFiscaliaConfigResWrap;
  //items
  fiscaliaLst: BuscarFiscaliaConfigResRow[] = [];
  fiscaliaLstTotal: number = 0;

  //permite evitar la búsqueda cuando se carga la tabla por primera vez.
  //la primera vez no debe ejecutarse debido a que el usuario no ha enviado los parámetros de búsqueda
  onLazyLoadActivo: boolean = false;

  //item selecionado
  fiscaliaSelected: BuscarFiscaliaConfigResRow;

  //variables para items
  actionItems: MenuItem[];

  //tabla con carga lazy load
  loading: boolean;

  // configPage: ConfigPage;

  configPage: ConfigPage = {
    pages: 1, // Página inicial
    perPage: 10, // Registros por página
  };

  //NUEVO REGISTRO
  isVisibleModalNewForm: boolean = false;
  //formulario para los campos de nuevo registro y edicion
  formGroup: FormGroup;
  //flag para actualizar true para editar y false para nuevo registro
  isEditForm: boolean = false;
  //bean para cargar los datos del formulario de registro y edicion
  fiscaliaConfigForm: FiscaliaConfigForm;

  //listado de todas las sedes
  //sedeLst: SedeDTOB[] = [];

  //listado de sedes por Distrito Fiscal
  sedeXDFLstForm: SedeDTOB[] = [];

  fiscaliaXDFLstForm: FiscaliaPorDFDTO[] = [];
  tipoEspecialidadLst: TipoEspecialidadDTOB[] = [];
  especialidadLst: EspecialidadDTOB[] = [];
  jerarquiaLst: JerarquiaDTOB[] = [];

  //para select de fiscalias padre
  fiscaliaPadreLst: FiscaliaPorDFDTO[] = [];

  //para tabla de fiscalias padre
  fiscaliasPadreTable: FiscaliaPadreTableRow[] = [];

  //Datos para modal notificaciones
  isVisibleModalNotification: boolean;
  modalNotificationTitle: string;
  modalNotificationMsg: string;
  modalNotificationType: string = 'success'; //success, danger, warning,

  //EDICION
  isVisibleModalEditForm: boolean = false;
  //dato de la fiscalia
  fiscaliaEditBasic: GetFiscaliaXCoEntidadBasicRes;
  //listado de la tabla
  fiscaliaPadreLstForEdit: FiscaliaPadreTableRow[] = [];
  //item seleccionado de la tabla
  fiscaliaPadreSelectItem: FiscaliaPadreTableRow;

  //listaFiscaliasPadresXJerarquia:FiscaliaPorDFDTO[]=[];
  //para select de fiscalias padre en edicion
  fiscaliaPadreSelectEdit: FiscaliaPorDFDTO[] = [];

  formGroupEdit: FormGroup;

  //clona items para editarlos directamente en la tabla
  clonedItems: { [s: string]: FiscaliaPadreTableRow } = {};

  //editingRowIndex: number | null = null;

  //NUEVO REGISTRO EN ROW. Nuevo registro desde "TD de una tabla"
  formGroupNewOnRow: FormGroup;
  idVisibleFormGroupNewOnRow: boolean = false;

  protected readonly obtenerIcono = obtenerIcono;

  //usuario session
  public usuarioSesion;

  //dinamic dialog for confirm:
  protected refModal: DynamicDialogRef;

  constructor(
    private readonly spinner: NgxSpinnerService,
    //private agregarDependenciaUsService: AgregarDependenciaUsService,
    private readonly administrarDependenciaService: AdministrarDependenciaService,
    private readonly plazoDocObsService: PlazoDocObsService,
    private readonly configurarMasDeUnaFiscaliaService: ConfigurarMasDeUnaFiscaliaService,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private readonly userService: Auth2Service,
  ) {}

  ngOnInit() {
    this.getDistritoFiscalLst();
    this.limpiarFiltrosBusqueda();

    //configuracion de paginas
    this.configPage = {
      pages: 1, //pagina_i
      perPage: 10, //número de páginas
    };

    this.actionItems = [
      {
        label: 'Editar',
        //icon: 'pi pi-trash',
        command: () => {
          this.editFiscaliasPadre(this.fiscaliaSelected);
        },
      },
    ];

    this.loading = false;

    //inicializa formulario
    this.cleanForm();

    //inicializacion de objeto
    this.fiscaliaEditBasic = Object.create(null);

    //inicializacion de formulario de edicion de fiscalia padre
    this.formGroupEdit = this.formBuilder.group({
      coVEntidadPadre: new FormControl(null),
    });

    this.formGroupNewOnRow = this.formBuilder.group({
      coVEntidad: new FormControl(null),
    });

    this.getBuscarFiscaliasFiltroForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }


  limpiarFiltrosBusqueda() {
    this.formFiltroBuscar = this.formBuilder.group({
      idNDistritoFiscal: new FormControl(null),
      coVSede: new FormControl({ value: null, disabled: true }),
      coVEntidad: new FormControl(null),
      coVEntidadTxt: new FormControl(null), //del input
    });

    //desabilitar coVSede
    this.formFiltroBuscar.get('coVSede').disable();

    //desabilitar coVSede
    this.formFiltroBuscar.get('coVEntidad').disable();

    this.configPage.pages = 1; // Resetear a la primera página
    this.onLazyLoadActivo = true;
    this._getBuscarFiscaliasFiltro();
  }

  //ejecución de los resultados de busqueda
  getBuscarFiscaliasFiltroForm() {
    //configurando page cuyos valores son (0,10,20,30,... deben ser convertidos a 1,2,3,...)
    this.configPage.pages = 1;

    this._getBuscarFiscaliasFiltro();

    //activamos luego de los resultados de busqueda para que permita la paginación
    this.onLazyLoadActivo = true;
  }

  //ejecuta onLazyLoad. la primera vez no debe ejecutarse porque no hay parámetros de búsqueda
  getBuscarFiscaliasFiltroPagination(event: LazyLoadEvent) {
    if (this.onLazyLoadActivo) {
      this.configPage.pages = event.first / 10 + 1;

      this._getBuscarFiscaliasFiltro();
    }
  }

  //ejecución de los resultados de busqueda
  _getBuscarFiscaliasFiltro() {
    this.spinner.show();
    const filtros: BuscarFiscaliaConfigReqFiltro = {
      ...this.formFiltroBuscar.value,
      coVEntidadTxt: this.formFiltroBuscar.value.coVEntidadTxt,
      //idNDistritoFiscal: this.formFiltroBuscar.value.idNDistritoFiscal || null,
      //coSede: this.formFiltroBuscar.value.coVSede || null,
      //coEntidad: this.formFiltroBuscar.value.coVEntidad || null,
      //coVEntidadTxt: this.formFiltroBuscar.value.coVEntidadTxt || null,
    };
    console.log("filtros:",filtros)
    const buscarFiscaliaConfigReqWrap: BuscarFiscaliaConfigReqWrap = {
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: filtros,
    };

    this.configurarMasDeUnaFiscaliaService
      .buscarFiscaliaConfig(buscarFiscaliaConfigReqWrap)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.buscarFiscaliaConfigRes = response;
          this.fiscaliaLst = this.buscarFiscaliaConfigRes.registros.sort(
            (a, b) => a.secuencia - b.secuencia
          );

          this.fiscaliaLstTotal = this.buscarFiscaliaConfigRes.totalElementos;
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
  }

  getDistritoFiscalLst() {
    this.plazoDocObsService.getDistritoFiscalLst().subscribe({
      next: (response) => {
        this.distritoFiscalLst = response.sort((a, b) =>
          a.noVDistritoFiscal.localeCompare(b.noVDistritoFiscal)
        );
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  //para el filtro
  getSedeLstXDFFilter(idNDistritoFiscal: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getSedesXDF(idNDistritoFiscal)
      .subscribe({
        next: (response) => {
          this.sedeXDFLst = response.sort((a, b) =>
            a.noVSede.localeCompare(b.noVSede)
          );
          this.spinner.hide();
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
          this.spinner.hide();
        },
      });
  }

  //para el formulario add or edit
  getSedeLstXDFForm(idNDistritoFiscal: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getSedesXDF(idNDistritoFiscal)
      .subscribe({
        next: (response) => {
          this.sedeXDFLstForm = response.sort((a, b) =>
            a.noVSede.localeCompare(b.noVSede)
          );
          this.spinner.hide();
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
          this.spinner.hide();
        },
      });
  }

  //fiscalias sólo si se selecciona una df en específico
  //para el filtro
  getFiscaliasXDFFilter(idNDistritoFiscal: number) {
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXDF(idNDistritoFiscal)
      .subscribe({
        next: (response) => {
          this.fiscaliaXDFLst = response.sort((a, b) =>
            a.noVEntidad.localeCompare(b.noVEntidad)
          );
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
        },
      });
  }

  //filter
  getFiscaliasXSedeFilter(coVSede: string) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXSede(coVSede)
      .subscribe({
        next: (response) => {
          // Orden alfabético
          this.fiscaliaXDFLst = response.sort((a, b) =>
            a.noVEntidad.localeCompare(b.noVEntidad)
          );
          this.spinner.hide();
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
          this.spinner.hide();
        },
      });
  }

  onChangeDistritoFiscalFilter(idNDistritoFiscal: number) {
    //activamos combo Sede
    this.getSedeLstXDFFilter(idNDistritoFiscal);
    this.formFiltroBuscar.get('coVSede').enable();

    //activamos combo Fiscalia
    this.getFiscaliasXDFFilter(idNDistritoFiscal);
    this.formFiltroBuscar.get('coVEntidad').enable();

    this.getBuscarFiscaliasFiltroForm();
  }

  onChangeBuscar(){
    this.getBuscarFiscaliasFiltroForm();
  }

  itemSelected(activeItem: any) {
    this.fiscaliaSelected = activeItem;
  }

  onChangeSedeFilter(coVSede: string) {
    const idNDistritoFiscal =
      this.formFiltroBuscar.get('idNDistritoFiscal').value;
    if (coVSede) {
      this.getFiscaliasXSedeFilter(coVSede);
    } else if (idNDistritoFiscal) {
      this.getFiscaliasXDFFilter(idNDistritoFiscal);
    }

    this.getBuscarFiscaliasFiltroForm();
  }

  buscarFiscaliaKeyUp() {
    const coVEntidadTxt = this.formFiltroBuscar.get('coVEntidadTxt').value;
    if (coVEntidadTxt.length >= 1 || coVEntidadTxt.length === 0) {
      this.getBuscarFiscaliasFiltroForm();
    }
  }

  exportarExcelForm() {
    if (this.fiscaliaLstTotal <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'No hay resultados encontrados.',
      });
      return;
    }

    //busqueda sólo con Código de Fiscalía en caja de texto
  /***  if (
      !this.formFiltroBuscar.get('coVEntidadTxt').value ||
      (this.formFiltroBuscar.get('coVEntidadTxt').value &&
        this.formFiltroBuscar.get('coVEntidadTxt').value.length < 5)
    ) {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail:
          'Se limpiaron los filtros de búsqueda. Vuelva a realizar la búsqueda,luego proceda a exportar',
      });
      return;
    }***/

    //obtencion de parametros
    const filtros: BuscarFiscaliaConfigReqFiltro = {
      ...this.formFiltroBuscar.value,
    };
    const buscarFiscaliaConfigReqWrap: BuscarFiscaliaConfigReqWrap = {
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: filtros,
    };

    this.configurarMasDeUnaFiscaliaService
      .exportarexcel(buscarFiscaliaConfigReqWrap)
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'FiscalíasConFiscalíasPadre.xlsx';
          anchor.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: '',
            detail: 'Error al consultar datos.',
          });
        },
      });
  }

  openModalFormNew() {
    this.cleanForm();

    this.formGroup.get('coVSede').disable();
    this.formGroup.get('idNTipoEspecialidad').disable();
    this.formGroup.get('idVEspecialidad').disable();
    this.formGroup.get('idNJerarquia').disable();
    this.formGroup.get('coVEntidad').disable();
    this.formGroup.get('coVEntidadPadre').disable();

    this.getTipoEspecialidadLst();
    this.getJerarquiaLst();

    this.isVisibleModalNewForm = true;
    this.isEditForm = false;

    //limpiar tabla fiscalias padre
    this.fiscaliasPadreTable = [];

    //ocultar formulario de nuevo registro on row
    this.idVisibleFormGroupNewOnRow = false;
  }

  onCloseModal() {
    this.isVisibleModalNewForm = false;
  }

  cleanForm() {
    this.fiscaliaConfigForm = Object.create(null);
    this.setDataForm(this.fiscaliaConfigForm);
  }

  setDataForm(fiscaliaConfigForm: FiscaliaConfigForm) {
    this.formGroup = this.formBuilder.group({
      idNDistritoFiscal: new FormControl(fiscaliaConfigForm.idNDistritoFiscal, [
        Validators.required,
      ]),
      coVSede: new FormControl(fiscaliaConfigForm.coVSede, [
        Validators.required,
      ]),
      coVEntidad: new FormControl(fiscaliaConfigForm.coVEntidad, [
        Validators.required,
      ]),
      idNTipoEspecialidad: new FormControl(
        fiscaliaConfigForm.idNTipoEspecialidad,
        [Validators.required]
      ),
      idVEspecialidad: new FormControl(fiscaliaConfigForm.idVEspecialidad, [
        Validators.required,
      ]),
      idNJerarquia: new FormControl(fiscaliaConfigForm.idNJerarquia, [
        Validators.required,
      ]),
      coVEntidadPadre: new FormControl(fiscaliaConfigForm.coVEntidadPadre, [
        Validators.required,
      ]),
    });
  }

  cancelarForm() {
    this.onCloseModal();
  }

  onChangeDistritoFiscalForm(idNDistritoFiscal: number) {
    this.formGroup.get('idNTipoEspecialidad').enable();
    this.formGroup.get('idVEspecialidad').enable();
    this.formGroup.get('idNJerarquia').enable();
    this.formGroup.get('coVEntidadPadre').enable();

    //eventos en combo Sede
    this.getSedeLstXDFForm(idNDistritoFiscal);
    this.formGroup.get('coVSede').enable();

    //eventos en combo Fiscalia
    this.formGroup.get('coVEntidad').enable();

    /**this.getFiscaliasXDFForm(idNDistritoFiscal)//cambiado por getFiscaliasXCustomParams**/
    //actualizamos el combo de fiscalia
    this.getFiscaliasXCustomParams();
  }

  onChangeSedeForm() {
    //actualizamos el combo de fiscalia
    this.getFiscaliasXCustomParams();
  }

  onChangeTipoEspecialidad(idNTipoEspecialidad: number) {
    //actualizamos el combo de fiscalia
    this.getFiscaliasXCustomParams();
    this.getEspecialidadLst(idNTipoEspecialidad);
  }

  onChangeEspecialidad() {
    //actualizamos el combo de fiscalia
    this.getFiscaliasXCustomParams();
  }

  onChangeJerarquia(idNJerarquia: number) {
    this.getFiscaliasXJerarquiaMayorGrado(idNJerarquia);

    //actualizamos el combo de fiscalia
    this.getFiscaliasXCustomParams();
  }

  //para el formulario add or edit
  //actualizamos el combo de fiscalia.
  getFiscaliasXDFForm(idNDistritoFiscal: number) {
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXDF(idNDistritoFiscal)
      .subscribe({
        next: (response) => {
          this.fiscaliaXDFLstForm = response;
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
        },
      });
  }

  //para el formulario add or edit
  //actualizamos el combo de fiscalia
  getFiscaliasXCustomParams() {
    const idNDistritoFiscal = this.formGroup.get('idNDistritoFiscal').value;
    const coVSede = this.formGroup.get('coVSede').value;
    const idNTipoEspecialidad = this.formGroup.get('idNTipoEspecialidad').value;
    const idVEspecialidad = this.formGroup.get('idVEspecialidad').value;
    const idNJerarquia = this.formGroup.get('idNJerarquia').value;

    const getFiscaliasXCustomParamsReq: GetFiscaliasXCustomParamsReq = {
      idNDistritoFiscal: idNDistritoFiscal,
      coVSede: coVSede,
      idNTipoEspecialidad: idNTipoEspecialidad,
      idVEspecialidad: idVEspecialidad,
      idNJerarquia: idNJerarquia,
    };

    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXCustomParams(getFiscaliasXCustomParamsReq)
      .subscribe({
        next: (response) => {
          // Orden alfabético
          this.fiscaliaXDFLstForm = response.sort((a, b) =>
            a.noVEntidad.localeCompare(b.noVEntidad)
          );
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
  }

  getEspecialidadLst(idTipoEspecialidad: number) {
    this.plazoDocObsService.getEspecialidadLst(idTipoEspecialidad).subscribe({
      next: (response) => {
        this.especialidadLst = response.sort((a, b) =>
          a.noVEspecialidad.localeCompare(b.noVEspecialidad)
        );
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  getTipoEspecialidadLst() {
    this.plazoDocObsService.getTipoEspecialidadLst().subscribe({
      next: (response) => {
        this.tipoEspecialidadLst = response.sort((a, b) =>
          a.noVTipoEspecialidad.localeCompare(b.noVTipoEspecialidad)
        );
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  getJerarquiaLst() {
    this.administrarDependenciaService.getJerarquiaLst().subscribe({
      next: (response) => {
        this.jerarquiaLst = response.sort((a, b) =>
          a.noVJerarquia.localeCompare(b.noVJerarquia)
        );
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  //fiscalias padre para un select nuevo
  getFiscaliasXJerarquia(idNJerarquia: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXJerarquia(idNJerarquia)
      .subscribe({
        next: (response) => {
          this.fiscaliaPadreLst = response.sort((a, b) =>
            a.noVEntidad.localeCompare(b.noVEntidad)
          );
          this.spinner.hide();
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
          this.spinner.hide();
        },
      });
  }

  //Lista las fiscalias de jerarquía de mayor grado
  getFiscaliasXJerarquiaMayorGrado(idNJerarquia: number) {
    this.getFiscaliasXJerarquia(idNJerarquia + 1);
  }

  onChangeFiscalia(coVEntidad: string) {
    this.getFiscaliasXCoEntidadBasic(coVEntidad);
    this.getFiscaliasPadreForTable(coVEntidad);
  }

  //fiscalias padre para formatear en una tabla
  getFiscaliasPadreForTable(coVEntidad: string) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasPadreForTable(coVEntidad)
      .subscribe({
        next: (response) => {
          this.fiscaliasPadreTable = response;
          this.spinner.hide();
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
          this.spinner.hide();
        },
      });
  }

  //fiscalias padre para un select
  getFiscaliasXCoEntidadBasic(coVEntidad: string) {
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXCoEntidadBasic(coVEntidad)
      .subscribe({
        next: (response) => {
          const getFiscaliaXCoEntidadBasicRes: GetFiscaliaXCoEntidadBasicRes =
            response;
          if (getFiscaliaXCoEntidadBasicRes) {
            if (!getFiscaliaXCoEntidadBasicRes.coVSede) {
              this.messageService.add({
                severity: 'error',
                summary: '',
                detail: 'No se ha encontrado Sede para esta fiscalía',
              });
            }
            if (!getFiscaliaXCoEntidadBasicRes.idNTipoEspecialidad) {
              this.messageService.add({
                severity: 'error',
                summary: '',
                detail:
                  'No se ha encontrado Tipo de Especialidad para esta fiscalía',
              });
            }
            if (!getFiscaliaXCoEntidadBasicRes.idVEspecialidad) {
              this.messageService.add({
                severity: 'error',
                summary: '',
                detail: 'No se ha encontrado Especialidad para esta fiscalía',
              });
            }
            if (!getFiscaliaXCoEntidadBasicRes.idNJerarquia) {
              this.messageService.add({
                severity: 'error',
                summary: '',
                detail: 'No se ha encontrado Jerarquía para esta fiscalía',
              });
            } else {
              //mostra aqui las fiscalias de orden superior a la jerarquía actual
              this.getFiscaliasXJerarquiaMayorGrado(
                getFiscaliaXCoEntidadBasicRes.idNJerarquia
              );
            }
            this.formGroup
              .get('coVSede')
              .setValue(getFiscaliaXCoEntidadBasicRes.coVSede);
            this.formGroup
              .get('idNTipoEspecialidad')
              .setValue(getFiscaliaXCoEntidadBasicRes.idNTipoEspecialidad);
            this.formGroup
              .get('idVEspecialidad')
              .setValue(getFiscaliaXCoEntidadBasicRes.idVEspecialidad);
            this.formGroup
              .get('idNJerarquia')
              .setValue(getFiscaliaXCoEntidadBasicRes.idNJerarquia);
            this.formGroup
              .get('coVSede')
              .setValue(getFiscaliaXCoEntidadBasicRes.coVSede);
          }
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
          this.spinner.hide();
        },
      });
  }

  async addForm() {
    if (this.formGroup.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: '',
        detail: 'Campos sin completar o inválidos',
      });
      return;
    }

    const request: AgregarFiscaliaPadreReq = {
      coVEntidadHijo: this.formGroup.get('coVEntidad').value,
      coVEntidadPadre: this.formGroup.get('coVEntidadPadre').value,
      coVUsCreacion: this.usuarioSesion?.usuario.usuario,
    };

    try {
      this.spinner.show();
      const response: AgregarFiscaliaPadreRes =
        await this.configurarMasDeUnaFiscaliaService.agregarFiscaliaPadre(
          request
        );
      if (response.PO_V_ERR_COD == '0') {
        this.onOpenModalNotificationSuccess(
          `Fiscalía padre registrada`,
          `Se guardó la fiscalía padre correctamente`
        );
      } else if (response.PO_V_ERR_COD == '-2') {//duplicado
        this.onOpenModalNotification2('error', 'Registro duplicado','La fiscalía padre ya está registrada');
      }
      else {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: response.PO_V_ERR_MSG,
        });
      }
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Rejected',
        detail: 'Error en el proceso.',
      });
    } finally {
      this.spinner.hide();
    }
  }

  onOpenModalNotificationWarning(title: string, msg: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationType = 'warning';
    this.isVisibleModalNotification = true;
  }

  onOpenModalNotificationError(title: string, msg: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationType = 'danger';
    this.isVisibleModalNotification = true;
  }

  //default success
  onOpenModalNotificationSuccess(title: string, msg: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationType = 'success';
    this.isVisibleModalNotification = true;
  }

  onCloseModalNotification() {
    this.isVisibleModalNotification = false;
    this.onCloseModal();
  }

  openModalFormEdit() {
    this.isVisibleModalEditForm = true;
  }

  onCloseEditFormModal() {
    this.isVisibleModalEditForm = false;

    //al cerrar el modal, actualiza la fiscalía
    this.getBuscarFiscaliasFiltroForm();
  }

  verMasSobreFiscaliasPadre(fiscaliaSelected: BuscarFiscaliaConfigResRow) {
    this.itemSelected(fiscaliaSelected);
    this.editFiscaliasPadre(fiscaliaSelected);
  }

  editFiscaliasPadre(fiscaliaSelected: BuscarFiscaliaConfigResRow) {
    this.openModalFormEdit();
    this.getFiscaliasXCoEntidadForEdit(fiscaliaSelected.coVEntidad);
    this.getFiscaliasPadreForTableEdit(fiscaliaSelected.coVEntidad);

    //para listar el select de la fiscalia padre en edicion
    this.getFiscaliasXJerarquiaEdit(this.fiscaliaSelected.idNJerarquia + 1);
  }

  //fiscalias padre para un select
  getFiscaliasXCoEntidadForEdit(coVEntidad: string) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXCoEntidadBasic(coVEntidad)
      .subscribe({
        next: (response) => {
          this.fiscaliaEditBasic = response;
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
  }

  //fiscalias padre para formatear en una tabla de edición
  getFiscaliasPadreForTableEdit(coVEntidad: string) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasPadreForTable(coVEntidad)
      .subscribe({
        next: (response) => {
          this.fiscaliaPadreLstForEdit = response;
          this.spinner.hide();
        },
        error: (err) => {
          console.error('error al leer datos del servidor. ', err);
          this.spinner.hide();
        },
      });
  }

  //fiscalias padre para un select
  getFiscaliasXJerarquiaEdit(idNJerarquia: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService
      .getFiscaliasXJerarquia(idNJerarquia)
      .subscribe({
        next: (response) => {
          this.fiscaliaPadreSelectEdit = response;
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
        },
      });
  }

  onRowEditInit(item: FiscaliaPadreTableRow, index: number) {
    console.log("item:", item);
    this.formGroupEdit.get('coVEntidadPadre').setValue(item.coVEntidadPadre);
  }

  async onRowEditSave(item: FiscaliaPadreTableRow, index: number) {
    if (this.formGroupEdit.valid) {
      try {
        await this.spinner.show();
        const request:ActualizarFiscaliaPadreReq={
          ...item,
          coVUsModificacion: this.usuarioSesion?.usuario.usuario,
        };
        console.log("request:",request)
        const response= await this.configurarMasDeUnaFiscaliaService.actualizarFiscaliaPadre(request);
        console.log("response:",response)

        //actualizamos la tabla
        this.getFiscaliasPadreForTableEdit(this.fiscaliaSelected.coVEntidad);
      } catch (err) {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'Error en el proceso.',
        });
      } finally {
        this.spinner.hide();
      }
    }
  }

  onRowDelete(item: FiscaliaPadreTableRow, index: number) {
    const request: EliminarFiscaliaPadreReq = {
      idVRelacionEntidad: item.idVRelacionEntidad,
      coVUsDesactivacion: this.usuarioSesion?.usuario.usuario,
    };

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Eliminar Fiscalía padre',
        confirm: true,
        description:
          `A continuación, se procederá a eliminar la fiscalía padre. ¿Esta seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });

    this.refModal.onClose.subscribe({
      next: async (respAlert) => {
        if (respAlert === 'confirm') {
          await this.spinner.show();
          const response = await this.configurarMasDeUnaFiscaliaService.eliminarFiscaliaPadre(request);
          await this.spinner.hide();
          if (response.PO_V_ERR_COD == '0') {
            this.refModal = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'success',
                title: 'Fiscalía padre eliminada',
                description: 'Fiscalía padre eliminada correctamente',
                confirmButtonText: 'Listo',
              },
            });

            this.refModal.onClose
              .pipe(finalize(() => { this.spinner.hide(); }))
              .subscribe({
                next: (resp) => {
                  if (resp === 'confirm') {
                    //actualizamos la tabla
                    this.getFiscaliasPadreForTableEdit(this.fiscaliaSelected.coVEntidad);
                  }
                },
                error: (err) => {
                  throw new Error('Error al eliminar registro');
                },
              });
          } else {
            console.error("Error al crear fiscalía padre")
          }

        }
      },
    });

    /***let msgEliminar: string;
    msgEliminar = `¿Está seguro de eliminar el registro?`;

    this.confirmationService.confirm({
      message: `${msgEliminar}`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        const response: EliminarFiscaliaPadreRes =
          await this.configurarMasDeUnaFiscaliaService.eliminarFiscaliaPadre(
            request
          );

        if (response.PO_V_ERR_COD == '0') {
          this.onOpenModalNotificationSuccess(
            `Registro eliminado`,
            `Se eliminó la fiscalía padre correctamente.`
          );

          //actualizamos la tabla
          this.getFiscaliasPadreForTableEdit(this.fiscaliaSelected.coVEntidad);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Rejected',
            detail: response.PO_V_ERR_MSG,
          });
        }
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            break;
          case ConfirmEventType.CANCEL:
            break;
        }
      },
    });***/
  }

  /*onRowDelete(item: FiscaliaPadreTableRow, index: number) {
    const request: EliminarFiscaliaPadreReq = {
      idVRelacionEntidad: item.idVRelacionEntidad,
      coVUsDesactivacion: this.usuarioSesion?.usuario.usuario,
    };

    let msgEliminar: string;
    msgEliminar = `¿Está seguro de eliminar el registro?`;

    this.confirmationService.confirm({
      message: `${msgEliminar}`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        const response: EliminarFiscaliaPadreRes =
          await this.configurarMasDeUnaFiscaliaService.eliminarFiscaliaPadre(
            request
          );

        if (response.PO_V_ERR_COD == '0') {
          this.onOpenModalNotificationSuccess(
            `Registro eliminado`,
            `Se eliminó la fiscalía padre correctamente.`
          );

          //actualizamos la tabla
          this.getFiscaliasPadreForTableEdit(this.fiscaliaSelected.coVEntidad);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Rejected',
            detail: response.PO_V_ERR_MSG,
          });
        }
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            break;
          case ConfirmEventType.CANCEL:
            break;
        }
      },
    });
  }*/

  agregarFiscaliaPadreInner(fiscaliaEditBasic: GetFiscaliaXCoEntidadBasicRes) {
    this.idVisibleFormGroupNewOnRow = true;

    //siempre asegurarse que this.fiscaliaPadreSelectEdit exista
    //this.formGroupNewOnRow.get('coVEntidad').setValue(fiscaliaEditBasic.coVEntidad);
  }

  async onRowAddFiscaliaPadreConfirm() {
    const coVEntidadHijo= this.fiscaliaSelected.coVEntidad;
    const coVEntidadPadre= this.formGroupNewOnRow.value.coVEntidad;
    const request: AgregarFiscaliaPadreReq = {
      coVEntidadHijo: coVEntidadHijo,
      coVEntidadPadre: coVEntidadPadre,
      coVUsCreacion: this.usuarioSesion?.usuario.usuario,
    };

    if (coVEntidadPadre === null) {
      this.onOpenModalNotification2('warning', 'Información','Seleccione una fiscalía padre');
      /***this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'warning',
          title: 'Información',
          description: 'Seleccione una fiscalía padre',
          confirmButtonText: 'Aceptar',
        },
      });***/
      return;
    }
    else if (coVEntidadHijo === coVEntidadPadre) {
      this.onOpenModalNotification2('warning', 'Información','Una fiscalía no puede ser padre de sí misma');
      /***this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'warning',
          title: 'Información',
          description: 'Una fiscalía no puede ser padre de sí misma',
          confirmButtonText: 'Aceptar',
        },
      });***/
      return;
    }

    try {
      this.spinner.show();
      const response: AgregarFiscaliaPadreRes =
        await this.configurarMasDeUnaFiscaliaService.agregarFiscaliaPadre(
          request
        );
      if (response.PO_V_ERR_COD == '0') {

        this.onOpenModalNotification2('success', 'Fiscalía Padre Adicionada','Se guardó la fiscalía padre correctamente');

        this.refModal.onClose.subscribe({
          next: resp => {
            if (resp === 'confirm') {
              //actualizamos la tabla de fiscalias padre
              this.getFiscaliasPadreForTableEdit(this.fiscaliaSelected.coVEntidad);
            }
          }
        });

        /***this.onOpenModalNotificationSuccess(
          `Fiscalía Padre Adicionada`,
          `Se guardó la fiscalía padre correctamente`
        );

        //ocultamos formulario de agregar fiscalia on row
        this.idVisibleFormGroupNewOnRow = false;

        //actualizamos la tabla de fiscalias padre
        this.getFiscaliasPadreForTableEdit(this.fiscaliaSelected.coVEntidad);***/
      } else if (response.PO_V_ERR_COD == '-2') {//duplicado
        this.onOpenModalNotification2('error', 'Registro duplicado','La fiscalía padre ya está registrada');

      }
      else {
        this.onOpenModalNotification2('error', 'Error',response.PO_V_ERR_MSG);
        /***this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: response.PO_V_ERR_MSG,
        });***/
      }
    } catch (err) {
      /***this.messageService.add({
        severity: 'error',
        summary: 'Rejected',
        detail: 'Error en el proceso.',
      });***/
      this.onOpenModalNotification2('error', 'Error','Error en el proceso.');
    } finally {
      this.spinner.hide();
    }
  }

  onRowAddFiscaliaPadreCancel() {
    this.idVisibleFormGroupNewOnRow = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }


  /***
   algunos requieren el close otros no
   this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.refreshAlgo();
        }
      }
   });
   ***/
  private onOpenModalNotification2(icon: string, title: string, description: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
        confirmButtonText: 'Listo',
      },
    });
  }

}
