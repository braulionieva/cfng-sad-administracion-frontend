import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  EspecialidadDTOB,
  JerarquiaDTOB,
} from '@interfaces/administrar-dependencia/administrar-dependencia';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MaestroService } from '@services/maestro/maestro.service';
import { Subscription } from 'rxjs';
import { UsuarioService } from '@services/usuario/usuario.service';
import { FiltrosUsuario } from '@interfaces/shared/shared';
import { AdminSedeService } from '@services/admin-sede/admin-sede.service';
import { SedeBandejaRequest } from '@interfaces/admin-sedes/admin-sedes';
import { AgregarDependenciaUsService } from '@services/agregar-dependencia-us/agregar-dependencia-us.service';
import { DistritoFiscalDTOB } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {Auth2Service} from "@services/auth/auth2.service";

@Component({
  selector: 'app-filtros-usuario',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    CalendarModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
})
export class FiltrosComponent implements OnInit {
  showMoreFiltro: boolean = false;
  public refModalExcel: DynamicDialogRef;
  public refModal: DynamicDialogRef;
  distritoFiscalLst: DistritoFiscalDTOB[] = [];
  jerarquiaLst: JerarquiaDTOB[] = [];
  especialidadLst: EspecialidadDTOB[] = [];

  @Output() filter = new EventEmitter<FiltrosUsuario>();

  public distritosFiscalesList = [];
  public dependenciasList = [];
  public tipoDependenciasList = [];
  public sedesList: any = [];
  public despachosList = [];

  public relacionesLaboralesList = [
    { label: 'Externo', value: 3 },
    { label: 'Tercero', value: 2 },
    { label: 'Trabajador', value: 1 },
  ];
  opcionesDocumento = [];

  filtros: FiltrosUsuario;
  filtroForm: FormGroup;

  showAdditionalFilters = false;

  public subscriptions: Subscription[] = [];
  public tipoDocumentoGeneral: any[];

