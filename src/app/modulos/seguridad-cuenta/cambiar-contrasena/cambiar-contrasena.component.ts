import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ComunDialogService } from '@services/dialog/comun-dialog.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { SeguridadCuentaService } from '@services/seguridad-cuenta/seguridad-cuenta.service';
import {
  IProgress,
  ISegPasswordRequest,
  ISegUpdatePasswordRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import * as bcrypt from 'bcryptjs';
import { noSpacesValidator } from 'src/app/shared/validators/form.validator';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { Subscription } from 'rxjs';
import UAParser from 'ua-parser-js';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    PasswordModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    ProgressBarModule,
  ],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.scss'],
  providers: [MessageService, DynamicDialogRef],
})
export class CambiarContrasenaComponent implements OnInit {
  private suscripcionMostrarDialogo: Subscription;
  private suscripcionOcultarDialogo: Subscription;
  public visible: boolean;
  public usuarioActual;
  public formularioContrasena: FormGroup;
  public refModal: DynamicDialogRef;
  public navegador: string;
  public tipoDispositivo: string;
  public nombreSO: string;
  public versionSO: string;

  public valoresProgreso: IProgress = {
    number: 0,
    color: '',
    text: '',
    success: false,
  };

  // Regexs
  private regexMinLongitud = /^.{8,}$/; // Longitud mínima de 8 caracteres
  private regexMayuscula = /[A-Z]/; // Al menos una letra mayúscula
  private regexMinuscula = /[a-z]/; // Al menos una letra minúscula
  private regexNumero = /\d/; // Al menos un dígito
  private regexCaracterEspecial = /[\W_]/; // Al menos un carácter especial o subrayado

  objetoFormulario = {
    controlContrasenaActual: new FormControl('', [
      Validators.required,
      noSpacesValidator,
    ]),
    controlNuevaContrasena: new FormControl('', [
      Validators.required,
      noSpacesValidator,
    ]),
    controlRepetirNuevaContrasena: new FormControl('', [
      Validators.required,
      noSpacesValidator,
    ]),
  };

  constructor(
    private seguridadCuentaService: SeguridadCuentaService,
    private messageService: MessageService,
    private dialogService: DialogService,
    public dialogComunService: ComunDialogService
  ) {
    this.formularioContrasena = new FormGroup(this.objetoFormulario);

    this.suscribirMostrarDialogo();
    this.suscribirOcultarDialogo();

    const parser = new UAParser();
    const resultado = parser.getResult();
    this.navegador = resultado.browser.name;
    this.tipoDispositivo = resultado.device.type || 'desktop';
    this.nombreSO = resultado.os.name;
    this.versionSO = resultado.os.version;
  }

