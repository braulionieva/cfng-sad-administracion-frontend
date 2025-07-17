import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuscarDependenciaReq, BuscarDependenciaReqFiltro, BuscarDependenciaRes, BuscarDependenciaResRow, EntidadForm, EspecialidadDTOB, JerarquiaDTOB } from '@interfaces/administrar-dependencia/administrar-dependencia';
import { DependenciaDTOB, SedeDTOB } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { AdministrarDependenciaService } from '@services/administrar-dependencia/administrar-dependencia.service';
import { AgregarDependenciaUsService } from '@services/agregar-dependencia-us/agregar-dependencia-us.service';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { NgxSpinnerService } from "ngx-spinner";
import {
  ConfigurarMasDeUnaFiscaliaService
} from "@services/configurarMasDeUnaFiscalia/configurar-mas-de-una-fiscalia.service";
import { Auth2Service } from "@services/auth/auth2.service";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { ConfigPage, DistritoFiscalDTOB, TipoEspecialidadDTOB } from "@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes";
import { PlazoDocObsService } from "@services/plazo-doc-obs/plazo-doc-obs.service";
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";
import { ModalNotificationService } from "@services/modal-notification/modal-notification.service";
import { FormGettersFiscalias } from "@modulos/maestros/fiscalias/FormGettersFiscalias";
import { RadioButtonModule } from "primeng/radiobutton";
import { debounceTime } from "rxjs/operators";
import { patron } from "@constants/constantes";
import { isEqual } from 'lodash';
import { filterNumbersInput, validOnlyNumbers, filterNumbersPaste, filterNumbersKeypress } from "@utils/utils";

@Component({
  selector: 'app-administrar-dependencia',
  standalone: true,
  templateUrl: './administrar-dependencia.component.html',
  styleUrls: ['./administrar-dependencia.component.scss'],
  imports: [
    TableModule,
    ToastModule, DialogModule, ConfirmDialogModule,
    MenuModule, NgIf,
    CalendarModule,
    DialogModule, FormsModule, ReactiveFormsModule, InputTextModule,
    DropdownModule, InputNumberModule, CommonModule, CmpLibModule, RadioButtonModule
  ],
  providers: [MessageService, ConfirmationService, DialogService, ModalNotificationService]
})

export class AdministrarDependenciaComponent {
  //formulario para el filtro de busqueda
  formFiltroBuscar: FormGroup;
  indiceActivo: number = 1;
  showMoreFiltro: boolean;
  //configuración
  configPage: ConfigPage;
  exportarExcelDisabled: boolean = true;

  distritoFiscalLstFilter: DistritoFiscalDTOB[] = [];
  sedeLstFilter: SedeDTOB[] = [];
  jerarquiaLstFilter: JerarquiaDTOB[] = [];
  tipoEspecialidadLstFilter: TipoEspecialidadDTOB[] = [];
  especialidadLstFilter: EspecialidadDTOB[] = [];

  buscarDependenciaReq: BuscarDependenciaReq;
  buscarDependenciaRes: BuscarDependenciaRes;
  buscarDependenciaResLst: BuscarDependenciaResRow[];
  buscarDependenciaResLstTotal: number = 0;
  dependenciaSeleted: BuscarDependenciaResRow;

  distritoFiscalLst: DistritoFiscalDTOB[] = [];
  sedeLst: SedeDTOB[] = [];
  jerarquiaLst: JerarquiaDTOB[] = [];
  tipoEspecialidadLst: TipoEspecialidadDTOB[] = [];
  especialidadLst: EspecialidadDTOB[] = [];

  //variables para items
  actionItems: MenuItem[];

  //paginacion
  first = 0;
  @Output() firstChange: EventEmitter<number> = new EventEmitter();

  //VARIABLES PARA MODAL DEL NUEVO REGISTRO
  //visibilidad del modal para nuevo registro
  isVisibleModalNewForm: boolean;

  //flag para actualizar
  isEditForm: boolean = false;

  //formulario agregar o editar:
  formGroupDependencia: FormGroup

  //para validar cambios en los datos del formulario
  formGroupInicial: FormGroup;

  formGetters: FormGettersFiscalias;

  dependenciaForm: EntidadForm;

