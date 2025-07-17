import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { NotaInfoComponent } from '@components/nota-info/nota-info.component';
import { EstadoDeNotificacionRequest } from '@interfaces/admin-estado-de-notificacion/estado-de-notificacion';
import { EstadoDeNotificacionService } from '@services/admin-estado-de-notificacion/estado-de-notificacion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-agregar-estado-de-notificacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    NotaInfoComponent,
  ],
  templateUrl: './agregar-estado-de-notificacion.component.html',
  styleUrls: ['./agregar-estado-de-notificacion.component.scss'],
})
export class AgregarEstadoDeNotificacionComponent implements OnInit {
  tipoLlamado: string = 'agregar';
  chkNotificacion: boolean = true;
  chkCitacion: boolean = false;
  chkAppNotificador: boolean = false;
  showChkAppNotificador: boolean = false;
  lblButtonSubmit: string = 'Guardar';

  public formularioEstado: FormGroup;
  public refModal: DynamicDialogRef;

  constructor(
    private readonly fb: FormBuilder,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly estadoService: EstadoDeNotificacionService,
    private readonly spinner: NgxSpinnerService,
    public readonly dialogService: DialogService
  ) {
    this.formularioEstado = this.fb.group({
      nombreEstado: new FormControl(this.config.data?.nombreEstado, [
        Validators.required,
        Validators.pattern(/^([a-z A-Z])*$/),
        Validators.minLength(2),
        Validators.maxLength(100),
      ]),
      genNotificaciones: new FormControl(
        this.config.data?.esGenNotificaciones,
        [
          Validators.pattern(/^([a-z A-Z])*$/),
          Validators.minLength(2),
          Validators.maxLength(100),
        ]
      ),
      genCitaciones: new FormControl(this.config.data?.esGenCitaciones, [
        Validators.pattern(/^([a-z A-Z])*$/),
        Validators.minLength(2),
        Validators.maxLength(100),
      ]),
      centNotificaciones: new FormControl(
        this.config.data?.esCenNotificaciones,
        [
          Validators.required,
          Validators.pattern(/^([a-z A-Z])*$/),
          Validators.minLength(2),
          Validators.maxLength(100),
        ]
      ),
      appNotificador: new FormControl(this.config.data?.esApp, [
        Validators.pattern(/^([a-z A-Z])*$/),
        Validators.minLength(2),
        Validators.maxLength(100),
      ]),
      observacion: new FormControl(this.config.data?.observacion, [
        Validators.required,
        Validators.pattern(/^([a-z A-Z])*$/),
        Validators.minLength(2),
        Validators.maxLength(300),
      ]),
      chkNotif: [null],
      chkCitac: [null],
      chkEditInApp: [null],
    });
  }

  ngOnInit() {
    if (this.config.data?.esGenNotificaciones != undefined) {
      this.chkNotificacion = true;
    }

    if (this.config.data?.esGenCitaciones != undefined) {
      this.chkCitacion = true;
    }

    if (this.config.data?.esApp != undefined) {
      this.showChkAppNotificador = this.config.data?.esApp.length >= 3;
      this.chkAppNotificador = this.config.data?.flagEditarApp == '1';
    }

    this.tipoLlamado = this.config.data?.tipo;
    if (this.tipoLlamado == 'agregar') {
      this.lblButtonSubmit = 'Registrar';
      this.formularioEstado.controls['nombreEstado'].enable();
    } else {
      this.formularioEstado.controls['nombreEstado'].disable();
    }

    if (this.chkNotificacion) {
      this.formularioEstado.controls['chkNotif'].setValue(true);
      this.formularioEstado.controls['genNotificaciones'].enable();
    } else {
      this.formularioEstado.controls['genNotificaciones'].setValue('');
      this.formularioEstado.controls['genNotificaciones'].disable();
    }

    if (this.chkCitacion) {
      this.formularioEstado.controls['genCitaciones'].enable();
    } else {
      this.formularioEstado.controls['genCitaciones'].setValue('');
      this.formularioEstado.controls['genCitaciones'].disable();
    }

    this.chkAppNotificador = this.config.data?.flagEditarApp === '1';
    this.formularioEstado.controls['chkEditInApp'].setValue(
      this.chkAppNotificador
    );
  }

  public getDescripcionTop(): any {
    return 'Tener en cuenta que los estados ingresados en estos campos son los que se mostrarán en los sistemas Generador de Notificaciones, Generador de Citaciones, Central de Notificaciones y Aplicativo Móvil Notificador.';
  }

  public close(): void {
    this.ref.close();
  }

  getTitulo(): string {
    return this.tipoLlamado == 'agregar' ? 'Nuevo Estado' : 'Editar Estado';
  }

