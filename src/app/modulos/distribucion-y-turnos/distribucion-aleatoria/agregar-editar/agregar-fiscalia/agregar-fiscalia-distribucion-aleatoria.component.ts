import { CODIGO_TIPO_DISTRIBUCION } from '@constants/constantes';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { NotaInfoDistribucionComponent } from '@components/nota-info-distribucion/nota-info-distribucion.component';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { GrupoAleatorioService } from '@services/grupo-aleatorio/grupo-aleatorio.service';
import { MaestroService } from '@services/maestro/maestro.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';
import { InputSwitchModule } from 'primeng/inputswitch';
import {SedeDTOB} from "@interfaces/agregar-dependencia-us/agregar-dependencia-us";
import {NgxSpinnerService} from "ngx-spinner";
import {
  ConfigurarMasDeUnaFiscaliaService
} from "@services/configurarMasDeUnaFiscalia/configurar-mas-de-una-fiscalia.service";

@Component({
  selector: 'app-agregar-fiscalia-distribucion-aleatoria',
  standalone: true,
  templateUrl: './agregar-fiscalia-distribucion-aleatoria.component.html',
  styleUrls: ['./agregar-fiscalia-distribucion-aleatoria.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    NotaInfoDistribucionComponent,
    TableModule,
    InputSwitchModule,
  ],
})
export class AgregarFiscaliaDistribucionAleatoriaComponent implements OnInit {
  distritoFiscal: MaestroGenerico[] = [];
  tipoEspecialidad: MaestroGenerico[] = [];
  especialidad: MaestroGenerico[] = [];
  fiscalias: MaestroGenerico[] = [];
  distrito: MaestroGenerico[] = [];
  turnoDespachos: any[] = [];
  dependenciaActual: any;

  despachoFiscalList: any[] = [];
  despachoFiscalItem: any;

  despachoTurnoList: any[] = [];

  estadosOptions: any[] = [];
  consideraTurnoOptions: any[] = [];
  dataGrupoAleatorio: any[] = [];
  idDistritoFiscal: any;
  idTipoDistribucion: any; //2 por fiscal; 1 por despacho
  tareaForm: string = 'Agregar';
  public subscriptions: Subscription[] = [];
  error: any;
  edicion = false;
  validateFiscalia = false;
  //notaCambios: boolean = false
  cols: any[] = [];
  //dataCols: any[] = [];
  editar: boolean;
  switch: boolean = true;
  public refModal: DynamicDialogRef;
  form: FormGroup;
  formFiscalia: FormGroup;
  //bNotaFiscaliaDuplicado: boolean = false
  bnotaAlMenosUnActivo: boolean = false;
  //notaRegistroActivo;
  //notaAlMenosUnActivo;
  //notaCambiaEspecialidad;
  //notaFiscaliaDuplicado;
  public mostrarNotas: any;
  sedeLst: SedeDTOB[] = [];

  constructor(
    public ref: DynamicDialogRef,
    private readonly fb: FormBuilder,
    private readonly grupoAleatorioService: GrupoAleatorioService,
    public dialogService: DialogService,
    private readonly maestrosService: MaestroService,
    public config: DynamicDialogConfig,
    private readonly spinner: NgxSpinnerService,
    private readonly configurarMasDeUnaFiscaliaService: ConfigurarMasDeUnaFiscaliaService,
  ) {
    this.formFiscalia = this.fb.group({
      idDistritoFiscal: [null],
      idTipoEspecialidad: [null],
      idEspecialidad: [null],
      idDistrito: [null],
      idFiscalia: [null],
      coVSede: [null],
    });

    this.form = this.fb.group({
      switchFical: [true],
      switchDespacho: [true],
    });
  }

