import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { MaestroService } from '@services/maestro/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { UploadSustentoComponent } from './upload-sustento/upload-sustento.component';
import { CalendarModule } from 'primeng/calendar';
import { AgregarFiscaliaDistribucionAleatoriaComponent } from './agregar-fiscalia/agregar-fiscalia-distribucion-aleatoria.component';
import { validNumberDiferencia, validOnlyNumbers } from '@utils/utils';
import { CONSTANTES_MAX } from 'src/app/shared/constants/constantes';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
// import { obtenerIcono } from '@utils/icon';
// import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { GrupoAleatorioService } from '@services/grupo-aleatorio/grupo-aleatorio.service';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  DataFile,
  StructArticulos,
} from '@interfaces/grupo-aleatorio/grupo-aleatorio';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { firstValueFrom } from 'rxjs';
import { NotaInfoDistribucionComponent } from "../../../../shared/components/nota-info-distribucion/nota-info-distribucion.component";
import {
  ConfigurarMasDeUnaFiscaliaService
} from "@services/configurarMasDeUnaFiscalia/configurar-mas-de-una-fiscalia.service";
import {SedeDTOB} from "@interfaces/agregar-dependencia-us/agregar-dependencia-us";
@Component({
  selector: 'app-agregar-editar-distribucion-aleatoria',
  standalone: true,
  templateUrl: './agregar-editar-distribucion-aleatoria.component.html',
  styleUrls: ['./agregar-editar-distribucion-aleatoria.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    MenuModule,
    CalendarModule,
    ButtonModule,
    InputNumberModule,
    MultiSelectModule,
    UploadSustentoComponent,
    // CmpLibModule,
    NotaInfoDistribucionComponent
  ],
})
export class AgregarEditarDistribucionAleatoriaComponent implements OnInit {
  @ViewChild('dropdownTipoDistribucion') dropdownTipoDistribucion: Dropdown;
  fileValid: boolean = false;
  fileToUpload: File | null = null;
  dataFile: DataFile;
  tipoLlamado: string = 'agregar';
  showUpLoad: boolean = false;
  distritoFiscal: MaestroGenerico[] = [];
  tipoDistribucion: MaestroGenerico[] = [];
  tipoEspecialidad: MaestroGenerico[] = [];
  especialidad: MaestroGenerico[] = [];
  distrito: MaestroGenerico[] = [];
  listaFiscaliasAgregar: any[] = [];
  listArticulosAgregados: any[] = [];
  listaArticulos: any[] = [];
  listaSelectArticulos: any[] = [];
  responseArticulos: StructArticulos[];

  grupoAleatorio: any;
  fiscaliaSelected: any;
  index: number;
  actionItemsMenu: MenuItem[];

  datosGrupoAleatorio: any;
  selectedTipoDistribucion: any = null;
  lastTipoDistribucion: any;

  cols: any[] = [];
  dataCols: any[] = [];
  showAdjuntar: boolean = false;
  showCboDistrito: boolean = false;
  showBtnAgregarFiscalia: boolean = false;

  diferenciaFechas: number = 0;
  altPeriodo: string = ""
  altArticulo: string = ""
  agregarGrupoForm: FormGroup;
  mensajeArticulo: string = "Para registrar el artículo, puede realizar la búsqueda con el número correspondiente y luego seleccionarlo";
  mensajePeriodo: string = "Para registrar el período correctamente, se debe ingresar la fecha de inicio y fecha de fin correspondiente";

  flagFalta: boolean = false;
  flagGuardado: boolean = false;

