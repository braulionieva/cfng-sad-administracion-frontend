import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SeguridadCuentaService } from '@services/seguridad-cuenta/seguridad-cuenta.service';
import {
  ISegGenerateEmailCode,
  ISegGenerateEmailCodeRequest,
  ISegValidateEmailCode,
  ISegValidateEmailCodeRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-accion-correo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    DialogModule,
    ToastModule,
  ],
  templateUrl: './accion-correo.component.html',
  styleUrls: ['../../seguridad-cuenta.component.scss'],
  providers: [DynamicDialogRef],
})
export class AccionCorreoComponent implements OnInit {
  @Input() metodo: any;
  @Input() usuarioActual: any;
  @Input() informacionDispositivo: any;
  @Input() correo: string;
  @Output() codigoGenerado = new EventEmitter();
  @Output() codigoAccion = new EventEmitter();
  public codigoError: string | null;
  public refModal: DynamicDialogRef;

  codigoValidacion = new FormControl(null, [
    Validators.required,
    Validators.pattern(/^\d{6}$/),
  ]);

  constructor(
    private seguridadCuentaService: SeguridadCuentaService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.generarCodigoEmail();
  }

  public generarCodigoEmail() {
    const datosSolicitud: ISegGenerateEmailCodeRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      correoValidar: this.correo,
      nombre: this.usuarioActual?.fiscal,
    };
    this.seguridadCuentaService.generarCodigoEmail(datosSolicitud).subscribe({
      next: (res: ISegGenerateEmailCode) => {
        this.codigoGenerado.emit({
          estado: 'success',
          mensaje: 'Codigo generado',
        });
      },
      error: (err: string | any) => {
        console.error('Error en la solicitud [generarCodigoEmail]: ', err);
      },
    });
  }

  public onConfirmarCodigo() {
    this.validarCodigoEmail();
  }

  //refactorizado
  private validarCodigoEmail(): void {
    const datosSolicitud = this.crearDatosSolicitudValidacion();

    this.seguridadCuentaService.validarCodigoEmail(datosSolicitud).subscribe({
      next: (res: ISegValidateEmailCode) => {
        res.data
          ? this.procesarValidacionExitosa()
          : this.procesarValidacionFallida();
      },
      error: (err) => this.manejarErrorValidacion(err),
    });
  }

  private crearDatosSolicitudValidacion(): ISegValidateEmailCodeRequest {
    return {
      codigoUserName: this.usuarioActual?.usuario,
      codigoValidacion: this.codigoValidacion?.value || null,
      correoValidar: this.correo,
      dispositivo: this.informacionDispositivo.tipoDispositivo,
      sistemaOperativo: `${this.informacionDispositivo.nombreSO} ${this.informacionDispositivo.versionSO}`,
      navegador: this.informacionDispositivo.navegador,
      idMetodo2FA: this.metodo.idMetodo,
      estadoMetodo2FA: this.metodo.estadoMetodo ? '1' : '0',
    };
  }

  private procesarValidacionExitosa(): void {
    this.mostrarModalExito();
    const metodo = this.determinarMetodoCorreo();
    const accion = this.determinarAccionMetodo();
    this.codigoAccion.emit({ accion, metodo });
  }

  private mostrarModalExito(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Código confirmado',
        description: 'Se validó el código correctamente',
        confirmButtonText: 'Listo',
      },
    });
  }

  //refactorizado
  private determinarMetodoCorreo(): 'personal' | 'institucional' | null {
    if (this.correo.includes('@gmail.com')) {
      return 'personal';
    } else if (this.correo.includes('@mpfn.gob.pe')) {
      return 'institucional';
    } else {
      return null;
    }
  }

  /**private determinarMetodoCorreo(): 'personal' | 'institucional' | null {
    return this.correo.includes('@gmail.com')
      ? 'personal'
      : this.correo.includes('@mpfn.gob.pe')
      ? 'institucional'
      : null;
  }**/

  private determinarAccionMetodo(): 'activar' | 'desactivar' | null {
    return this.metodo.estadoMetodo ? 'desactivar' : 'activar';
  }

  private procesarValidacionFallida(): void {
    this.codigoGenerado.emit({
      estado: 'error',
      mensaje: 'Código inválido',
    });
    this.codigoError =
      'El código ingresado no es válido, por favor inténtelo nuevamente';
  }

  private manejarErrorValidacion(err: any): void {
    console.error('Error en la solicitud [validarCodigoEmail]: ', err);
  }
  //

  /**private validarCodigoEmail() {
    const datosSolicitud: ISegValidateEmailCodeRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      codigoValidacion: this.codigoValidacion?.value
        ? this.codigoValidacion.value
        : null,
      correoValidar: this.correo,
      dispositivo: this.informacionDispositivo.tipoDispositivo,
      sistemaOperativo:
        this.informacionDispositivo.nombreSO +
        ' ' +
        this.informacionDispositivo.versionSO,
      navegador: this.informacionDispositivo.navegador,
      idMetodo2FA: this.metodo.idMetodo,
      estadoMetodo2FA: this.metodo.estadoMetodo === true ? '1' : '0',
    };

    this.seguridadCuentaService.validarCodigoEmail(datosSolicitud).subscribe({
      next: (res: ISegValidateEmailCode) => {
        if (res.data === true) {
          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Código confirmado',
              description: 'Se validó el código correctamente',
              confirmButtonText: 'Listo',
            },
          });
          const metodo = this.correo.includes('@gmail.com')
            ? 'personal'
            : this.correo.includes('@mpfn.gob.pe')
            ? 'institucional'
            : null;
          const accion =
            this.metodo.estadoMetodo === true
              ? 'desactivar'
              : this.metodo.estadoMetodo === false
              ? 'activar'
              : null;
          this.codigoAccion.emit({ accion, metodo });
        }
        if (res.data === false) {
          this.codigoGenerado.emit({
            estado: 'error',
            mensaje: 'Codigo inválido',
          });
          this.codigoError =
            'El código ingresado no es válido, por favor intentelo nuevamente';
        }
      },
      error: (err: string | any) => {
        console.error('Error en la solicitud [validarCodigoEmail]: ', err);
      },
    });
  }**/
}
