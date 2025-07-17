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
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import { Subscription } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ISegListHValidationEmail,
  ISegPaginacionHValidationEmail,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { Table, TableModule } from 'primeng/table';
import { SeguridadCuentaService } from '@services/seguridad-cuenta/seguridad-cuenta.service';
import { saveAs } from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-historial-validacion-correo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    TableModule,
  ],
  templateUrl: './historial-validacion-correo.component.html',
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
export class HistorialValidacionCorreoComponent implements OnInit {
  @ViewChild('tableRef') myTable: Table;
  private suscripcionMostrarDialogo: Subscription;
  private suscripcionOcultarDialogo: Subscription;
  public visible: boolean;
  public usuarioActual;
  public indiceActivo: number = 1;
  public formularioFiltro: FormGroup;

  public fechaMinima: Date;

  public tituloModal: string = '';
  public tipoCorreo: 'personal' | 'institucional';
  public correo: string | null;

  public datosTabla: ISegListHValidationEmail[];
  public cargandoTabla: boolean = true;
  public filasTabla: number = 10;
  public registrosTotales: number;

  private objetoFormulario = {
    correoValidar: new FormControl(''),
    dispositivo: new FormControl(''),
    fechaInicio: new FormControl(null),
    fechaFin: new FormControl(null),
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

  //refactorizado
  private suscribirMostrarDialogo() {
    this.suscripcionMostrarDialogo =
      this.dialogComunService.showDialog$.subscribe((params) => {
        if (!params || params.tipoModal !== 'historialValidacionCorreo') return;

        let titulo = null;

        if (params.correoData.tipoCorreo === 'personal') {
          titulo = 'correos personales';
        } else if (params.correoData.tipoCorreo === 'institucional') {
          titulo = 'correos institucionales';
        }

        this.visible = true;
        this.usuarioActual = params.usuario;
        this.tituloModal = titulo;
        this.correo = params.correoData.correo;
        this.tipoCorreo = params.correoData.tipoCorreo;

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

  public obtenerListaHistorialValidacionCorreo(event: any) {
    if (!this.usuarioActual) return;

    this.cargandoTabla = true;
    const page = event?.first / event?.rows + 1;
    const size = event?.rows;

    const datosSolicitud = this.construirDatosSolicitudCorreo(page, size);

    this.seguridadCuentaService
      .getListHistoryValidationEmail(datosSolicitud)
      .subscribe({
        next: (res: ISegPaginacionHValidationEmail) => {
          this.datosTabla = res.registros;
          this.registrosTotales = res.totalElementos;
        },
        error: (err) => {
          console.error(
            'Error en la solicitud [ISegPaginacionHValidationEmail]: ',
            err
          );
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

    this.obtenerListaHistorialValidacionCorreo(resetEvent);
  }

  public limpiarFiltros() {
    this.formularioFiltro.reset();
    if (this.myTable) {
      this.myTable.reset();
    }
  }

  public descargarExcel() {
    if (this.datosTabla?.length <= 0 && !this.usuarioActual) return;

    const datosSolicitud = this.construirDatosSolicitudCorreo();

    this.seguridadCuentaService
      .getListaHistorialValidacionCorreoExcel(datosSolicitud)
      .subscribe({
        next: (resp) => {
          this.spinner.hide();
          saveAs(resp, 'HistorialValidacionEmail.xlsx');
        },
        error: (err) => {
          this.spinner.hide();
          console.error(
            'Error en la solicitud [getListaHistorialValidacionCorreoExcel]: ',
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

  // Método auxiliar para determinar el tipo de correo
  private determinarTipoCorreo(): string | null {
    switch (this.tipoCorreo) {
      case 'personal':
        return '2';
      case 'institucional':
        return '1';
      default:
        return null;
    }
  }

  // Método auxiliar para formatear fechas
  private formatearFecha(fecha: Date | null): string {
    return fecha ? formatDate(fecha, 'dd-MM-yyyy', 'en') : '';
  }

  // Método auxiliar para construir datos de solicitud
  private construirDatosSolicitudCorreo(page?: number, size?: number): any {
    const solicitudBase = {
      ...this.formularioFiltro.value,
      codigoUserName: this.usuarioActual?.usuario,
      fechaInicio: this.formatearFecha(this.campoFechaInicio.value),
      fechaFin: this.formatearFecha(this.campoFechaFin.value),
      tipoCorreo: this.determinarTipoCorreo(),
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

  get campoCorreoValidar(): AbstractControl {
    return this.formularioFiltro.get('correoValidar')!;
  }
  get campoDispositivo(): AbstractControl {
    return this.formularioFiltro.get('dispositivo')!;
  }
  get campoFechaInicio(): AbstractControl {
    return this.formularioFiltro.get('fechaInicio')!;
  }
  get campoFechaFin(): AbstractControl {
    return this.formularioFiltro.get('fechaFin')!;
  }
}