  notOnChange(event: any): any {
    this.chkNotificacion = event.checked;
    if (this.chkNotificacion) {
      this.formularioEstado.controls['genNotificaciones'].setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]);
      this.formularioEstado.controls['genNotificaciones'].enable();
    } else {
      this.formularioEstado.controls['genNotificaciones'].setValidators(
        Validators.nullValidator
      );
      this.formularioEstado.controls['genNotificaciones'].setValue('');
      this.formularioEstado.controls['genNotificaciones'].disable();
    }
  }

  citOnChange(event: any): any {
    /**this.chkCitacion == event.checked;**/
    if (event.checked) {
      this.formularioEstado.controls['genCitaciones'].setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]);
      this.formularioEstado.controls['genCitaciones'].enable();
    } else {
      this.formularioEstado.controls['genCitaciones'].setValidators(
        Validators.nullValidator
      );
      this.formularioEstado.controls['genCitaciones'].setValue('');
      this.formularioEstado.controls['genCitaciones'].disable();
    }
  }

  editAppOnChange(event: any): any {
    this.chkAppNotificador = event.checked;
    this.formularioEstado.controls['chkEditInApp'].setValue(
      this.chkAppNotificador
    );
  }

  onkeyupEtiquetaApp(event: any): any {
    this.showChkAppNotificador = event.target.value.length >= 3;
  }

  onSubmit() {
    this.confirmarAccionEstadoCedula('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.llamarServicioAgregarEditarEstado();
        }
      },
    });
  }

  private confirmarAccionEstadoCedula(icon: string): void {
    const textoAccion =
      this.tipoLlamado == 'agregar'
        ? 'un nuevo <b>Estado para la Cédula</b> en el/los sistemas correspondientes'
        : 'los nuevos datos para el <b>estado de una cédula</b>';
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title:
          this.tipoLlamado == 'agregar' ? 'REGISTRAR ESTADO' : 'EDITAR ESTADO',
        confirm: true,
        description:
          'A continuación, se procederá a registrar ' +
          textoAccion +
          '.<br>¿Está seguro de realizar esta acción? ',
      },
    });
  }

  private llamarServicioAgregarEditarEstado(): void {
    if (this.tipoLlamado == 'agregar') {
      this.registrarEstado();
    } else {
      this.editarEstado();
    }
  }

  private registrarEstado(): void {
    this.spinner.show();
    const estado = this.obtenerEstado();
    this.estadoService.agregarEstado(estado).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.code == '0') {
          this.informarEstadoCedula(
            'success',
            'REGISTRO EXITOSO',
            'El <b>registro</b> del <b>estado de la Cédula</b>, para los sistemas indicados, ha sido realizado de forma exitosa.'
          );
        } else {
          this.informarEstadoCedula('error', 'ERROR', response.message);
        }

        this.ref.close(response.code);
      },
      error: (err) => {
        console.error('Error al crear el estado:', err);
      },
    });
  }

  private editarEstado(): void {
    this.spinner.show();
    const estado = this.obtenerEstado();
    this.estadoService.editarEstado(estado).subscribe({
      next: (response) => {
        this.spinner.hide();

        if (response.code == '0') {
          this.informarEstadoCedula(
            'success',
            'REGISTRO EXITOSO',
            'El registro de los nuevos datos del <b>estado de la cédula</b>, ha sido realizado de forma exitosa.'
          );
        } else {
          this.informarEstadoCedula('error', 'ERROR', response.message);
          this.spinner.show();
        }

        this.ref.close(response.code);
      },
      error: (err) => {
        this.spinner.show();
        console.error('Error al crear el estado:', err);
      },
    });
  }

  public informarEstadoCedula(
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

  private obtenerEstado(): EstadoDeNotificacionRequest {
    const data = {
      idEstadoCedula:
        this.config.data?.idEstadoCedula == undefined
          ? 0
          : this.config.data?.idEstadoCedula,
      esGenNotificaciones:
        this.formularioEstado.value.genNotificaciones == undefined
          ? ''
          : this.formularioEstado.value.genNotificaciones,
      esGenCitaciones:
        this.formularioEstado.value.genCitaciones == undefined
          ? ''
          : this.formularioEstado.value.genCitaciones,
      esCenNotificaciones:
        this.formularioEstado.value.centNotificaciones == undefined
          ? ''
          : this.formularioEstado.value.centNotificaciones,
      esApp:
        this.formularioEstado.value.appNotificador == undefined
          ? ''
          : this.formularioEstado.value.appNotificador,
      esGeneral: this.formularioEstado.value.nombreEstado,
      flagEditarApp: this.chkAppNotificador ? '1' : '0',
      observacion: this.formularioEstado.value.observacion,
      usuarioCreador: '44836273',
      usuarioModificador: '44836273',
    };
    return data;
  }
}
