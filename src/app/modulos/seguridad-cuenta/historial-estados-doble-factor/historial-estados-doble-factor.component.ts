import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { Table, TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { SeguridadCuentaService } from '@services/seguridad-cuenta/seguridad-cuenta.service';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  ISegListH2FA,
  ISegListHistory2FA,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-historial-estados-doble-factor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    TableModule,
  ],
  templateUrl: './historial-estados-doble-factor.component.html',
  styleUrls: ['../seguridad-cuenta.component.scss'],
  providers: [MessageService, DynamicDialogRef],
  animations: [
    trigger('stateFilter', [
      state(
        'collapsed',
        style({
          height: '0',
          padding: '0',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition(
        'expanded <=> collapsed',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
    ]),
  ],
})
export class HistorialEstadosDobleFactorComponent implements OnInit {
  @ViewChild('tableRef') myTable: Table;
  private suscripcionMostrarDialogo: Subscription;
  private suscripcionOcultarDialogo: Subscription;
  public visible: boolean;
  public usuarioActual;
  public indiceActivo: number = 1;
  public formularioFiltro: FormGroup;

  public fechaMinima: Date;

  public datosTabla: ISegListH2FA[];
  public cargandoTabla: boolean = true;
  public filasTabla: number = 10;
  public registrosTotales: number;

  public metodosDropdown: Array<any>;

  private objetoFormulario = {
    idMetodo2Fa: new FormControl(null),
    fechaInicio: new FormControl(null),
    fechaFin: new FormControl(null),
    dispositivo: new FormControl(''),
    activacion: new FormControl(false),
    desactivacion: new FormControl(false),
  };

  constructor(
    private seguridadCuentaService: SeguridadCuentaService,
    private messageService: MessageService,
    private dialogService: DialogService,
    public dialogComunService: ComunDialogService,
    private spinner: NgxSpinnerService
  ) {
    this.formularioFiltro = new FormGroup(this.objetoFormulario);

    this.suscribirMostrarDialogo();
    this.suscribirOcultarDialogo();
  }

  ngOnInit(): void {
    this.campoFechaInicio.valueChanges.subscribe((fecha: Date) => {
      this.fechaMinima = fecha;
      this.campoFechaFin.setValue(null);
    });
  }

  cierraAddAppModal() {
    this.closeModal();
  }

  protected closeModal() {
    this.visible = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  private suscribirMostrarDialogo() {
    this.suscripcionMostrarDialogo =
      this.dialogComunService.showDialog$.subscribe((params) => {
        if (!params || params.tipoModal !== 'historialEstados2FA') return;
        this.visible = true;
        this.usuarioActual = params.usuario;
        this.metodosDropdown = params.metodosDropdown;

        if (this.myTable) {
          this.myTable.reset();
        }
      });
  }

  private suscribirOcultarDialogo() {
    this.suscripcionOcultarDialogo =
      this.dialogComunService.hideDialog$.subscribe(() => {
        this.visible = false;
        this.formularioFiltro.reset();
      });
  }

  public obtenerListaHistorialEstados2FA(event: any) {
    if (!this.usuarioActual) return;

    this.cargandoTabla = true;
    const page = event?.first / event?.rows + 1;
    const size = event?.rows;
    const accionValor = this.determinarAccionValor();

    const datosSolicitud = this.construirDatosSolicitud(
      accionValor,
      page,
      size
    );

    this.seguridadCuentaService.getListHistory2FA(datosSolicitud).subscribe({
      next: (res: ISegListHistory2FA) => {
        this.datosTabla = res.registros;
        this.registrosTotales = res.totalElementos;
      },
      error: (err) => {
        console.error('Error en la solicitud [getListHistory2FA]: ', err);
      },
      complete: () => {
        this.cargandoTabla = false;
      },
    });
  }

  public aplicarFiltros() {
    // restableciendo paginacion y limpiando ordenaciones
    const resetEvent = {
      first: 0,
      rows: this.filasTabla,
      sortOrder: 1,
      sortField: null,
    };

    this.obtenerListaHistorialEstados2FA(resetEvent);
  }

  public limpiarFiltros() {
    this.formularioFiltro.reset();
    if (this.myTable) {
      this.myTable.reset();
    }
  }

  public descargarExcel() {
    if (this.datosTabla.length <= 0 && !this.usuarioActual) return;

    const accionValor = this.determinarAccionValor();
    const datosSolicitud = this.construirDatosSolicitud(accionValor);

    this.seguridadCuentaService
      .getListHistory2FAExcel(datosSolicitud)
      .subscribe({
        next: (resp) => {
          this.spinner.hide();
          saveAs(resp, 'Historial2FA.xlsx');
        },
        error: (err) => {
          this.spinner.hide();
          console.error(
            'Error en la solicitud [getListHistory2FAExcel]: ',
            err
          );
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error descargando el archivo Excel',
          });
        },
      });
  }

  // Método auxiliar para determinar el valor de acción
  private determinarAccionValor(): any {
    if (
      (this.campoActivacion.value === false &&
        this.campoDesactivacion.value === false) ||
      (this.campoActivacion.value === true &&
        this.campoDesactivacion.value === true)
    ) {
      return '';
    } else if (this.campoActivacion.value === true) {
      return '1';
    } else if (this.campoDesactivacion.value === true) {
      return '0';
    }
  }

  // Método auxiliar para formatear fechas
  private formatearFecha(fecha: Date | null): string {
    return fecha ? formatDate(fecha, 'dd-MM-yyyy', 'en') : '';
  }

  // Método auxiliar para construir datos de solicitud
  private construirDatosSolicitud(
    accionValor: string,
    page?: number,
    size?: number
  ): any {
    const { activacion, desactivacion, ...filtros } =
      this.formularioFiltro.value;

    const solicitudBase = {
      ...filtros,
      codigoUserName: this.usuarioActual?.usuario,
      fechaInicio: this.formatearFecha(this.campoFechaInicio.value),
      fechaFin: this.formatearFecha(this.campoFechaFin.value),
      accion: accionValor,
    };

    return page && size
      ? { ...solicitudBase, pagina: page, registrosPorPagina: size }
      : solicitudBase;
  }

  public alternarBotonFiltro(index: number) {
    if (this.indiceActivo === index) {
      this.indiceActivo = -1;
    } else {
      this.indiceActivo = index;
    }
  }

  public manejarOcultar() {
    this.dialogComunService.hideDialog({});
  }

  get campoIdMetodo2Fa(): AbstractControl {
    return this.formularioFiltro.get('idMetodo2Fa')!;
  }
  get campoFechaInicio(): AbstractControl {
    return this.formularioFiltro.get('fechaInicio')!;
  }
  get campoFechaFin(): AbstractControl {
    return this.formularioFiltro.get('fechaFin')!;
  }
  get campoDispositivo(): AbstractControl {
    return this.formularioFiltro.get('dispositivo')!;
  }
  get campoActivacion(): AbstractControl {
    return this.formularioFiltro.get('activacion')!;
  }
  get campoDesactivacion(): AbstractControl {
    return this.formularioFiltro.get('desactivacion')!;
  }
}
