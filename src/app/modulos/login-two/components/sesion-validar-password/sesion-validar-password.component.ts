import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SYSTEM_CODE } from '@environments/environment';

import { iBank } from 'ngx-mpfn-dev-icojs-regular';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { Constants } from '@constants/constantes';
import { CaptchaService } from '@services/captcha/captcha.service';
import { Auth2Service } from '@services/auth/auth2.service';
import { catchError, tap } from 'rxjs';
import { LoginRequestDTO } from '@interfaces/sesion/sesion';

import inputErrorUtil from 'src/app/shared/utils/input-error';

@Component({
  selector: 'app-sesion-validar-password',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  templateUrl: './sesion-validar-password.component.html',
  styleUrls: ['./sesion-validar-password.component.scss'],
  providers: [MessageService],
})
export class SesionValidarPasswordComponent implements OnInit {
  myForm: FormGroup;
  isSubmitted: boolean;
  isLoading: boolean;
  isInvalid: (a: boolean, b: any) => boolean;

  obtuvoToken: boolean = false;
  imageUrl: string;
  conteoIntentos: number;

  userNameValidado: string;
  username: string;

  iUser = iBank;
  iKey = iBank;
  iLock = iBank;

  constructor(
    protected readonly router: Router,
    protected readonly fb: FormBuilder,
    protected readonly messageService: MessageService,
    protected readonly captchaService: CaptchaService,
    protected readonly auth2Service: Auth2Service,
    protected readonly route: ActivatedRoute
  ) {
    this.myForm = this.fb.group({
      username: ['10628702', Validators.required],
      password: ['123456789', Validators.required],
      token: ['123456', Validators.required],
      captcha: [null],
    });
    this.isSubmitted = false;
    this.isLoading = false;
    this.isInvalid = inputErrorUtil.isInvalid;
    this.conteoIntentos = 0;
  }

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username');
    this.obtenerTiempoActual();
  }

  getPayload(form: any) {
    return {
      login: form.username,
      password: form.password,
      token: form.token,
      sistema: SYSTEM_CODE,
    };
  }

  public submit(): void {
    let banderaCOnsumirServicio: boolean = true;

    if (this.conteoIntentos > 3) {
      const captchaInputUsuario: string = this.myForm.get('captcha').value;
      if (captchaInputUsuario === null) return;

      const captchaLocalStorage: string = localStorage.getItem('captchaValue');
      banderaCOnsumirServicio = (captchaLocalStorage === captchaInputUsuario);
    }

    if (banderaCOnsumirServicio) {
      this.isSubmitted = true;

      let payload: LoginRequestDTO = {
        usuario: this.username,
        password: this.myForm.value.password,
      };

      this.isLoading = true;

      // ahora pasará a validar primero el usuario
      this.auth2Service.validarPassword(payload)
        .pipe(tap((response) => {

          if (response.code === '0') {
            this.obtenerToken(this.username);
          } else {
            this.userNameValidado = null;
          }
        }), catchError((error) => { throw error; }))
        .subscribe()
        .add(() => {
          this.isLoading = false;
        });
    }
  }

  obtenerToken(usuario: string) {
    this.auth2Service.obtenerTokenSesion(usuario).pipe(
      tap((data) => {
        let token = JSON.stringify(data);
        this.obtuvoToken = true;
        sessionStorage.setItem(Constants.TOKEN_NAME, token);

        if (this.obtuvoToken) {
          this.router.navigateByUrl('app/bandeja-servidor');
        }
      }), catchError((error) => { throw error; }))
      .subscribe()
      .add(() => {
        this.isLoading = false;
      });
  }

  showResponse(event) {
    this.messageService.add({ severity: 'info', summary: 'Succees', detail: 'User Responded', sticky: true });
  }

  obtenerTiempoActual() {
    this.captchaService.getCaptchaImage().subscribe({
      next: (captcha) => {
        this.imageUrl = URL.createObjectURL(this.base64ToBlob(captcha.imagen, 'image/jpeg'));

        localStorage.setItem('captchaValue', captcha.texto);
      },
      error: (error) => {
        console.error('Error al obtener la imagen CAPTCHA:', error);
      }
    });
  }

  base64ToBlob(base64, mimeType) {
    // Eliminar el prefijo (si existe) de la cadena Base64
    const base64Data = base64.split(',')[1] || base64;

    // Reemplazar caracteres no Base64 y rellenar con '=' si es necesario
    const base64Cleaned = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
    const paddedBase64 = base64Cleaned.padEnd(
      base64Cleaned.length + ((4 - (base64Cleaned.length % 4)) % 4),
      '='
    );

    // Decodificar la cadena Base64 limpia en un array de bytes
    try {
      const bytes = atob(paddedBase64);
      const array = new Uint8Array(bytes.length);

      for (let i = 0; i < bytes.length; i++) {
        array[i] = bytes.charCodeAt(i);
      }

      // Crear y retornar un objeto Blob con los datos de la imagen
      return new Blob([array], { type: mimeType });
    } catch (e) {
      console.error('Error al decodificar Base64: ', e);
      return null;
    }
  }
}