  public refModal: DynamicDialogRef;
  error: any;
  sedeLst: SedeDTOB[] = [];
  // public obtenerIcono = obtenerIcono;
  constructor(
    public ref: DynamicDialogRef,
    public dialogService: DialogService,
    public config: DynamicDialogConfig,
    private readonly maestroService: MaestroService,
    private readonly grupoAleatorioService: GrupoAleatorioService,
    private readonly fb: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly configurarMasDeUnaFiscaliaService: ConfigurarMasDeUnaFiscaliaService,
  ) {
    this.grupoAleatorio = this.config.data?.grupoAleatorio;

    this.agregarGrupoForm = this.fb.group({
      nombreGrupoAleatorio: new FormControl(
        this.grupoAleatorio?.nombreGrupoAleatorio,
        [
          Validators.required,
          Validators.pattern(/^([a-z A-Z])*$/),
          Validators.minLength(2),
          Validators.maxLength(100),
        ]
      ),
      fechaInicio: [null],
      fechaFin: [null],
      idTipoDistribucion: [null],
      diferenciaMaxima: [this.grupoAleatorio?.diferenciaMaxima || null],
      idDistritoFiscal: [null],
      idTipoEspecialidad: [null],
      idEspecialidad: [null],
      coVSede: [null],
      idDistrito: [null],
      selectedArticulos: [this.grupoAleatorio?.articulos],
    });
  }

  ngOnInit() {
    this.tipoLlamado = this.config.data?.tipo;
    this.setCols();
    this.loadTipoDistribucion();
    this.loadDistritoFiscal();
    this.loadTipoEspecialidad();
    this.loadArticulos();
    if (!this.isAgregar())
      this.obtenerListaFiscaliaGrupoAleatorio(this.grupoAleatorio?.id);

    this.actionItemsMenu = [
      {
        label: 'Editar',
        command: () => this.onAgregarEditarFiscalia(true),
      },
      {
        label: 'Eliminar',
        command: () => {
          this.onEliminarRegistro();
        },
      },

    ];
  }

  onFile(dataFile: DataFile) {

    this.fileValid = false;
    if (dataFile.File != null) {
      this.fileValid = true;
      this.dataFile = dataFile;
    }
  }

  getTitulo(): string {
    return this.tipoLlamado == 'agregar'
      ? 'Agregar Grupo Aleatorio'
      : 'Editar Grupo Aleatorio';
  }

  isAgregar(): boolean {
    return this.tipoLlamado == 'agregar';
  }
  get habilitaAgregar() {
    return (this.agregarGrupoForm.value.idDistritoFiscal && this.agregarGrupoForm.value.idTipoEspecialidad &&
      this.agregarGrupoForm.value.idEspecialidad && this.agregarGrupoForm.value.idTipoDistribucion);
  }
  setCols(): void {
    this.cols = [
      { field: 'secuencia', header: 'Nº' },
      { field: 'distritoFiscal', header: 'Distrito Fiscal' },
      { field: 'especialidad', header: 'Especialidad' },
      { field: 'cantidadFiscalia', header: 'Fiscalías' },
      { field: 'nombreGrupoAleatorio', header: 'Despacho' },
      { field: 'tipoDistribucion', header: 'Fiscales activos' },
      { field: 'ultimaModificacion', header: 'Última Modificación' },
      { field: 'consideraTurno', header: 'Acciones' },
    ];
  }

  reset() {
    this.agregarGrupoForm.get('fechaInicio').setValue(null);
    this.agregarGrupoForm.get('fechaFin').setValue(null);
  }

