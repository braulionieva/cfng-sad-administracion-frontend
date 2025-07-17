import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from "primeng/password";
import { ProgressBarModule } from "primeng/progressbar";
import { IProgress, ISegUpdatePasswordRequest } from "@interfaces/seguridad-cuenta/seguridad-cuenta";
import { noSpacesValidator } from "../../../shared/validators/form.validator";
import { ActivatedRoute, Router } from "@angular/router";
import { SeguridadCuentaService } from "@services/seguridad-cuenta/seguridad-cuenta.service";
import UAParser from 'ua-parser-js';
import * as bcrypt from 'bcryptjs';
import {
  RecuperarContrasenaLayoutComponent
} from "@modulos/recuperar-contrasena/recuperar-contrasena-layout/recuperar-contrasena-layout.component";
import { RecuperarContrasenaService } from "@services/recuperar-contrasena/recuperar-contrasena.service";
import { NgxSpinnerService } from "ngx-spinner";
import { UsuarioRecuperacionPw, ValidarTokenRecuperarPwReq } from "@interfaces/recuperar-contrasena/RecuperarContrasena";

@Component({
  standalone: true,
  selector: 'app-recuperar-contrasena-post-email',
  templateUrl: './recuperar-contrasena-post-email.component.html',
  styleUrls: ['./recuperar-contrasena-post-email.component.scss'],
  imports: [
    CommonModule, CmpLibModule, ButtonModule,
    InputTextModule, ReactiveFormsModule, ToastModule,
    PasswordModule, ProgressBarModule,
  ],
})
export class RecuperarContrasenaPostEmailComponent
  implements OnInit, OnDestroy, AfterViewInit {
  public formGroup: FormGroup;
  public navegador: string;
  public tipoDispositivo: string;
  public nombreSO: string;
  public versionSO: string;
  //public usuarioActual;//no se usa
  public usuarioRecuperacionPw: UsuarioRecuperacionPw;

  public valoresProgreso: IProgress = {
    number: 0,
    color: '',
    text: '',
    success: false,
  };

  // Regexs
  private readonly xRegexMinLongitud = /^.{8,}$/;      // Longitud mínima de 8 caracteres
  private readonly xRegexMayuscula = /[A-Z]/;          // Al menos una letra mayúscula
  private readonly xRegexMinuscula = /[a-z]/;          // Al menos una letra minúscula
  private readonly xRegexNumero = /\d/;                // Al menos un dígito
  private readonly xRegexCaracterEspecial = /[\W_]/;   // Al menos un carácter especial o subrayado

  public mensajeErrorPersonalizado: string;//mensaje para mostrar token expirado, entre otros

  private readonly router: Router = inject(Router);

  constructor(
    private readonly layoutComponent: RecuperarContrasenaLayoutComponent,
    private readonly seguridadCuentaService: SeguridadCuentaService,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly recuperarContrasenaService: RecuperarContrasenaService,
    private readonly spinner: NgxSpinnerService,
  ) {
    this.formGroup = this.fb.group({
      controlNuevaContrasena: new FormControl('', [
        Validators.required,
        noSpacesValidator,
      ]),
      controlRepetirNuevaContrasena: new FormControl('', [
        Validators.required,
        noSpacesValidator,
      ]),
    });

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
      this.validarSeguridadContrasena(password)
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const coVTokenRecuperarPw = this.route.snapshot.queryParamMap.get('coVTokenRecuperarPw');
      this.validarTokenRecuperarPw(coVTokenRecuperarPw);
    }, 100);
  }


  public validarSeguridadContrasena(password: string): void {
    this.evaluarContrasena(password);
  }

  public enviarCambioContrasena(): void {
    // 1. Validacion para verificar si los campos han sido llenados
    if (this.formGroup.valid) {
      // 2. Validacion para verificar semejanza entre las contraseñas
      //this.validarContrasenas();
      if (this.campoNuevaContrasena.value !== this.campoRepetirNuevaContrasena.value) {
        // mostrando mensaje de error en el tercer input
        this.campoRepetirNuevaContrasena.setErrors({ passwordsDoNotMatch: true });
      } else {
        this.actualizarContrasena();
      }
    }
    this.formGroup.markAllAsTouched();
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
      //codigoUserName: this.usuarioActual?.usuario.usuario,
      codigoUserName: this.usuarioRecuperacionPw.coVUsername,
      password: passwordEncrypted,
      dispositivo: this.tipoDispositivo,
      sistemaOperativo: this.nombreSO + ' ' + this.versionSO,
      navegador: this.navegador,
    };

    this.seguridadCuentaService.updatePassword(datosSolicitud).subscribe({
      next: () => {
        this.layoutComponent.onToastMessage({
          type: 'success',
          message: 'Contraseña cambiada correctamente',
        });
      },
      error: (err: string) => {
        console.error('Error en la solicitud [updatePassword]: ', err);
      },
    });
  }

  private evaluarContrasena(password: string): void {
    let score = 0;
    // conditions
    if (this.xRegexMinLongitud.test(password)) score++;
    if (this.xRegexMayuscula.test(password)) score++;
    if (this.xRegexMinuscula.test(password)) score++;
    if (this.xRegexNumero.test(password)) score++;
    if (this.xRegexCaracterEspecial.test(password)) score++;

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
    // This is intentional
  }

  get campoNuevaContrasena(): AbstractControl {
    return this.formGroup.get('controlNuevaContrasena');
  }

  get campoRepetirNuevaContrasena(): AbstractControl {
    return this.formGroup.get('controlRepetirNuevaContrasena');
  }

  validarTokenRecuperarPw(tokenRecuperarPw: string) {
    const request: ValidarTokenRecuperarPwReq = {
      tokenRecuperarPw: tokenRecuperarPw,
    }
    this.spinner.show();
    this.recuperarContrasenaService.validarTokenRecuperarPw(request).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response) {
          this.usuarioRecuperacionPw = response;
        } else {
          this.mensajeErrorPersonalizado = "Token inválido"
        }
      }, error: (err) => {
        this.mensajeErrorPersonalizado = "Ocurrió un error. Vuelva a intentar"
        this.spinner.hide();
      }
    });
  }
}