  ngOnInit(): void {
    this.campoNuevaContrasena.valueChanges.subscribe((password: string) =>
      // Validacion para verificar el nivel de seguridad de la nueva contraseña
      this.manejarNuevaContrasena(password)
    );
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
        if (!params || params.tipoModal !== 'cambiarContrasena') return;
        this.visible = true;
        this.usuarioActual = params.usuario;
      });
  }

  private suscribirOcultarDialogo() {
    this.suscripcionOcultarDialogo =
      this.dialogComunService.hideDialog$.subscribe(() => {
        this.visible = false;
        this.formularioContrasena.reset();
      });
  }

  public manejarNuevaContrasena(password: string): void {
    console.log('Evalua validadores');
    this.evaluarContrasena(password);
  }

  public enviarCambioContrasena(): void {
    // 1. Validacion para verificar si los campos han sido llenados
    console.log('Primera validacion: ', this.formularioContrasena.valid);
    if (this.formularioContrasena.valid) {
      // 2. Validacion para verificar semejanza entre las contraseñas
      this.validarContrasenas();
    }
    this.formularioContrasena.markAllAsTouched();
  }

  private validarContrasenas() {
    if (this.campoContrasenaActual.value === this.campoNuevaContrasena.value) {
      // mostrando mensaje de error en el segundo input
      this.campoNuevaContrasena.setErrors({ sameAsCurrent: true });
    } else if (
      this.campoNuevaContrasena.value !== this.campoRepetirNuevaContrasena.value
    ) {
      // mostrando mensaje de error en el tercer input
      this.campoRepetirNuevaContrasena.setErrors({ passwordsDoNotMatch: true });
    } else {
      this.verificarContrasenaActual();
    }
  }

  private verificarContrasenaActual() {
    if (!this.usuarioActual) return;

    // 3. Validacion para verificar si la contraseña anterior es correcta
    const datosSolicitud: ISegPasswordRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      password: this.campoContrasenaActual?.value,
    };
    this.seguridadCuentaService
      .verifyCurrentPassword(datosSolicitud)
      .subscribe({
        next: (res: boolean) => {
          if (res === true) {
            // actualizando contraseña
            this.confirmarMensajeGuardado();
          }
          if (res === false) {
            this.messageService.add({
              severity: 'error',
              summary: 'error',
              detail: 'Contraseña incorrecta',
            });
            // mostrando mensaje de error en el primer input
            this.campoContrasenaActual.setErrors({ incorrectPassword: true });
          }
        },
        error: (err: string | any) => {
          console.error('Error en la solicitud [getPassword]: ', err);
        },
      });
  }

  private confirmarMensajeGuardado() {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'question',
        confirm: true,
        title: 'CAMBIAR CONTRASEÑA',
        description:
          'A continuación, se procederá a cambiar la contraseña. ¿Está seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
      },
    });
    this.refModal.onClose.subscribe((result) => {
      if (result === 'confirm') {
        this.actualizarContrasena();
      }
    });
  }

  private actualizarContrasena(): void {
    // Genera un salt
    const salt = bcrypt.genSaltSync(10);
    // Encripta la cadena
    const passwordEncrypted = bcrypt.hashSync(
      this.campoNuevaContrasena?.value,
      salt
    );

    const datosSolicitud: ISegUpdatePasswordRequest = {
      codigoUserName: this.usuarioActual?.usuario,
      password: passwordEncrypted,
      dispositivo: this.tipoDispositivo,
      sistemaOperativo: this.nombreSO + ' ' + this.versionSO,
      navegador: this.navegador,
    };
    this.seguridadCuentaService.updatePassword(datosSolicitud).subscribe({
      next: () => {
        this.mensajeExitoGuardado('success');
        this.ocultarDialogo();
      },
      error: (err: string | any) => {
        console.error('Error en la solicitud [updatePassword]: ', err);
      },
    });
  }

  private mensajeExitoGuardado(icon: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'CONTRASEÑA CAMBIADA CORRECTAMENTE',
        description: 'El cambio de la contraseña, se realizó de forma exitosa.',
        confirmButtonText: 'Listo',
      },
    });
  }

  private evaluarContrasena(password: string): void {
    // 1) Si está vacío o sólo espacios, reinicia y limpia errores
    if (!password || !password.trim()) {
      this.valoresProgreso = {
        number: 0,
        color: '',
        text: '',
        success: false,
      };
      // Limpiamos errores si existían
      this.campoNuevaContrasena.setErrors(null);
      return;
    }

    // 2) Valida primero que tenga mínimo 8 caracteres
    if (!this.regexMinLongitud.test(password)) {
      // Si no cumple longitud => Bloquea inmediatamente
      this.valoresProgreso = {
        number: 20,
        color: 'red',
        text: 'Longitud insuficiente (mín. 8)',
        success: false,
      };
      this.campoNuevaContrasena.setErrors({
        passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
      });
      return; // Salir sin seguir calculando “score”
    }

    // 3) Si ya cumple el mínimo de 8, sumamos “score” por cada condición extra
    let score = 0;
    // conditions
    score++; // Por la longitud mínima
    // if (this.regexMinLongitud.test(password)) score++;
    if (this.regexMayuscula.test(password)) score++;
    if (this.regexMinuscula.test(password)) score++;
    if (this.regexNumero.test(password)) score++;
    if (this.regexCaracterEspecial.test(password)) score++;

    // En caso de que el usuario borre la contraseña o esté vacía
    if (password.trim() === '') {
      this.valoresProgreso = {
        number: 0,
        color: '',
        text: '',
        success: false,
      };
      // Limpiamos errores si existían
      this.campoNuevaContrasena.setErrors(null);
      return;
    }

    // 4) Lógica de “seguridad”
    if (score === 1 && password !== '') {
      this.valoresProgreso = {
        number: 25,
        color: 'red',
        text: 'Baja',
        success: false,
      };
      // bloqueamos si está en "Baja"
      this.campoNuevaContrasena.setErrors({
        passwordWeak: 'La contraseña es demasiado débil',
      });
    } else if (score >= 2 && score <= 3 && password !== '') {
      this.valoresProgreso = {
        number: 55,
        color: 'orange',
        text: 'Media',
        success: true,
      };
      // bloqueamos si está en "Baja"
      this.campoNuevaContrasena.setErrors({
        passwordWeak: 'La contraseña es demasiado débil',
      });
    } else if (score >= 4 && score < 5 && password !== '') {
      this.valoresProgreso = {
        number: 80,
        color: 'green',
        text: 'Alta',
        success: true,
      };
      // Quitamos el error para permitir enviar el formulario
      this.campoNuevaContrasena.setErrors(null);
    } else if (score === 5 && password !== '') {
      this.valoresProgreso = {
        ...this.valoresProgreso,
        number: 100,
      };
      // Quitamos el error para permitir enviar el formulario
      this.campoNuevaContrasena.setErrors(null);
    } else {
      this.valoresProgreso = {
        number: 0,
        color: '',
        text: '',
        success: false,
      };
    }
  }

  public ocultarDialogo() {
    this.dialogComunService.hideDialog({});
  }

  get campoContrasenaActual(): AbstractControl {
    return this.formularioContrasena.get('controlContrasenaActual');
  }
  get campoNuevaContrasena(): AbstractControl {
    return this.formularioContrasena.get('controlNuevaContrasena');
  }
  get campoRepetirNuevaContrasena(): AbstractControl {
    return this.formularioContrasena.get('controlRepetirNuevaContrasena');
  }
}