  public confirmarGuardarGrupoAleatorio(): void {
    let title = this.isAgregar() ? 'registrar' : 'editar';
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: title.toUpperCase() + ' GRUPO ALEATORIO',
        confirm: true,
        description:
          'A continuación, se procederá a ' +
          title +
          ' el <b>“' +
          this.agregarGrupoForm.get('nombreGrupoAleatorio').value +
          '”</b> ingresado.¿Esta seguro de realizar esta acción?',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.guardarGrupoAleatorio();
        }
      },
    });
  }

  async guardarGrupoAleatorio() {
    if (this.agregarGrupoForm.valid) {
      let fiscalias: any[] = [];
      let fiscales: any[] = [];
      let despachos: any[] = [];
      let articulos: any[] = [];

      this.listaFiscaliasAgregar.forEach((fiscaliasGeneral, idx) => {
        fiscalias.push({
          idDistritoFiscal: fiscaliasGeneral?.idDistritoFiscal,
          idEspecialidad: fiscaliasGeneral?.idEspecialidad,
          idTipoEspecialidad: fiscaliasGeneral?.idTipoEspecialidad,
          idFiscalia: fiscaliasGeneral?.codigoFiscalia,
          idTipoEntidad: fiscaliasGeneral?.idTipoEntidad,
          observacion: null,
        });

        fiscaliasGeneral?.despachos?.forEach((dDespacho, idx) => {
          dDespacho?.fiscales?.forEach((dFiscal, idx) => {
            fiscales.push({
              idDespacho: dDespacho.codigoDespacho,
              idFiscal: dFiscal.codigoFiscal,
              estadoActivo: dFiscal.estado,
            });
          });

          despachos.push({
            idDespacho: dDespacho.codigoDespacho,
            idFiscalia: fiscaliasGeneral.codigoFiscalia,
            idTipoEntidad: fiscaliasGeneral.idTipoEntidad,
            fechaApertura: fiscaliasGeneral.fechaApertura,
            fechaCierre: fiscaliasGeneral.fechaCierre,
            estadoTurno: dDespacho.consideraTurno,
            estadoActivo: dDespacho.estado,
          });
        });
      });

      articulos = this.agregarGrupoForm.get('selectedArticulos').value; //
      this.datosGrupoAleatorio = {
        idGrupoAleatorio: this.grupoAleatorio?.id,
        nombreGrupoAleatorio: this.agregarGrupoForm.get('nombreGrupoAleatorio').value,
        idTipoDistribucion: this.agregarGrupoForm.get('idTipoDistribucion').value,
        diferenciaMinimaMaxima: this.agregarGrupoForm.get('diferenciaMaxima').value,
        idDitritoFiscal: this.agregarGrupoForm.get('idDistritoFiscal').value,
        coVSede: this.agregarGrupoForm.get('coVSede').value,
        idEspecialidad: this.agregarGrupoForm.get('idEspecialidad').value,
        idTipoEspecialidad: this.agregarGrupoForm.get('idTipoEspecialidad').value,
        fechaApertura: this.agregarGrupoForm.get('fechaInicio').value,
        fechaCierre: this.agregarGrupoForm.get('fechaFin').value,
        listaFiscaliasAgregadas: fiscalias,
        listaDespachosAgregados: despachos,
        listaFiscalesAgregados: fiscales,
        listaArticulosAgregados: articulos,
      };

      let actualIdGrupoAleatorio: string;

      if (this.isAgregar()) {
        this.grupoAleatorioService
          .agregarGrupo(this.datosGrupoAleatorio)
          .subscribe({
            next: (response) => {
              actualIdGrupoAleatorio = response.data.idGrupoAleatorio;

              this.guardarArchivoDocumento(actualIdGrupoAleatorio).then((resultado) => {
                if (resultado) {
                  this.guardadoSatisfactorio(this.datosGrupoAleatorio.nombreGrupoAleatorio);
                }
              });
            },
            error: (err) => {
              this.error = err;
              console.error('Error al agregar grupo aleatorio:', err);
            },
          });
      } else {
        this.grupoAleatorioService
          .editarGrupo(this.datosGrupoAleatorio)
          .subscribe({
            next: (response) => {
              actualIdGrupoAleatorio = response.data.idGrupoAleatorio;

              this.guardarArchivoDocumento(actualIdGrupoAleatorio).then((resultado) => {
                if (resultado) {
                  this.guardadoSatisfactorio(this.datosGrupoAleatorio.nombreGrupoAleatorio);
                }
              });
            },
            error: (err) => {
              this.error = err;
              console.error('Error al editar grupo aleatorio:', err);
            },
          });
      }
    }
  }

  obtenerArticulosSeleccionados(listaArticulos: any) {
    let lsArticulos: any[] = [];
    listaArticulos?.forEach((dArticulo, idx) => {
      lsArticulos.push({
        idEspecifico: dArticulo.id,
        nombreArticulo: dArticulo.nombre,
      });
    });
    return lsArticulos;
  }

  public guardadoSatisfactorio(nombre: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'REGISTRO REALIZADO CORRECTAMENTE',
        description:
          'El registro del "' + nombre + '" fue realizado exitosamente',
        confirmButtonText: 'Listo',
      },
    });
    let data = { id: 1, accion: 'actualizar bandeja' };
    this.ref.close(data);
  }
  public close(): void {
    this.ref.close();
  }

  private loadTipoDistribucion(): void {
    this.spinner.show();
    this.maestroService.listarDistribucionAleatoria().subscribe({
      next: (response) => {
        this.tipoDistribucion = response;

        if (!this.isAgregar()) {
          if (this.tipoDistribucion.length > 0) {
            if (this.config.data?.tipoDistribucion != undefined) {
              this.selectedTipoDistribucion = this.getIdDistribucion(
                this.config.data?.tipoDistribucion
              );
            } else {
              this.selectedTipoDistribucion = this.tipoDistribucion.at(0).id;
            }
            this.agregarGrupoForm.controls['idTipoDistribucion'].setValue(
              this.selectedTipoDistribucion
            );
          }
        }
      },
    });
  }

  private loadTipoEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarTipoEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.tipoEspecialidad = response.data;

        if (this.config.data?.tipoEspecialidad != undefined) {
          const idTipoEsp = this.getIdTipoEspecialidad(this.config.data?.tipoEspecialidad);
          this.agregarGrupoForm.controls['idTipoEspecialidad'].setValue(idTipoEsp);

          this.loadEspecialidad(idTipoEsp);
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error al cargar tipo de especialidad: ', err);
      },
    });
  }

  private loadEspecialidad(tipoEspecialidad: string): void {
    this.spinner.show();
    this.maestroService.listarEspecialidadPorTipo(tipoEspecialidad).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.especialidad = response.data;

        if (this.especialidad.length > 0 && this.config.data?.especialidad != undefined) {
          this.agregarGrupoForm.controls['idEspecialidad'].setValue(
            this.getIdEspecialidad(this.config.data?.especialidad)
          );
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error al cargar especialidades: ', err);
      },
    });
  }


  private loadDistrito(): void {
    this.spinner.show();
    this.maestroService.listarEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.distrito = response.data;
        if (this.config.data?.fiscalia != undefined) {
          this.agregarGrupoForm.controls['idFiscalia'].setValue(
            this.getIdFiscalia(this.config.data?.fiscalia)
          );
        }
      },
    });
  }

  private loadDistritoFiscal(): void {
    this.spinner.show();
    this.maestroService.listarDistritosFiscalesActivos().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.distritoFiscal = response;
        if (this.config.data?.distritoFiscal != undefined) {
          this.agregarGrupoForm.controls['idDistritoFiscal'].setValue(
            this.getIdDistritoFiscal(this.config.data?.distritoFiscal)
          );
        }
      },
    });
  }

  private loadArticulos(): void {
    this.spinner.show();

    this.maestroService.listarArticulos().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.listaArticulos = response;
      },
    });
    this.spinner.hide();
  }

  agregarListaFiscalias(despachosList: any): void {
    this.listaFiscaliasAgregar.push(despachosList);

    this.flagGuardado = true;
  }
  onShowTipoDistribucion(): void {
    this.lastTipoDistribucion = this.dropdownTipoDistribucion.value;
  }

  onChangeTipoDistribucion(event: any): void {
    const nombreDistribucionNueva = this.getNombreDistribucion(event.value);
    if (!this.isAgregar()) {
      this.confirmarCambioDistribucion('warning', nombreDistribucionNueva);
      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.selectedTipoDistribucion = event.value;
          } else {
            this.selectedTipoDistribucion = this.lastTipoDistribucion;
          }
          this.agregarGrupoForm.controls['idTipoDistribucion'].setValue(
            this.selectedTipoDistribucion
          );
        },
      });
    } else {
      this.selectedTipoDistribucion = event.value;
      this.agregarGrupoForm.controls['idTipoDistribucion'].setValue(
        this.selectedTipoDistribucion
      );
    }
  }

  onChangeDistritoFiscal(idNDistritoFiscal: number) {
    //actualizamos sede
    this.getSedeLstXDF(idNDistritoFiscal)

    //this.formGroupDependencia.get('coVSede').enable();
  }

  getSedeLstXDF(idNDistritoFiscal: number) {
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

  onChangeTipoEspecialidad(tipoEspecialidad: string) {
    this.loadEspecialidad(tipoEspecialidad);
  }

  onChangeEspecialidad(event: any) {
  }

  onChangeDistrito(event: any) {
  }

  public validateShowDistrito(): void {
    /**var condicion = ( (this.agregarGrupoForm.value['idDistritoFiscal'] != null ) && (this.agregarGrupoForm.value['idTipoEspecialidad'] != null) && (this.agregarGrupoForm.value['idEspecialidad'] != null)); **/
    this.showBtnAgregarFiscalia =
      this.agregarGrupoForm.value['idDistritoFiscal'] != null &&
      this.agregarGrupoForm.value['idTipoEspecialidad'] != null &&
      this.agregarGrupoForm.value['idEspecialidad'] != null;
    if (this.showBtnAgregarFiscalia) {
      this.confirmarSeleccionarDistrito('question');
      this.refModal.onClose.subscribe({
        next: (resp) => {
          this.showCboDistrito = resp; //=== 'confirm';
          this.showBtnAgregarFiscalia = !this.showCboDistrito;
        },
      });
    }
  }

  private confirmarSeleccionarDistrito(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'REGISTRAR FISCALÍA INGRESADA',
        confirm: true,
        confirmButtonText: "Aceptar",
        description:
          'A continuación, se procederá a registrar la “Fiscalía de Prueba A” con los datos ingresados.<br>¿Esta seguro de realizar esta acción?',
      },
    });
  }

  private confirmarCambioDistribucion(
    icon: string,
    nombreDistNueva: string
  ): void {
    this.flagFalta = true;
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'CAMBIAR TIPO DE DISTRIBUCIÓN',
        confirm: true,
        confirmButtonText: "Aceptar",
        description:
          'A continuación, se procederá a <b>cambiar el tipo de distribución</b> a una "' +
          nombreDistNueva +
          '”. Por favor, no olvide actualizar los registros existentes con la nueva información solicitada.<br>¿Esta seguro de r“ealizar esta acción?',
      },
    });
  }

  public getNombreDistribucion(id: string): string {
    let distribucionNombre = '';

    distribucionNombre = this.tipoDistribucion.find((x) => x.id == id).nombre;

    return distribucionNombre;
  }

  public getIdDistribucion(nombre: string): string {
    return this.tipoDistribucion.find((x) => x.nombre == nombre).id;
  }

  public getIdTipoEspecialidad(nombre: string): string {
    return this.tipoEspecialidad.find((x) => x.nombre == nombre).id;
  }

  public getIdEspecialidad(nombre: string): string {
    return this.especialidad.find((x) => x.nombre == nombre).id;
  }

  public getIdDistritoFiscal(nombre: string): string {
    return this.distritoFiscal.find((x) => x.nombre == nombre).id;
  }

  public getIdFiscalia(nombre: string): string {
    return this.distrito.find((x) => x.nombre == nombre).id;
  }
  public verificaLapso() {
    if (
      this.agregarGrupoForm?.get('fechaInicio').value === null ||
      this.agregarGrupoForm?.get('fechaFin').value === null
    )
      return;
    this.diferenciaFechas =
      this.agregarGrupoForm?.get('fechaFin').value -
      this.agregarGrupoForm?.get('fechaInicio').value;
    if (this.diferenciaFechas < 0) {
      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '750px',
        showHeader: false,
        data: {
          icon: 'warning',
          title: 'la fecha de inicio debe ser anterior a la fecha fin',
          confirmButtonText: 'Listo',
        },
      });
    }
    this.actualizaShowUpLoad();
  }
  public validOnlyNumbersDM(event: any): boolean {

    return validNumberDiferencia(event);
  }

  lenDiferencia() {
    if (this.agregarGrupoForm.get('diferenciaMaxima').value?.toString().length > 0)
      return false;

    return true;
  }

  public validInDiferencia(): boolean {
    if (this.agregarGrupoForm.get('diferenciaMaxima').value > 5 || this.agregarGrupoForm.get('diferenciaMaxima').value < 1) {
      return false;
    }

    return true;
  }

  public validOnlyNumbers(event: any): boolean {
    return validOnlyNumbers(event);
  }

  validMaxValue(): boolean {
    return this.agregarGrupoForm.get('diferenciaMaxima').value;
  }
  validMaxLenght(event: any): boolean {
    let value = this.agregarGrupoForm.get('diferenciaMaxima').value;
    if (value.length < CONSTANTES_MAX.MAX_LENGHT) {
      this.agregarGrupoForm
        .get('diferenciaMaxima')
        .setValue(value.slice(0, CONSTANTES_MAX.MAX_LENGHT));
      return true;
    }
    return false;
  }
  get validaAgregarGrupoForm() {
    if (
      this.agregarGrupoForm.valid &&
      this.agregarGrupoForm.get('nombreGrupoAleatorio').value?.length > 3 &&
      this.agregarGrupoForm.get('idTipoDistribucion').value &&
      this.agregarGrupoForm.get('diferenciaMaxima').value > 0 &&
      this.listaFiscaliasAgregar.length > 0
    ) {
      if ((this.showUpLoad && this.fileValid) || !this.showUpLoad) return true;
    }

    return false;
  }

  onAgregarEditarFiscalia(modoEdicion: boolean) {
    let i = this.index;
    this.flagGuardado = false;
    let dataDespacho: any;
    console.log("this.fiscaliaSelected:",this.fiscaliaSelected)
    if (modoEdicion) dataDespacho = JSON.parse(JSON.stringify(this.fiscaliaSelected));
    else
      dataDespacho = {
        editar: modoEdicion,
        idTipoDistribucion: this.selectedTipoDistribucion,
        distritoFiscal: this.distritoFiscal,
        idDistritoFiscal: this.agregarGrupoForm.value['idDistritoFiscal'],
        tipoEspecialidad: this.tipoEspecialidad,
        idTipoEspecialidad: this.agregarGrupoForm.value['idTipoEspecialidad'],
        especialidad: this.especialidad,
        idEspecialidad: this.agregarGrupoForm.value['idEspecialidad'],
        distrito: this.distrito,
        idDistrito: this.agregarGrupoForm.value['idDistrito'],
        coVSede: this.agregarGrupoForm.value['coVSede'],
      };

    this.refModal = this.dialogService.open(AgregarFiscaliaDistribucionAleatoriaComponent,
      {
        width: '1180px',
        showHeader: false,
        data: {
          dataDespacho: dataDespacho,
          editar: modoEdicion,
          idTipoDistribucion: this.selectedTipoDistribucion,
          dataGrupoAleatorio: this.listaFiscaliasAgregar,
        },
      }
    );

    this.refModal.onClose.subscribe((data) => {
      if (data != null) {
        if (modoEdicion) {
          this.listaFiscaliasAgregar.splice(i, 1, data); //ecueva 77
        } else {
          this.agregarListaFiscalias(data[0]);
        }
      }
    });
  }
  selectArticulos($event) {
    this.actualizaShowUpLoad();
  }

  actualizaShowUpLoad() {
    if (this.listArticulosAgregados?.length > 0 || this.diferenciaFechas > 0) {
      this.showUpLoad = true;
    } else {
      this.showUpLoad = false;
    }
  }

  onEliminarRegistro() {

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'ELIMINAR DATOS DE LA FISCALÍA',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description:
          'A continuación, se procederá a <b>eliminar los datos de la “' +
          this.fiscaliaSelected.nombreFiscalia +
          '”</b>.<br>¿Esta seguro de realizar esta acción?',
      },
    });
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.listaFiscaliasAgregar.splice(this.index, 1);
          this.informarEliminacion(
            'success',
            'ELIMINACIÓN EXITOSA',
            'La eliminación de los datos de la "' +
            this.fiscaliaSelected.nombreFiscalia +
            '" fué realizado de forma exitosa.'
          );
        }
      },
    });
  }

  public informarEliminacion(
    icon: string,
    title: string,
    description: string
  ): void {
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
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  public logo(name: string): string {
    return `assets/images/${name}.png`;
  }
  public obtenerListaFiscaliaGrupoAleatorio(id: string) {

    this.grupoAleatorioService.obtenerFiscaliasGrupoAleatorioV2(id).subscribe({
      next: (response) => {
        this.listaFiscaliasAgregar = response?.fiscalias;
        const idDistritoFiscal = response?.idDistritoFiscal;
        this.agregarGrupoForm.controls['idTipoDistribucion'].setValue(
          response.idTipoDistribucion);
        this.agregarGrupoForm.controls['coVSede'].setValue(
          response.coVSede);
        if (response?.feApertura == null || response?.feCierre == null) {
          this.agregarGrupoForm.get('fechaInicio').setValue(null);
          this.agregarGrupoForm.get('fechaFin').setValue(null);
        } else {
          let fechaRecuperadaApertura = new Date(response?.feApertura);
          let fechaRecuperadaCierre = new Date(response?.feCierre);
          fechaRecuperadaApertura = new Date(
            fechaRecuperadaApertura.getTime() +
            fechaRecuperadaApertura.getTimezoneOffset() * 60 * 1000
          );
          fechaRecuperadaCierre = new Date(
            fechaRecuperadaCierre.getTime() +
            fechaRecuperadaCierre.getTimezoneOffset() * 60 * 1000
          );
          this.agregarGrupoForm.get('fechaInicio').setValue(fechaRecuperadaApertura);
          this.agregarGrupoForm.get('fechaFin').setValue(fechaRecuperadaCierre);

          this.verificaLapso();
        }
        this.listaSelectArticulos = response?.articulos;
        this.agregarGrupoForm.get('selectedArticulos').setValue(this.listaSelectArticulos);

        //listamos las sedes por distrito fiscal
        if (idDistritoFiscal) {
          this.getSedeLstXDF(idDistritoFiscal);
        }

      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener fiscalias del grupos aleatorios:', err);
      },
    });
  }

  //refactorizado
  async guardarArchivoDocumento(idActual: any): Promise<boolean> {
    if (!this.fileValid || !this.dataFile) {
      return false;
    }

    const formData: FormData = new FormData();
    formData.append('file', this.dataFile?.File, this.dataFile?.File?.name);
    formData.append('idGrupoAleatorio', idActual);
    formData.append('observaciones', this.dataFile.observacion);
    formData.append('usuario', '40291777');
    formData.append('admin', 'SYSDBA');

    this.spinner.show();

    try {
      await firstValueFrom(this.grupoAleatorioService.guardarDocumento(formData));
      return true;
    } catch (err) {
      this.error = err;
      return false;
    } finally {
      this.spinner.hide();
    }
  }

  setRowSelected(seleccion: any, i: number) {
    this.fiscaliaSelected = seleccion;
    this.index = i;
  }
  public guardaArchivoSatisfactorio(
    icon: string,
    title: string,
    description: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
      },
    });
  }
  getDespachosActivos(fiscalia: any): number {
    return fiscalia?.despachos?.filter((e) => e.estado == 1).length; //cuenta despachos activos
  }

  getFiscalesActivos(despacho: any): number {
    return despacho?.fiscales?.filter((e) => e.estado == 1).length; //cuenta fiscales activos en el despacho
  }
}
