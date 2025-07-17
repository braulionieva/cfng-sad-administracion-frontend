import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { AuthTwoComponent } from '@layouts/auth/auth-two.component';
import { PasswordModule } from 'primeng/password';
import { noSpacesValidator } from 'src/app/shared/validators/form.validator';
import { ProgressBarModule } from 'primeng/progressbar';
import { IProgress, ISegPasswordRequest, ISegUpdatePasswordRequest } from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { Auth2Service } from '@services/auth/auth2.service';
import { SeguridadCuentaService } from '@services/seguridad-cuenta/seguridad-cuenta.service';
import { Router } from '@angular/router';

import UAParser from 'ua-parser-js';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
    PasswordModule,
    ProgressBarModule,
  ],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['../../../../shared/layouts/auth/auth-two.component.scss'],
})
export class CambiarContrasenaComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly router: Router = inject(Router);

  public formularioContrasena: FormGroup;
  public navegador: string;
  public tipoDispositivo: string;
  public nombreSO: string;
  public versionSO: string;

  public usuarioActual;

  public valoresProgreso: IProgress = {
    number: 0,
    color: '',
    text: '',
    success: false,
  };

  // Regexs
  private readonly regexMinLongitud = /^.{8,}$/;      // Longitud mínima de 8 caracteres
  private readonly regexMayuscula = /[A-Z]/;          // Al menos una letra mayúscula
  private readonly regexMinuscula = /[a-z]/;          // Al menos una letra minúscula
  private readonly regexNumero = /\d/;                // Al menos un dígito
  private readonly regexCaracterEspecial = /[\W_]/;   // Al menos un carácter especial o subrayado

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
    private readonly authTwoComponent: AuthTwoComponent,
    private readonly userService: Auth2Service,
    private readonly seguridadCuentaService: SeguridadCuentaService,
  ) {
    this.formularioContrasena = new FormGroup(this.objetoFormulario);

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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioActual = this.userService.getUserInfo();
    }, 100);
  }

  public manejarNuevaContrasena(password: string): void {
    this.evaluarContrasena(password);
  }

  public enviarCambioContrasena(): void {
    // 1. Validacion para verificar si los campos han sido llenados
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
    // 3. Validacion para verificar si la contraseña anterior es correcta
    const datosSolicitud: ISegPasswordRequest = {
      codigoUserName: this.usuarioActual?.usuario.usuario,
      password: this.campoContrasenaActual?.value,
    };
    this.seguridadCuentaService
      .verifyCurrentPassword(datosSolicitud)
      .subscribe({
        next: (res: boolean) => {
          if (res === true) {
            // actualizando contraseña
            this.authTwoComponent.onToastMessage({ type: 'success', message: 'Contraseña cambiada correctamente' });
            this.router.navigate(['/auth/login']);
            this.actualizarContrasena();
          }
          if (res === false) {
            // mostrando mensaje de error en el primer input
            this.campoContrasenaActual.setErrors({ incorrectPassword: true });
          }
        },
        error: (err: string) => {
          console.error('Error en la solicitud [getPassword]: ', err);
        },
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
      codigoUserName: this.usuarioActual?.usuario.usuario,
      password: passwordEncrypted,
      dispositivo: this.tipoDispositivo,
      sistemaOperativo: this.nombreSO + ' ' + this.versionSO,
      navegador: this.navegador,
    };

    this.seguridadCuentaService.updatePassword(datosSolicitud).subscribe({
      next: () => { },
      error: (err: string) => {
        console.error('Error en la solicitud [updatePassword]: ', err);
      },
    });
  }

  private evaluarContrasena(password: string): void {
    let score = 0;
    // conditions
    if (this.regexMinLongitud.test(password)) score++;
    if (this.regexMayuscula.test(password)) score++;
    if (this.regexMinuscula.test(password)) score++;
    if (this.regexNumero.test(password)) score++;
    if (this.regexCaracterEspecial.test(password)) score++;

    if (score === 1 && password !== '') {
      this.valoresProgreso = {
        number: 25,
        color: 'red',
        text: 'Baja',
        success: false,
      };
    } else if (score >= 2 && score <= 3 && password !== '') {
      this.valoresProgreso = {
        number: 55,
        color: 'orange',
        text: 'Media',
        success: true,
      };
    } else if (score >= 4 && score < 5 && password !== '') {
      this.valoresProgreso = {
        number: 80,
        color: 'green',
        text: 'Alta',
        success: true,
      };
    } else if (score === 5 && password !== '') {
      this.valoresProgreso = {
        ...this.valoresProgreso,
        number: 100,
      };
    } else {
      this.valoresProgreso = {
        number: 0,
        color: '',
        text: '',
        success: false,
      };
    }
  }
 
  ngOnDestroy(): void {
    this.authTwoComponent.isCambiarContrasena = false;
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