  ngOnInit() {
    this.mostrarNotas = {
      duplicado: false,
      cambia: false,
      activa: false,
      minimo: false,
    };

    this.despachoFiscalItem = this.config.data?.dataDespacho;
    console.log("this.despachoFiscalItem:",this.despachoFiscalItem)
    this.editar = this.config?.data.editar;

    this.loadTipoEspecialidad();
    this.loadDistrito();
    this.loadDistritoFiscal();
    this.loadEspecialidad(this.despachoFiscalItem?.idTipoEspecialidad);

    this.dataGrupoAleatorio = this.config.data.dataGrupoAleatorio;
    this.despachoFiscalList = this.config?.data
      ? this.config.data.dataDespacho
      : null;
    this.idTipoDistribucion = this.config.data?.idTipoDistribucion;

    this.idDistritoFiscal = this.despachoFiscalItem?.idDistritoFiscal;
    this.getSedeLstXDF(this.idDistritoFiscal);
    this.formFiscalia.controls['coVSede'].setValue(
      this.despachoFiscalItem?.coVSede
    );

    this.distritoFiscal = this.despachoFiscalItem?.nombreDistritoFiscal;

    this.formFiscalia.controls['idDistritoFiscal'].setValue(
      this.despachoFiscalItem?.idDistritoFiscal
    );

    this.tipoEspecialidad = this.despachoFiscalItem?.nombretipoEspecialidad;

    this.formFiscalia.controls['idTipoEspecialidad'].setValue(
      this.despachoFiscalItem?.idTipoEspecialidad
    );

    this.especialidad = this.despachoFiscalItem?.nombreEspecialidad;

    this.formFiscalia.controls['idEspecialidad'].setValue(
      this.despachoFiscalItem?.idEspecialidad
    );

    this.distrito = this.despachoFiscalItem?.distrito;

    this.formFiscalia.controls['idDistrito'].setValue(
      this.despachoFiscalItem?.idDistrito
    );

    this.formFiscalia.controls['idFiscalia'].setValue(
      this.despachoFiscalItem?.codigoFiscalia
    );

    this.estadosOptions = [
      { id: 1, nombre: 'Activo' },
      { id: 0, nombre: 'Inactivo' },
    ];
    this.consideraTurnoOptions = [
      { id: 1, nombre: 'Si' },
      { id: 0, nombre: 'No' },
    ];

    if (this.editar) {
      this.tareaForm = 'Editar';
      this.despachoTurnoList = this.despachoFiscalItem;
      this.turnoDespachos = this.despachoFiscalItem.despachos;
      this.formFiscalia.controls['idDistritoFiscal'].disable();
      this.formFiscalia.controls['idTipoEspecialidad'].disable();
      this.formFiscalia.controls['idEspecialidad'].disable();
      this.formFiscalia.controls['idFiscalia'].disable();
    }

    //this.getFiscaliasXDF();
    this.getFiscaliasXDFSedeTipoYEspecialidad();
  }

  verificarFiscaliaDuplicada() {
    let result = false;

    this.despachoTurnoList?.forEach((fiscalia, idx) => {
      let idFiscalia = fiscalia.codigoFiscalia;
      this.dataGrupoAleatorio.forEach((fiscaliaG, idx) => {
        if (idFiscalia == fiscaliaG?.codigoFiscalia) {
          result = true;
        }
      });
    });

    return result;
  }

  actualizaEstado(item: any, event: any) {
    item.estado = event.checked;
  }

  //se cambia y ahora se debe usar getFiscaliasXDFSedeTipoYEspecialidad()
  /*getFiscaliasXDF() {
    this.subscriptions.push(
      this.grupoAleatorioService.getFiscaliasXDF(this.idDistritoFiscal)
        .subscribe({
          next: (resp) => {
            this.fiscalias = resp;
            this.dependenciaActual = this.fiscalias.find(
              (x) => x.id == this.despachoFiscalItem?.codigoFiscalia
            );
          },
        })
    );
  }*/

  getFiscaliasXDFSedeTipoYEspecialidad() {
    const request = {
      idDistritoFiscal: this.formFiscalia.controls['idDistritoFiscal'].value,
      coSede: this.formFiscalia.controls['coVSede'].value,
      idTipoEspecialidad: this.formFiscalia.controls['idTipoEspecialidad'].value,
      idEspecialidad: this.formFiscalia.controls['idEspecialidad'].value
    };

    this.spinner.show();
    this.subscriptions.push(
      this.grupoAleatorioService.getFiscaliasXDFSedeTipoYEspecialidad(request)
        .subscribe({
          next: (resp) => {
            this.fiscalias = resp;
            this.dependenciaActual = this.fiscalias.find(
              (x) => x.id == this.despachoFiscalItem?.codigoFiscalia
            );
            this.spinner.hide();
          },
          error: (err) => {
            this.spinner.hide();
            this.error = err;
            console.error('Error al obtener fiscalías por especialidad:', err);
          }
        })
    );
  }

