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
  ISegGenerateGoogleAuthCode,
  ISegGenerateGoogleAuthCodeRequest,
  ISegValidateEmailCode,
  ISegValidateGoogleAuthCodeRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-accion-google',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
  ],
  templateUrl: './accion-google.component.html',
  styleUrls: ['../../seguridad-cuenta.component.scss'],
  providers: [DynamicDialogRef],
})
export class AccionGoogleComponent implements OnInit {
  @Input() metodo: any;
  @Input() usuarioActual: any;
  @Input() informacionDispositivo: any;
  @Output() codigoGenerado = new EventEmitter();
  @Output() codigoAccion = new EventEmitter();
  public codigoQR: string;
  public codigoError: string | null;
  public refModal: DynamicDialogRef;

  codigoValidacion = new FormControl(null, [
    Validators.required,
    // Validators.pattern(/^\d{6}$/),
    Validators.pattern(/^\d{5,6}$/),
  ]);

  constructor(
    private seguridadCuentaService: SeguridadCuentaService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.generarCodigoGoogleAuth();
    this.codigoValidacion.valueChanges.subscribe(() => {
      this.codigoError = null;
    });
  }

  private generarCodigoGoogleAuth() {
    const datosSolicitud: ISegGenerateGoogleAuthCodeRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      codMetodo2FA: this.metodo?.idMetodo,
      idUsuarioMetodo: this.metodo?.idUsuarioMetodo,
    };

    this.seguridadCuentaService
      .generarCodigoGoogleAuth(datosSolicitud)
      .subscribe({
        next: (res: ISegGenerateGoogleAuthCode) => {
          this.codigoGenerado.emit({
            estado: 'success',
            mensaje: 'Codigo generado',
          });
          this.codigoQR = res.qr;
        },
        error: (err: string | any) => {
          console.error(
            'Error en la solicitud [generarCodigoGoogleAuth]: ',
            err
          );
        },
      });
  }

  public onConfirmarCodigo() {
    this.validarCodigoGoogleAuth();
  }

  private validarCodigoGoogleAuth() {
    const datosSolicitud: ISegValidateGoogleAuthCodeRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      idMetodo2FA: this.metodo.idMetodo,
      estadoMetodo2FA: this.metodo.estadoMetodo === true ? '1' : '0',
      codigoValidacionQr: this.codigoValidacion?.value
        ? String(this.codigoValidacion.value)
        : null,
      dispositivo: this.informacionDispositivo.tipoDispositivo,
      sistemaOperativo:
        this.informacionDispositivo.nombreSO +
        ' ' +
        this.informacionDispositivo.versionSO,
      navegador: this.informacionDispositivo.navegador,
    };

    //refactorizado
    this.seguridadCuentaService
      .validarCodigoGoogleAuth(datosSolicitud)
      .subscribe({
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

            let accion = null; // Valor por defecto

            if (this.metodo.estadoMetodo === true) {
              accion = 'desactivar';
            } else if (this.metodo.estadoMetodo === false) {
              accion = 'activar';
            }

            this.codigoAccion.emit({ accion, metodo: 'google' });
          }

          if (res.data === false) {
            this.codigoGenerado.emit({
              estado: 'error',
              mensaje: 'Código inválido',
            });
            this.codigoError =
              'El código ingresado no es válido, por favor inténtelo nuevamente';
          }
        },
        error: (err: string | any) => {
          console.error(
            'Error en la solicitud [validarCodigoGoogleAuth]: ',
            err
          );
        },
      });

    /** this.seguridadCuentaService
       .validarCodigoGoogleAuth(datosSolicitud)
       .subscribe({
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
             const accion =
               this.metodo.estadoMetodo === true
                 ? 'desactivar'
                 : this.metodo.estadoMetodo === false
                 ? 'activar'
                 : null;
             this.codigoAccion.emit({ accion, metodo: 'google' });
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
           console.error(
             'Error en la solicitud [validarCodigoGoogleAuth]: ',
             err
           );
         },
       });**/
  }
}
