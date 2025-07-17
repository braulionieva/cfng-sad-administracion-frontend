import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { SeguridadCuentaService } from '@services/seguridad-cuenta/seguridad-cuenta.service';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import {
  ISegGenerateCode,
  ISegGenerateCodeRequest,
  ISegValidateCode,
  ISegValidateCodeRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { InputNumberModule } from 'primeng/inputnumber';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-validacion-correo',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
  ],
  templateUrl: './validacion-correo.component.html',
  styleUrls: ['./validacion-correo.component.scss'],
  providers: [MessageService, DynamicDialogRef],
})
export class ValidacionCorreoComponent implements OnInit {
  @Output() onValidarCorreoEstado = new EventEmitter<any>();
  private suscripcionMostrarDialogo: Subscription;
  private suscripcionOcultarDialogo: Subscription;
  public visible: boolean;
  public usuarioActual;
  public refModal: DynamicDialogRef;
  public tituloModal: string = '';
  public tipoCorreo: 'personal' | 'institucional';
  public correo: string | null;
  public mostrarSeccionIngresarCodigo: boolean;
  public cuentaRegresiva: string | null;
  public codigoError: string | null;
  private informacionDispositivo;

  codigoValidacion = new FormControl(null, [Validators.required]);

  constructor(
    private seguridadCuentaService: SeguridadCuentaService,
    private messageService: MessageService,
    private dialogService: DialogService,
    public dialogComunService: ComunDialogService
  ) {
    this.suscribirMostrarDialogo();
    this.suscribirOcultarDialogo();
  }

  ngOnInit(): void {
    this.codigoValidacion.valueChanges.subscribe(() => {
      this.codigoError = null;
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
        if (!params || params.tipoModal !== 'validacion-correo') return;

        let titulo: string | null = null;

        if (params.correoData.tipoCorreo === 'personal') {
          titulo = 'correo personal';
        } else if (params.correoData.tipoCorreo === 'institucional') {
          titulo = 'correo institucional';
        }

        this.visible = true;
        this.usuarioActual = params.usuario;
        this.tituloModal = titulo;
        this.correo = params.correoData.correo;
        this.tipoCorreo = params.correoData.tipoCorreo;
        this.informacionDispositivo = params.informacionDispositivo;
      });
  }

  private suscribirOcultarDialogo() {
    this.suscripcionOcultarDialogo =
      this.dialogComunService.hideDialog$.subscribe(() => {
        this.visible = false;
        this.resetearConfig();
      });
  }

  public onValidarCorreo() {
    this.generarCodigoValidacion();
  }

  public generarCodigoValidacion(): void {
    if (!this.correo) return;
    const datosSolicitud: ISegGenerateCodeRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      correoValidar: this.correo,
      nombre: this.usuarioActual?.fiscal,
    };

    this.seguridadCuentaService
      .generarCodigoValidacion(datosSolicitud)
      .subscribe({
        next: (res: ISegGenerateCode) => {
          if (res?.data === true) {
            this.mostrarSeccionIngresarCodigo = true;
            this.messageService.add({
              severity: 'success',
              summary: 'success',
              detail: `Código enviado a su correo ${this.tipoCorreo}`,
            });
            this.iniciarCuentaRegresiva();
          }
          if (res?.data === false) {
            this.mostrarSeccionIngresarCodigo = false;
            this.messageService.add({
              severity: 'error',
              summary: 'error',
              detail: `El código no ha podido ser enviado a su correo ${this.tipoCorreo}`,
            });
          }
        },
        error: (err) => {
          console.error(
            'Error en la solicitud [generarCodigoValidacion]: ',
            err
          );
          this.mostrarSeccionIngresarCodigo = false;
        },
      });
  }

  public validarCodigo(): void {
    if (!this.usuarioActual && !this.codigoValidacion.valid) return;

    let tipoCorreoValue: string | null = null;

    if (this.tipoCorreo === 'personal') {
      tipoCorreoValue = '2';
    } else if (this.tipoCorreo === 'institucional') {
      tipoCorreoValue = '1';
    }

    const datosSolicitud: ISegValidateCodeRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      codigoValidacion: this.codigoValidacion.value,
      correoValidar: this.correo,
      dispositivo: this.informacionDispositivo.tipoDispositivo,
      sistemaOperativo:
        this.informacionDispositivo.nombreSO +
        ' ' +
        this.informacionDispositivo.versionSO,
      navegador: this.informacionDispositivo.navegador,
      /**tipoCorreo:
        this.tipoCorreo === 'personal'
          ? '2'
          : this.tipoCorreo === 'institucional'
          ? '1'
          : null,**/
      tipoCorreo: tipoCorreoValue,
    };

    this.seguridadCuentaService.validarCodigo(datosSolicitud).subscribe({
      next: (res: ISegValidateCode) => {
        if (res.data === true) {
          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Correo validado',
              description: 'Se validó el correo correctamente',
              confirmButtonText: 'Listo',
            },
          });
          this.manejarOcultar();
          this.onValidarCorreoEstado.emit(this.tipoCorreo);
        }
        if (res.data === false) {
          this.messageService.add({
            severity: 'error',
            summary: 'error',
            detail: `Código inválido`,
          });
          this.codigoError =
            'El código ingresado no es válido, por favor intentelo nuevamente';
        }
      },
      error: (err) => {
        console.error('Error en la solicitud [validarCodigo]: ', err);
      },
    });
  }

  public iniciarCuentaRegresiva() {
    this.cuentaRegresiva = '01:00';
    let tiempoRestante = 60; // 60 segundos para 1 minuto
    this.cuentaRegresiva = this.formatTiempo(tiempoRestante);

    // Usamos setInterval para actualizar la cuenta regresiva cada segundo
    const intervalId = setInterval(() => {
      tiempoRestante -= 1;
      this.cuentaRegresiva = this.formatTiempo(tiempoRestante);

      // Si el tiempo llega a 0, detenemos el intervalo
      if (tiempoRestante <= 0) {
        clearInterval(intervalId);
        this.cuentaRegresiva = '00:00';
      }
    }, 1000);
  }

  // Función auxiliar para formatear el tiempo en el formato MM:SS
  private formatTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${this.pad(minutos)}:${this.pad(segundosRestantes)}`;
  }

  // Función auxiliar para asegurar que los números siempre tengan dos dígitos
  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  private resetearConfig() {
    this.correo = null;
    this.mostrarSeccionIngresarCodigo = false;
    this.cuentaRegresiva = null;
    this.codigoError = null;
    this.codigoValidacion.setValue(null);
  }

  public manejarOcultar() {
    this.dialogComunService.hideDialog({});
  }
}