  get validaFiscalia() {
    return true;
  }

  onChangeFiscalia(event: any) {
    this.mostrarNotas.activa = false;
    this.mostrarNotas.duplicado = false;
    if (!this.editar) this.validateFiscalia = true;
    const codigoFiscalia = event.value;

    this.subscriptions.push(
      this.grupoAleatorioService
        .obtenerDespachosPorCodigoEntidad(codigoFiscalia)
        .subscribe({
          next: (resp) => {
            this.despachoTurnoList = resp;
            if (!this.editar) this.turnoDespachos = resp[0]?.despachos;
            if (this.despachoTurnoList?.length) this.mostrarNotas.activa = true;

            this.mostrarNotas.duplicado = false;
          },
          error: (err) => {
            this.error = err;
            console.error('Error al obtener grupos aleatorios:', err);
          },
        })
    );
  }

  onChangeDistritoFiscal(idNDistritoFiscal: number) {
    this.comunicarSiCambiaRegistroPrevio();

    //actualizamos sede
    this.getSedeLstXDF(idNDistritoFiscal)

    //actualizamos fiscalia
    this.getFiscaliasXDFSedeTipoYEspecialidad();

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

  onChangeSede(coVSede:string) {
    //actualizamos fiscalia
    this.getFiscaliasXDFSedeTipoYEspecialidad();
  }

  onChangeTipoEspecialidad($event) {
    this.loadEspecialidad($event.value);
    this.comunicarSiCambiaRegistroPrevio();

    //actualizamos fiscalia
    this.getFiscaliasXDFSedeTipoYEspecialidad();
  }

  onChangeEspecialidad(){
    this.comunicarSiCambiaRegistroPrevio();

    //actualizamos fiscalia
    this.getFiscaliasXDFSedeTipoYEspecialidad();
  }

  //muestra mensaje si se cambia idDistritoFiscal tipoEspecialidad o especialidad
  comunicarSiCambiaRegistroPrevio() {
    if (
      !(
        this.idDistritoFiscal ==
          this.formFiscalia.controls['idDistritoFiscal']?.value &&
        this.tipoEspecialidad ==
          this.formFiscalia.controls['tipoEspecialidad']?.value &&
        this.especialidad == this.formFiscalia.controls['especialidad']?.value
      )
    )
      this.mostrarNotas.cambia = true; //this.notaCambios = true
  }

  cambiaEstados(item: any, obj: any) {
    if (item.estado != obj.value) this.validateFiscalia = true;

    item.estado = obj.value;
  }

  cambiaTurnos(item: any, obj: any) {
    if (item.consideraTurno != obj.value) this.validateFiscalia = true;

    item.consideraTurno = obj.value;
  }

  getConsideraTurno(valor: any): string {
    return this.consideraTurnoOptions.find((x) => x.id == valor).nombre;
  }

  getEstado(valor: number): string {
    return this.estadosOptions.find((x) => x.id == valor).nombre;
  }

  public close(): void {
    this.ref.close(null);
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  AgregarFiscalia() {
    console.log('Entra a guardar fiscalia');
    if (!this.editar && this.verificarFiscaliaDuplicada()) {
      this.mostrarNotas.duplicado = true;
    } else if (this.verificarAlMenosUnActivo()) {
      this.ref.close(this.despachoTurnoList);
    } else {
      this.bnotaAlMenosUnActivo = true;
    }
    console.log('Fin guardar fiscalia');
  }

  private verificarAlMenosUnActivo(): boolean {
    let estados = [];

    if (this.editar) {
      if (this.idTipoDistribucion == CODIGO_TIPO_DISTRIBUCION.POR_DESPACHO) {
        this.despachoTurnoList['despachos'].forEach((despacho, idx) => {
          estados.push(despacho?.estado);
        });
      } else if (
        this.idTipoDistribucion == CODIGO_TIPO_DISTRIBUCION.POR_FISCAL
      ) {
        this.despachoTurnoList['despachos'].forEach((despacho, idx) => {
          despacho?.fiscales.forEach((fiscal, idx) => {
            estados.push(fiscal?.estado);
          });
        });
      }
    } else if (
      this.idTipoDistribucion == CODIGO_TIPO_DISTRIBUCION.POR_DESPACHO
    ) {
      this.despachoTurnoList?.forEach((fiscalia, idx) => {
        fiscalia?.despachos.forEach((despacho, idx) => {
          estados.push(despacho?.estado);
        });
      });
    } else if (this.idTipoDistribucion == CODIGO_TIPO_DISTRIBUCION.POR_FISCAL) {
      this.despachoTurnoList?.forEach((fiscalia, idx) => {
        fiscalia?.despachos.forEach((despacho, idx) => {
          despacho?.fiscales.forEach((fiscal, idx) => {
            estados.push(fiscal?.estado);
          });
        });
      });
    }

    return estados.some((estado) => estado == 1); // 1 es activo
  }

  private loadTipoEspecialidad(): void {
    this.maestrosService.listarTipoEspecialidad().subscribe({
      next: (response) => {
        this.tipoEspecialidad = response.data;

        if (this.config.data?.tipoEspecialidad != undefined) {
          this.formFiscalia.controls['idTipoEspecialidad'].setValue(
            this.getIdTipoEspecialidad(this.config.data?.tipoEspecialidad)
          );
        }
      },
    });
  }

  private loadEspecialidad(tipoEspecialidad: string): void {
    this.maestrosService.listarEspecialidadPorTipo(tipoEspecialidad).subscribe({
      next: (response) => {
        this.especialidad = response.data;

        if (this.especialidad.length > 0) {
          if (this.config.data?.especialidad != undefined) {
            this.formFiscalia.controls['idEspecialidad'].setValue(
              this.getIdEspecialidad(this.config.data?.especialidad)
            );
          }
        }
      },
    });
  }

  private loadDistrito(): void {
    this.maestrosService.listarEspecialidad().subscribe({
      next: (response) => {
        this.distrito = response.data;

        if (this.config.data?.fiscalia != undefined) {
          this.formFiscalia.controls['idFiscalia'].setValue(
            this.getIdFiscalia(this.config.data?.fiscalia)
          );
        }
      },
    });
  }

  private loadDistritoFiscal(): void {
    this.maestrosService.listarDistritosFiscalesActivos().subscribe({
      next: (response) => {
        this.distritoFiscal = response;

        if (this.config.data?.distritoFiscal != undefined) {
          this.formFiscalia.controls['idDistritoFiscal'].setValue(
            this.getIdDistritoFiscal(this.config.data?.distritoFiscal)
          );
        }
      },
    });
  }

  public getIdTipoEspecialidad(nombre: string): string {
    return this.tipoEspecialidad.find((x) => x.nombre == nombre).id;
  }

  public getIdEspecialidad(nombre: string): string {
    return this.especialidad.find((x) => x.nombre == nombre).codigo;
  }

  public getIdDistritoFiscal(nombre: string): string {
    return this.distritoFiscal.find((x) => x.nombre == nombre).id;
  }

  public getIdFiscalia(nombre: string): string {
    return this.distrito.find((x) => x.nombre == nombre).id;
  }

  public confirmarGuardarFiscalia(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'REGISTRAR FISCALÍA INGRESADA',
        confirm: true,
        description:
          'A continuación, se procederá a <b>registrar la “' +
          this.dependenciaActual.nombre +
          '”</b> con los datos ingresados.¿Esta seguro de realizar esta acción?',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.guardadoSatisfactorio();
        }
      },
    });

    this.ref.close();
  }

  public guardadoSatisfactorio(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'succes',
        title: 'REGISTRO REALIZADO CORRECTAMENTE',
        description:
          'El registro de la información de la "' +
          this.dependenciaActual.nombre +
          '" fue realizado exitosamente.',
        confirmButtonText: 'Listo',
      },
    });
  }
}