  dependenciaPadreLst: DependenciaDTOB[] = [];
  flCCorporativaLst: any[] = [
    { name: 'Si', key: '1' },
    { name: 'No', key: '0' },
  ]

  //permite evitar la búsqueda cuando se carga la tabla por primera vez.
  //la primera vez no debe ejecutarse debido a que el usuario no ha enviado los parámetros de búsqueda
  onLazyLoadActivo: boolean = false;

  //dinamic dialog for confirm:
  public refModal: DynamicDialogRef;

  //usuario session
  public usuarioSesion;

  // Mensajes de error
  errorMessages = {
    coVEntidad: {
      required: 'El código es requerido.',
      maxlength: 'El código no puede exceder 10 caracteres.',
      pattern: 'Debe contener solo números.'
    },
    noVEntidad: {
      required: 'El nombre de la fiscalía es requerido.',
      maxlength: 'El nombre no puede exceder 100 caracteres.',
      pattern: 'Debe contener solo letras, números, guiones, el símbolo de grado (°) y no puede tener espacios consecutivos.'
    },
    flCCorporativa: {
      required: 'Debe seleccionar si es fiscalía corporativa.'
    },
    idNDistritoFiscal: {
      required: 'El Distrito Fiscal es requerido.'
    },
    coVSede: {
      required: 'La sede es requerida.'
    },
    idNJerarquia: {
      required: 'La jerarquía es requerida.'
    },
    idNTipoEspecialidad: {
      required: 'El tipo de especialidad es requerido.'
    },
    idVEspecialidad: {
      required: 'La especialidad es requerida.'
    },
    deVAcronimo: {
      required: 'El acrónimo es requerido.',
      maxlength: 'El acrónimo no puede exceder 20 caracteres.',
      pattern: 'Debe contener solo letras, números, guiones (-) y el símbolo de grado (°).'
    },
  };

  constructor(
    private readonly spinner: NgxSpinnerService,
    private readonly formBuilder: FormBuilder,
    private readonly agregarDependenciaUsService: AgregarDependenciaUsService,
    private readonly administrarDependenciaService: AdministrarDependenciaService,
    private readonly messageService: MessageService,
    private readonly configurarMasDeUnaFiscaliaService: ConfigurarMasDeUnaFiscaliaService,
    public readonly dialogService: DialogService,
    private readonly userService: Auth2Service,
    private readonly plazoDocObsService: PlazoDocObsService,
    private readonly modalNotificationService: ModalNotificationService
  ) {
    //this.initForm()
  }

  ngOnInit() {

    this.actionItems = [

      {
        label: 'Editar',
        //icon: 'pi pi-trash',
        command: () => {
          this.editDependenciaBtn(this.dependenciaSeleted)
        }
      },
    ];
    this.initForm()
    this.initConfigPage()
    this.initFormFiltroBuscar()
    //datos para busqueda
    /**
    //this.getDistritoFiscalLstFilter();
    //this.getJerarquiaLstFilter();**/
    this.getEspecialidadLstFilter();
    this.getTipoEspecialidadLstSearch();

    //datos para formulario
    /**this.getDistritoFiscalLst();**/
    this.getTipoEspecialidadLst();

    /**this.getJerarquiaLst();**/

    //para busqueda y formulario:
    this.getDistritoFiscalLstFilterAndForm();
    this.getJerarquiaLstFilterAndForm();//en reemplazo de getJerarquiaLst() y getJerarquiaLstFilter()

    /**this.buscarDependenciaFormFiltro();**/
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);

    //buscamos y mostramos resultados de búsqueda
    this.buscarDependenciaFormFiltro();