  public usuarioSesion: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly maestrosService: MaestroService,
    private readonly sedeService: AdminSedeService,
    private readonly agregarDependenciaUsService: AgregarDependenciaUsService,
    public usuarioService: UsuarioService,
    private readonly userService: Auth2Service,
  ) {
    this.filtroForm = this.fb.group({
      nombre: [null],
      distritoFiscal: [null],
      numeroDocumento: [null],
      dependencia: [null], //[{ value: null, disabled: true }],
      sede: [null], //[{ value: null, disabled: true }],
      tipoDependencia: [null],
      relacionLaboral: [null],
      tipoDocumento: [null],
      despacho: [null], //[{ value: null, disabled: true }],
      optionEstado: ['1'],
      optionBloqueado: ['0'],
    });
  }

  ngOnInit() {

    this.eGetDistritoFiscal(); //llamado a rest maestros
    //this.eGetDependenciaFiscal();//llamado a rest maestros
    //this.eGetDespacho();//llamado a rest maestros
    this.gettipoDocumento(); //llamado a rest maestros
    this.listarTipoEntidad();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
      this.buscarUsuarios();
    }, 100);
  }

  onChangeTipoDocumento(event: any): void {
    //ID del tipoDocumento seleccionado
    const tipoDocSeleccionado = event.value;
    //Buscar definición en la lista
    const docDefinicion = this.opcionesDocumento.find(
      (doc) => doc.idTipoDocumento === tipoDocSeleccionado
    );
    //Control de numeroDocumento
    const numeroDocumentoControl = this.filtroForm.get('numeroDocumento');
    //Limpiar validadores previos
    numeroDocumentoControl.clearValidators();

    if (docDefinicion) {
      if (docDefinicion.tipoLongitud === 'EXACTA') {
        const exacta = Number(docDefinicion.longitudMaxima);

        numeroDocumentoControl.setValidators([
          // Validators.required,
          Validators.minLength(exacta),
          Validators.maxLength(exacta),
          Validators.pattern('^[0-9]+$'),
        ]);
      } else if (docDefinicion.tipoLongitud === 'VARIABLE') {
        numeroDocumentoControl.setValidators([
          // Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern('^[0-9]+$'),
        ]);
      } else {
        numeroDocumentoControl.setValidators([
          Validators.maxLength(20),
          Validators.pattern('^[0-9]+$'),
        ]);
      }
    } else {
      // Si no se encontró en opcionesDocumento, algo genérico
      numeroDocumentoControl.setValidators([
        Validators.maxLength(20),
        Validators.pattern('^[0-9]+$'),
      ]);
    }

    numeroDocumentoControl.updateValueAndValidity();

    this.buscarUsuarios();
  }

  get maxLongitudActual(): number {
    const tipoDocSeleccionado = this.filtroForm.get('tipoDocumento')?.value;
    const docDefinicion = this.opcionesDocumento?.find(
      (doc) => doc.idTipoDocumento === tipoDocSeleccionado
    );

    if (!docDefinicion) return 20;

    if (docDefinicion.tipoLongitud === 'EXACTA') {
      return +docDefinicion.longitudMaxima;
    } else if (docDefinicion.tipoLongitud === 'VARIABLE') {
      return 20;
    } else {
      return 20;
    }
  }

  onChangeDistritoFiscal(event: any) {
    this.filtroForm.patchValue({
      sede: null,
      tipoDependencia: null,
      dependencia: null,
      despacho: null,
    });

    this.sedesList = [];
    this.tipoDependenciasList = [];
    this.dependenciasList = [];
    this.despachosList = [];

    this.filtroForm.get('sede').enable();
    this.filtroForm.get('tipoDependencia').enable();
    this.filtroForm.get('dependencia').disable();
    this.filtroForm.get('despacho').disable();

    this.listarTipoEntidad();
    this.buscarSedesDisponibles();

    this.buscarUsuarios();
  }

  onChangeSedes(event: any) {
    this.buscarSedesDisponibles();
    this.buscarUsuarios();
  }

  public buscarSedesDisponibles(): void {
    let query: SedeBandejaRequest = {
      pages: 0,
      perPage: 10,
      filtros: {
        nombreSede: null,
        idDistritoFiscal: this.filtroForm.value.distritoFiscal,
      },
    };

    this.sedeService.obtenerSedes(query).subscribe({
      next: (response) => {
        this.sedesList = response.registros;

        this.sedesList.sort((a, b) => a.nombreSede.localeCompare(b.nombreSede));
      },
      error: (err) => {
        console.error('Error al obtener servidores:', err);
      },
    });
  }

  private listarTipoEntidad(): void {
    this.maestrosService.listarTipoEntidad().subscribe({
      next: (response) => {
        this.tipoDependenciasList = response;
        this.tipoDependenciasList.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
      error: (err) => {
        console.error('Error al obtener tipoEntidad:', err);
        this.tipoDependenciasList = [];
      },
    });
  }

  loadTipoDocumento() {}

  onChangeTipoDependencia(event: any) {
    let distritoFiscal = this.filtroForm.get('distritoFiscal').value;
    let sede = this.filtroForm.get('sede').value;
    let tipoDependencia = this.filtroForm.get('tipoDependencia').value;

    if (distritoFiscal !== null && sede !== null && tipoDependencia !== null) {
      this.listarEntidad(distritoFiscal, sede, tipoDependencia);
    }

    this.filtroForm.get('dependencia').enable(); // Habilita el segundo dropdown cuando se elige una opción en el primero
    this.buscarUsuarios();
  }

  private listarEntidad(
    idDistritoFiscal: number,
    codigoSede: string,
    idTipoEntidad: number
  ): void {
    const request: any = {
      idDistritoFiscal,
      codigoSede,
      idTipoEntidad,
    };
    this.maestrosService.listarDependencias(request).subscribe({
      next: (response) => {
        this.dependenciasList = response;
        this.dependenciasList.sort((a, b) => a.nombre.localeCompare(b.nombre));
      },
      error: (err) => {
        console.error('error al listar dependencias.', err);
      },
    });
  }

  private listarDespachos(coVEntidad: string) {
    this.agregarDependenciaUsService.getDespachoLst(coVEntidad).subscribe({
      next: (response) => {
        this.despachosList = response;
        this.despachosList.sort((a, b) =>
          a.noVDespacho.localeCompare(b.noVDespacho)
        );
      },
      error: (err) => {
        console.error('error al leer datos del servidor. ', err);
      },
    });
  }

  onChangeDependencias(event: any) {
    let dependencia = this.filtroForm.get('dependencia').value;
    this.filtroForm.get('despacho').enable();
    this.listarDespachos(dependencia);
    this.buscarUsuarios();
  }

  gettipoDocumento() {
    this.usuarioService.listarTipoDocumento().subscribe({
      next: (res: any) => {
        this.opcionesDocumento = res?.tipoDocumentoList?.filter(
          (x) => x.longitudMaxima != null
        );

        this.tipoDocumentoGeneral = this.opcionesDocumento;

        this.opcionesDocumento.sort((a, b) =>
          a.tipoDocumento.localeCompare(b.tipoDocumento)
        );
      },
      error: (err: string) => {
        console.error('Error al consultar BD: ', err);
      },
    });
  }

  eGetDistritoFiscal() {
    this.subscriptions.push(
      this.maestrosService.listarDistritosFiscalesActivos().subscribe({
        next: (resp) => {
          this.distritosFiscalesList = resp;
          this.distritosFiscalesList.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          );
        },
        error: (err) => {
          console.error('Error al obtener distritos fiscales', err);
        },
      })
    );
  }

  eGetDependenciaFiscal() {
    this.subscriptions.push(
      this.maestrosService.listarDependenciasFiscalesActivos().subscribe({
        next: (resp) => {
          this.dependenciasList = resp;
        },
      })
    );
  }
  eGetDespacho() {
    this.subscriptions.push(
      this.maestrosService.listarDespachosActivos().subscribe({
        next: (resp) => {
          this.despachosList = resp;
        },
      })
    );
  }
  renuevaDependencia(event: any) {
    let idDistritoFiscal = event;

    this.subscriptions.push(
      this.maestrosService
        .listarDependenciasPorDistrito(idDistritoFiscal)
        .subscribe({
          next: (resp) => {
            this.dependenciasList = resp;
          },
        })
    );
    this.buscarUsuarios();
  }

  renuevaDespacho(event: any) {
    let idDependencia = event;

    this.subscriptions.push(
      this.maestrosService.listarDespachoPorEntidad(idDependencia).subscribe({
        next: (resp) => {
          this.despachosList = resp;
        },
      })
    );
    this.buscarUsuarios();
  }

  getPayload() {
    this.filtros = {
      pagina: 0,
      porPagina: 10,
      distritoFiscal: this.filtroForm.value.distritoFiscal || null,
      codigoDependencia: this.filtroForm.value.dependencia
        ? this.filtroForm.value.dependencia
        : null,
      codigoDespacho: this.filtroForm.value.despacho
        ? this.filtroForm.value.despacho
        : null,
      nombreCompleto: this.filtroForm.value.nombre || null,
      tipoDocumento: this.filtroForm.value.tipoDocumento || null,
      numeroDocumento: this.filtroForm.value.numeroDocumento || null,
      sede: this.filtroForm.value.sede ? this.filtroForm.value.sede : null,
      tipoDependencia: this.filtroForm.value.tipoDependencia || null,
      relacionLaboral: this.filtroForm.value.relacionLaboral || null,
      estadoActivo: this.filtroForm.value.optionEstado || null,
      estadoBloqueado: this.filtroForm.value.optionBloqueado || null,
      coVCargo:this.usuarioSesion?.usuario.codCargo
    };
    return this.filtros;
  }

  buscarUsuarios() {
    this.filter.emit(this.getPayload());
  }

  //FUNCION MOSTRAR MÁS FILTROS
  toggleFilters() {
    this.showAdditionalFilters = !this.showAdditionalFilters;
  }

  /********************* */
  //FUNCIÓN LIMPIAR FILTROS
  onClearFilters() {
    this.filtroForm.reset({
      nombre: null,
      distritoFiscal: null,
      numeroDocumento: null,
      dependencia: null, //{ value: null, disabled: true },
      sede: null, //{ value: null, disabled: true },
      tipoDependencia: null, //{ value: null},
      relacionLaboral: null,
      tipoDocumento: null,
      despacho: null, //{ value: null, disabled: true },
      optionEstado: '1',
      optionBloqueado: '0',
    });

    this.sedesList = [];
    this.dependenciasList = [];
    this.tipoDependenciasList = [];
    this.despachosList = [];
    this.filtroForm.get('sede').disable();
    //this.filtroForm.get('tipoDependencia').disable();
    this.filtroForm.get('dependencia').disable();
    this.filtroForm.get('despacho').disable();

    this.showAdditionalFilters = false;

    this.filter.emit(this.getPayload());
  }

  toggleMasFiltros() {
    this.showAdditionalFilters = !this.showAdditionalFilters;
    this.showMoreFiltro = !this.showMoreFiltro;
  }

  getIcon() {
    return `pi pi-angle-double-${this.showAdditionalFilters ? 'up' : 'down'}`;
  }

  confirmarEliminacionUsuario(icon: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar',
        confirm: true,
        description: '¿Quiere usted eliminar el turno fiscal?',
      },
    });
  }
}