    //activamos busqueda al change values
    this.buscarDependenciaChangeValues();
  }

  initConfigPage() {
    //configuracion de paginas
    this.configPage = {
      pages: 1,//pagina_i
      perPage: 10//número de páginas
    };
  }

  public onClearFiltersAndSearch(): void {
    this.first = 0;
    this.initConfigPage();
    this.formFiltroBuscar.reset();
    this.sedeLstFilter = [];
    this.especialidadLstFilter = [];
  }

  //búsqueda no requiere validación
  initFormFiltroBuscar() {
    this.formFiltroBuscar = this.formBuilder.group({
      noVEntidad: new FormControl(null,),
      coVEntidad: new FormControl(null,),
      idNDistritoFiscal: new FormControl(null,),
      coVSede: new FormControl(null),
      idNJerarquia: new FormControl(null,),
      idNTipoEspecialidad: new FormControl(),
      idVEspecialidad: new FormControl(null,),
      deVAcronimo: new FormControl(null,),
      feDCreacion: new FormControl(null,),
    });
  }

  initForm() {
    this.dependenciaForm = Object.create(null)
    this.setDataForm(this.dependenciaForm)

    //desabilitar coVSede
    this.formGroupDependencia.get('coVSede').disable();

    //desabilitar dependencia padre
    this.formGroupDependencia.get('coVEntidadPadre').disable();

    //desabilitar coVSede
    this.formGroupDependencia.get('flCCorporativa').setValue("1")

    //deshabilitar tipo especialidad
    this.formGroupDependencia.get('idNTipoEspecialidad').disable();
  }

  setDataForm(dependenciaForm: EntidadForm) {

    this.formGroupDependencia = this.formBuilder.group({
      coVEntidad: new FormControl(dependenciaForm.coVEntidad, [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(patron.PATRON_NUMERO)
      ]),
      noVEntidad: new FormControl(dependenciaForm.noVEntidad, [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(patron.PATRON_ALFANUMERICO_CON_TILDES_GRADO_GUIONES_PUNTO_SLASH)
      ]),
      flCCorporativa: new FormControl(dependenciaForm.flCCorporativa ?? true), // Valor por defecto "Sí"
      idNDistritoFiscal: new FormControl(dependenciaForm.idNDistritoFiscal, [
        Validators.required
      ]),
      coVSede: new FormControl(dependenciaForm.coVSede, [
        Validators.required
      ]),
      idNJerarquia: new FormControl(dependenciaForm.idNJerarquia, [
        Validators.required
      ]),
      idNTipoEspecialidad: new FormControl(dependenciaForm.idNTipoEspecialidad, [
        Validators.required
      ]),
      idVEspecialidad: new FormControl(dependenciaForm.idVEspecialidad, [
        Validators.required
      ]),
      coVEntidadPadre: new FormControl(dependenciaForm.coVEntidadPadre), // Opcional
      deVAcronimo: new FormControl(dependenciaForm.deVAcronimo, [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(patron.PATRON_ALFANUMERICO_CON_GUIONES_Y_GRADO)
      ]),
    });

    this.formGetters = new FormGettersFiscalias(this.formGroupDependencia);
  }

  // Getters para acceder a los controles del formulario
  get coVEntidad() { return this.formGetters.coVEntidad; }
  get noVEntidad() { return this.formGetters.noVEntidad; }
  get flCCorporativa() { return this.formGetters.flCCorporativa; }
  get idNDistritoFiscal() { return this.formGetters.idNDistritoFiscal; }
  get coVSede() { return this.formGetters.coVSede; }
  get idNJerarquia() { return this.formGetters.idNJerarquia; }
  get idVEspecialidad() { return this.formGetters.idVEspecialidad; }
  get idNTipoEspecialidad() { return this.formGetters.idNTipoEspecialidad; }
  get coVEntidadPadre() { return this.formGetters.coVEntidadPadre; }
  get deVAcronimo() { return this.formGetters.deVAcronimo; }

  itemSelected(activeItem: any) {
    this.dependenciaSeleted = activeItem;
  }

  //cerrar modal
  onCloseModal() {
    this.isVisibleModalNewForm = false;
  }

  //para filtro
  getDistritoFiscalLstFilter() {
    this.agregarDependenciaUsService.getDistritoFiscalLst().subscribe({
      next: (response) => {

        this.distritoFiscalLstFilter = response.sort((a, b) =>
          a.noVDistritoFiscal.localeCompare(b.noVDistritoFiscal)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      },
    });
  }

  getDistritoFiscalLst() {
    this.agregarDependenciaUsService.getDistritoFiscalLst().subscribe({
      next: (response) => {
        this.distritoFiscalLst = response.sort((a, b) =>
          a.noVDistritoFiscal.localeCompare(b.noVDistritoFiscal)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      },
    });
  }

  //para filtro y form
  getDistritoFiscalLstFilterAndForm() {
    this.agregarDependenciaUsService.getDistritoFiscalLst().subscribe({
      next: (response) => {
        const sorted = response.sort((a, b) =>
          a.noVDistritoFiscal.localeCompare(b.noVDistritoFiscal)
        );
        this.distritoFiscalLstFilter = [...sorted];
        this.distritoFiscalLst = [...sorted];
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
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
        console.error("error al leer datos del servidor. ", err);
      },
    });
  }

  getJerarquiaLstFilter() {
    this.administrarDependenciaService.getJerarquiaLst().subscribe({
      next: (response) => {
        this.jerarquiaLstFilter = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getJerarquiaLstFilterAndForm() {
    this.administrarDependenciaService.getJerarquiaLst().subscribe({
      next: (response) => {
        const sorted = response.sort((a, b) =>
          a.noVJerarquia.localeCompare(b.noVJerarquia)
        );
        this.jerarquiaLstFilter = [...sorted];
        this.jerarquiaLst = [...sorted];
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      },
    });
  }

  getEspecialidadLstFilter() {
    this.administrarDependenciaService.getEspecialidadLst().subscribe({
      next: (response) => {
        this.especialidadLstFilter = response.sort((a, b) =>
          a.noVEspecialidad.localeCompare(b.noVEspecialidad)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      },
    });
  }

  getEspecialidadLstXTipoEspecialidad(idTipoEspecialidad: number) {
    this.administrarDependenciaService
      .getEspecialidadLstXTipoEspecialidad(idTipoEspecialidad)
      .subscribe({
        next: (response) => {
          this.especialidadLst = response.sort((a, b) =>
            a.noVEspecialidad.localeCompare(b.noVEspecialidad)
          );
        },
        error: (err) => {
          console.error("error al leer datos del servidor. ", err);
        },
      });
  }

  getEspecialidadLstXTipoEspecialidadBuscar(idTipoEspecialidad: number) {
    this.administrarDependenciaService
      .getEspecialidadLstXTipoEspecialidad(idTipoEspecialidad)
      .subscribe({
        next: (response) => {
          this.especialidadLstFilter = response.sort((a, b) =>
            a.noVEspecialidad.localeCompare(b.noVEspecialidad)
          );
        },
        error: (err) => {
          console.error("error al leer datos del servidor. ", err);
        },
      });
  }

  onChangeTipoEspecialidadFormBuscar(idNTipoEspecialidad: number) {
    this.getEspecialidadLstXTipoEspecialidadBuscar(idNTipoEspecialidad);
  }

  getTipoEspecialidadLstSearch() {
    this.plazoDocObsService.getTipoEspecialidadLst().subscribe({
      next: (response) => {
        this.tipoEspecialidadLstFilter = response.sort((a, b) =>
          a.noVTipoEspecialidad.localeCompare(b.noVTipoEspecialidad)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      },
    });
  }

  getTipoEspecialidadLstPorDF(idNDistritoFiscal: number) {
    this.plazoDocObsService.getTipoEspecialidadLstPorDF(idNDistritoFiscal).subscribe({
      next: (response) => {
        this.tipoEspecialidadLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getTipoEspecialidadLst() {
    this.plazoDocObsService.getTipoEspecialidadLst().subscribe({
      next: (response) => {
        this.tipoEspecialidadLst = response.sort((a, b) =>
          a.noVTipoEspecialidad.localeCompare(b.noVTipoEspecialidad)
        );
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      },
    });
  }

  buscarDependenciaChangeValues() {
    this.formFiltroBuscar.valueChanges
      .pipe(
        debounceTime(300),
      )
      .subscribe(() => {
        this.first = 0;
        this.initConfigPage();
        this.buscarDependenciaFormFiltro(); //buscamos
      });
  }

  buscarDependenciaFormFiltro() {
    this._buscarDependencia()

    //activamos luego de los resultados de busqueda para que permita la paginación
    this.onLazyLoadActivo = true;
  }

  buscarDependenciaPaginacion(event: TableLazyLoadEvent) {
    if (this.onLazyLoadActivo) {
      //configurando page cuyos valores son (0,10,20,30,... deben ser convertidos a 1,2,3,...)
      this.first = event.first;
      this.firstChange.emit(this.first);
      this.configPage.pages = (event.first / 10) + 1;
      this._buscarDependencia()
    }
  }

  _buscarDependencia() {
    this.spinner.show();

    const buscarDependenciaReqFiltro: BuscarDependenciaReqFiltro = { ...this.formFiltroBuscar.value }
    this.buscarDependenciaReq = {
      pages: this.configPage.pages,
      perPage: this.configPage.perPage,
      filtros: buscarDependenciaReqFiltro,
    }

    this.administrarDependenciaService.buscarDependencia(this.buscarDependenciaReq).subscribe({
      next: (response) => {
        this.buscarDependenciaRes = response;
        this.buscarDependenciaResLst = response.registros;
        this.buscarDependenciaResLstTotal = response.totalElementos;
        if (this.buscarDependenciaResLstTotal > 0) {
          this.exportarExcelDisabled = false;
        } else {
          this.exportarExcelDisabled = true;
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error("error al consultar datos")
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error al consultar datos.' });
        this.spinner.hide();
      },
    })
  }

  toggleMasFiltros() {
    this.showMoreFiltro = !this.showMoreFiltro
  }

  cancelarAddDependenciaForm() {
    this.onCloseModal();
  }


  agregarDependenciaForm() {
    if (this.formGroupDependencia.valid) {
      this.confirmarAgregarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._agregarDependenciaForm();
          }
        },
        error: (err) => {
          console.error('Error al agregar registro.', err);
          throw new Error('Error al agregar registro');
        },
      });
    } else {
      this.marcarCamposComoTocados(this.formGroupDependencia);
    }
  }

  // async onBlurCoVEntidad() {
  //   await this.validarUnividadCoVEntidad();
  // }

  async siDuplicadoCoVEntidad() {
    const coVEntidad = this.formGroupDependencia.get('coVEntidad').value

    const siDuplicado = await this.administrarDependenciaService.siDuplicadoCoVEntidad(coVEntidad);

    return !!siDuplicado?.data;
  }

  async _agregarDependenciaForm() {

    if (await this.siDuplicadoCoVEntidad()) {
      this.modalNotificationService.dialogError('', `La fiscalía ya se encuentra registrada, por favor validar los datos.`);
    } else {
      const noVEntidad = this.formGroupDependencia.get('noVEntidad').value

      const entidadForm: EntidadForm = {
        ...this.formGroupDependencia.value,
        idNTipoEntidad: 1,
        coVUsCreacion: this.usuarioSesion?.usuario.usuario,
        coVEntidad: this.formGroupDependencia.value.coVEntidad?.trim(),
        noVEntidad: this.formGroupDependencia.value.noVEntidad?.trim(),
        deVAcronimo: this.formGroupDependencia.value.deVAcronimo?.trim()
      };

      this.administrarDependenciaService.agregarDependencia(entidadForm).subscribe({
        next: (response) => {
          if (response.PO_V_ERR_COD == '0') {
            this.refModal = this.dialogService.open(AlertModalComponent, {
              width: '600px',
              showHeader: false,
              data: {
                icon: 'success',
                title: 'Fiscalía registrada',
                description: `El registro de los datos de la nueva fiscalía <b>${noVEntidad}</b> se realizó de forma exitosa.`,
                confirmButtonText: 'Listo'
              },
            });

            this.refModal.onClose.subscribe({
              next: (resp) => {
                if (resp === 'confirm') {
                  //this.initFormFiltroBuscar()
                  this.formFiltroBuscar.reset();// En lugar de initFormFiltroBuscar()
                  this.onCloseModal()
                  this.buscarDependenciaFormFiltro()
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
          this.messageService.add({ severity: 'error', summary: '', detail: 'Error al registrar datos.' });
        }
      })
    }
  }

  //antes openModalFormNew
  agregarDependenciaBtn() {
    this.initForm();
    this.isVisibleModalNewForm = true;
    this.isEditForm = false;
  }

  editDependenciaBtn(dependenciaSeleted: BuscarDependenciaResRow) {

    this.administrarDependenciaService.getDependencia(dependenciaSeleted.coVEntidad).subscribe({
      next: (response) => {
        this.isEditForm = true;
        this.isVisibleModalNewForm = true;
        this.dependenciaForm = response;

        this.getSedeLstXDFForm(this.dependenciaSeleted.idNDistritoFiscal)
        //this.getTipoEspecialidadLstPorDF(this.dependenciaSeleted.idNDistritoFiscal) se cambio a getTipoEspecialidadLst()
        this.getEspecialidadLstXTipoEspecialidad(this.dependenciaForm.idNTipoEspecialidad);
        this.getFiscaliasXJerarquiaMayorGradoForm(this.dependenciaSeleted.idNJerarquia)

        this.setDataForm(this.dependenciaForm)

        //desabilitar columnas
        this.formGroupDependencia.get('coVEntidad').disable();
        this.formGroupDependencia.get('idNDistritoFiscal').disable();
        this.formGroupDependencia.get('idNJerarquia').disable();
        this.formGroupDependencia.get('idVEspecialidad').disable();
        this.formGroupDependencia.get('idNTipoEspecialidad').disable();

        //para validar si hay cambios por parte del usuario
        this.formGroupInicial = this.formGroupDependencia.getRawValue();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error al obtener los datos.' });
      }
    })

  }

  editDependenciaForm() {

    if (isEqual(this.formGroupInicial, this.formGroupDependencia.getRawValue())) {
      this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'info',
          title: 'Sin cambios',
          description: 'No se ha realizado ningún cambio en los datos.',
          confirmButtonText: 'Aceptar',
        },
      });
      return; // Salir sin enviar la solicitud de edición
    }

    if (this.formGroupDependencia.valid) {
      this.confirmarActualizarRegistro('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this._editDependenciaForm();
          }
        },
        error: (err) => {
          console.error('Error al actualizar registro.', err);
          throw new Error('Error al actualizar registro');
        },
      });
    } else {
      /**
      //this.formGroupDependencia.markAllAsTouched();
      // <pre>
      // this.messageService.add({ severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos' });
      // </pre>**/
      this.marcarCamposComoTocados(this.formGroupDependencia);
    }

  }

  //la validación está en una capa arriba(o métodos arriba)
  _editDependenciaForm() {

    const entidadForm: EntidadForm = {
      ...this.formGroupDependencia.value,
      coVEntidad: this.dependenciaSeleted.coVEntidad,
      idNTipoEntidad: this.dependenciaSeleted.idNTipoEntidad,
      coVUsModificacion: this.usuarioSesion?.usuario.usuario,
      idNDependenciaEspecialidad: this.dependenciaForm.idNDependenciaEspecialidad
    }
    this.administrarDependenciaService.actualizarDependencia(entidadForm).subscribe({
      next: (response) => {
        if (response.PO_V_ERR_COD == '0') {

          const noVEntidad = this.formGroupDependencia.get('noVEntidad').value

          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Fiscalía editada',
              description: `La actualización de los datos de la fiscalía <b>${noVEntidad}</b> se realizó de forma exitosa.`,
              confirmButtonText: 'Listo'
            },
          });

          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.onCloseModal()
                this.buscarDependenciaFormFiltro()
              }
            },
            error: (err) => {
              console.error('Error al actualizar registro.', err);
              throw new Error('Error al actualizar registro');
            },
          });
        } else {
          this.messageService.add({ severity: 'error', summary: '', detail: response.PO_V_ERR_MSG });
        }

      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error al registrar datos.' });
      }
    })
  }


  exportarExcelForm() {
    const buscarDependenciaReqFiltro: BuscarDependenciaReqFiltro = { ...this.formFiltroBuscar.value }
    // this.buscarDependenciaReq = {
    //   filtros: buscarDependenciaReqFiltro,
    //   pages: 5, perPage: 1
    // }

    this.administrarDependenciaService.exportarExcel(buscarDependenciaReqFiltro).subscribe({
      next: (response) => {
        this.spinner.hide();
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'Fiscalias.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al leer datos del servidor. ", err);
      }
    });

  }

  onChangeDistritoFiscal(idNDistritoFiscal: number) {
    //actualizamos sede
    this.getSedeLstXDFForm(idNDistritoFiscal)
    this.formGroupDependencia.get('coVSede').enable();

    //actualizamos datos de combo tipo especialidad
    //this.getTipoEspecialidadLstPorDF(idNDistritoFiscal)
    this.formGroupDependencia.get('idNTipoEspecialidad').enable();

  }

  //para el formulario add or edit
  getSedeLstXDFForm(idNDistritoFiscal: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService.getSedesXDF(idNDistritoFiscal)
      .subscribe({
        next: (response) => {
          this.sedeLst = response.sort((a, b) =>
            a.noVSede.localeCompare(b.noVSede)
          );
          this.spinner.hide();
        },
        error: (err) => {
          console.error("error al leer datos del servidor. ", err);
          this.spinner.hide();
        },
      });
  }

  onChangeDistritoFiscalFormSearch(idNDistritoFiscal: number) {
    this.getSedeLstXDFFormSearch(idNDistritoFiscal)
  }

  //para el formulario add or edit
  getSedeLstXDFFormSearch(idNDistritoFiscal: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService.getSedesXDF(idNDistritoFiscal)
      .subscribe({
        next: (response) => {
          this.sedeLstFilter = response.sort((a, b) =>
            a.noVSede.localeCompare(b.noVSede)
          );
          this.spinner.hide();
        },
        error: (err) => {
          console.error("error al leer datos del servidor. ", err);
          this.spinner.hide();
        },
      });
  }


  onChangeJerarquia(idNJerarquia: number) {
    //this.getFiscaliasXJerarquia(idNJerarquia)
    this.getFiscaliasXJerarquiaMayorGradoForm(idNJerarquia)

    this.formGroupDependencia.get('coVEntidadPadre').enable();

    //actualizamos el combo de fiscalia
    //this.getFiscaliasXCustomParams()
  }

  onChangeTipoEspecialidadForm(idNTipoEspecialidad: number) {
    this.getEspecialidadLstXTipoEspecialidad(idNTipoEspecialidad);
  }
  //Lista las fiscalias de jerarquía de mayor grado
  getFiscaliasXJerarquiaMayorGradoForm(idNJerarquia: number) {
    this.getFiscaliasXJerarquiaForm(idNJerarquia + 1);
  }

  //fiscalias padre para un select nuevo
  getFiscaliasXJerarquiaForm(idNJerarquia: number) {
    this.spinner.show();
    this.configurarMasDeUnaFiscaliaService.getFiscaliasXJerarquia(idNJerarquia)
      .subscribe({
        next: (response) => {
          this.dependenciaPadreLst = response.sort((a, b) =>
            a.noVEntidad.localeCompare(b.noVEntidad)
          );
          this.spinner.hide();
        },
        error: (err) => {
          console.error("error al leer datos del servidor. ", err);
          this.spinner.hide();
        },
      });
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  private confirmarAgregarRegistro(icon: string): void {

    const noVEntidad = this.formGroupDependencia.get('noVEntidad').value

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Registrar nueva fiscalía',
        confirm: true,
        description:
          'A continuación, se procederá a registrar los datos de la nueva fiscalía ' +
          `<b>${noVEntidad}</b>. ` +
          '¿Está seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  private confirmarActualizarRegistro(icon: string): void {
    const noVEntidad = this.formGroupDependencia.get('noVEntidad').value
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Editar datos de la fiscalía',
        confirm: true,
        description:
          'A continuación, se procederá a modificar los datos de la fiscalía ' +
          `<b>${noVEntidad}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  protected readonly obtenerIcono = obtenerIcono;

  //antes marcarCamposComoTocados
  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  getErrorMessage(controlName: string, errorType: string): string {
    return this.errorMessages[controlName]?.[errorType] ?? 'Error en el campo';
  }

  // Método para obtener la longitud del valor de un control
  getLength(controlName: string): number {
    const control = this.formGroupDependencia.get(controlName);
    return control.value ? control.value.length : 0;
  }

  public validOnlyNumbers(event: any): boolean {
    return validOnlyNumbers(event);
  }

  validOnlyNumbersKeypress(event: KeyboardEvent): boolean {
    return filterNumbersKeypress(event);
  }

  validOnlyNumbersInput(event: any): void {
    return filterNumbersInput(event, this.formFiltroBuscar);
  }

  validOnlyNumbersPaste(event: ClipboardEvent, formControlName:string): void {
    return filterNumbersPaste(event, this.formFiltroBuscar,formControlName);
  }



}
