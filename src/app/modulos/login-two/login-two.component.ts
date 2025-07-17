import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SYSTEM_CODE } from '@environments/environment';

import { Router } from '@angular/router';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { CaptchaService } from '@services/captcha/captcha.service';
import { Auth2Service } from '@services/auth/auth2.service';
import { LoginNewRequestDTO } from '@interfaces/sesion/sesion';
import { Constants } from 'src/app/shared/constants/constantes';
import { AuthTwoComponent } from '@layouts/auth/auth-two.component';
import { finalize, firstValueFrom } from 'rxjs';

import {
  ISegListStates2FA,
  ISegListStates2FARequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { jwtDecode } from 'jwt-decode';
import { UsuarioService } from '@services/usuario/usuario.service';

declare let google: any;

@Component({
  selector: 'app-login-two',
  standalone: true,
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
  ],
  templateUrl: './login-two.component.html',
  styleUrls: ['../../shared/layouts/auth/auth-two.component.scss'],
  providers: [Auth2Service, CaptchaService],
})
export class LoginTwoComponent implements OnInit {
  //#region "Servicios"
  private readonly authTwoComponent = inject(AuthTwoComponent); //Componente padre
  private readonly auth2Service: Auth2Service = inject(Auth2Service);
  private readonly captchaService: CaptchaService = inject(CaptchaService);
  private readonly router: Router = inject(Router);
  private readonly fb: FormBuilder = inject(FormBuilder);
  //#endregion
  protected readonly configIntentos: { min: number; max: number } = {
    min: 3,
    max: 10,
  };

  protected imageUrl: string = '';
  protected isSubmitted: boolean = false;
  protected estaCargando: boolean = false;
  protected conteoIntentos: number = 1;
  protected formulario: FormGroup = this.fb.group({
    username: ['32920589', Validators.required],
    password: ['123456789', Validators.required],
    captcha: [{ value: null, disabled: true }, Validators.required],
  });
  protected correoPersonal: string = '';
  protected correoInstitucional: string = '';
  protected nombreCompleto: string = '';
  protected errorMsg: string = null;

  // protected usuarioSesion: any;
  // constructor(
  //   public usuarioService: UsuarioService,
  //   private readonly userService: Auth2Service,) {
  //
  // }

  public ngOnInit(): void {
    // Esperar a que el script de Google se cargue antes de inicializar
    this.loadGoogleScript()
      .then(() => {
        this.initializeGoogleSignIn();
      })
      .catch((error) => {
        console.error('Error al cargar la API de Google:', error);
      });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkGoogle = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(checkGoogle);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkGoogle);
        reject('Google API no cargada');
      }, 5000); // Espera hasta 5 segundos
    });
  }

  private initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id:
        '401066015461-63hrugfeb0n0h0crak5e15ikbt8ko6un.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false, // Para evitar el inicio de sesión automático
      cancel_on_tap_outside: true,
    });

    // No renderizamos el botón de Google aquí
  }

  private extractEmailsFromToken(): void {
    const bearerToken = sessionStorage.getItem(Constants.TOKEN_NAME);

    if (bearerToken) {
      try {
        const jwt = bearerToken.startsWith('Bearer ')
          ? bearerToken.substring(7)
          : bearerToken;

        const decodedToken: any = jwtDecode(jwt);

        const usuario = decodedToken.usuario;

        this.correoPersonal = usuario.correo;
        this.correoInstitucional = usuario.correoFiscal;

        if (usuario?.fiscal) {
          this.nombreCompleto = usuario.fiscal;
        } else {
          console.error(
            'El campo usuario.fiscal no está presente en el token.'
          );
        }
      } catch (error) {
        console.error('Error al decodificar o procesar el token:', error);
      }
    } else {
      console.warn('No se encontró el token en el sessionStorage.');
    }
  }

  protected onIniciarSesionGoogle(): void {
    if (typeof google === 'undefined' || !google.accounts) {
      console.error('Google API no está cargada');
      return;
    }

    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Si el prompt no se muestra, puedes manejarlo aquí
        console.error(
          'El prompt de Google no se pudo mostrar:',
          notification.getNotDisplayedReason()
        );
      }
    });
  }

  private handleCredentialResponse(response: any): void {
    const idToken = response.credential;

    this.autenticarConGoogle(idToken)
      .then((tokenObtenido) => {
        if (tokenObtenido) {
          // Procesar el flujo de autenticación
          this.router.navigate(['app']);
        } else {
          console.error('No se pudo autenticar al usuario.');
        }
      })
      .catch((error) => {
        console.error('Error al autenticar con Google:', error);
      });
  }

  private async autenticarConGoogle(idToken: string): Promise<boolean> {
    try {
      const resp = await firstValueFrom(
        this.auth2Service.loginWithGoogle({ idToken })
      );

      const token = resp.token;
      sessionStorage.setItem(Constants.TOKEN_NAME, token);

      return true;
    } catch (error) {
      console.error('Error al autenticar con Google:', error);
      return false;
    }
  }

  protected onIniciarSesion(): void {
    this.isSubmitted = true;

    // valido si el usuario tiene más de una dependencia asignada
    const { username, password, captcha } = this.formulario.value;

    const payload: LoginNewRequestDTO = {
      usuario: username,
      password: password,
      sistema: SYSTEM_CODE,
    };

    if (this.conteoIntentos > this.configIntentos.min) {
      payload.captcha = captcha;
      payload.captchaCompare = captcha;

      const captchaLocalStorage = localStorage.getItem('captchaValue');

      if (captchaLocalStorage !== captcha) {
        this.obtenerCaptcha();
        console.warn(
          'Los caracteres ingresados no coinciden con la imagen, por favor validar'
        );
      }
    }

    this.auth2Service.validarDependenciaUsuario(username).subscribe({
      next: async (resp) => {
        this.estaCargando = true;
        this.isSubmitted = true;

        const existeToken = await this.obtenerToken(payload);

        if (existeToken) {
          this.auth2Service
            .getCondicionalesCambioPassword(username)
            .pipe(
              finalize(() => {
                this.estaCargando = false;
              })
            )
            .subscribe({
              next: (condicion: any) => {
                switch (condicion.cambiar) {
                  case '0':
                    this.ingresarAlSistema(payload);
                    break;

                  case '1':
                    this.authTwoComponent.isCambiarContrasena = true;
                    this.router.navigate(['/auth/cambiar-contrasena']);
                    break;
                }
              },
              error: (error) => {
                console.error(
                  'Error en la solicitud [getCondicionalesCambioPassword]: ',
                  error
                );
              },
            });
        } else {
          this.obtenerCaptcha();
          console.warn('Credenciales incorrectas');
          this.errorMsg = 'Usuario y/o contraseña son incorrectos';
        }
      },
      error: (error) => {
        console.error('Error al validar la dependencia del usuario', error);
      },
    });
  }

  private async obtenerToken(payload): Promise<boolean> {
    let token = '';

    try {
      const resp = await firstValueFrom(this.auth2Service.login(payload));

      token = JSON.stringify(resp);
      sessionStorage.setItem(Constants.TOKEN_NAME, token);
    } catch (error) {
      this.conteoIntentos++;
      this.estaCargando = false;

      if (this.conteoIntentos > this.configIntentos.max) {
        const captchaLocalStorage = localStorage.getItem('captchaValue');

        if (captchaLocalStorage !== payload.captcha) {
          this.obtenerCaptcha();
        }
      } else if (this.conteoIntentos > this.configIntentos.min) {
        this.formulario.get('captcha').enable();
      }
    }

    return token != '';
  }

  private ingresarAlSistema(payload): void {
    this.auth2Service
      .login(payload)
      .pipe(
        finalize(() => {
          this.estaCargando = false;
        })
      )
      .subscribe({
        next: (resp: any) => {
          const token: string = JSON.stringify(resp);
          sessionStorage.setItem(Constants.TOKEN_NAME, token);

          // Extraer correos
          this.extractEmailsFromToken();

          const request: ISegListStates2FARequest = {
            codigoUserName: payload.usuario,
          };

          this.auth2Service
            .obtenerOpciones2FA(request)
            .pipe(
              finalize(() => {
                this.estaCargando = false;
              })
            )
            .subscribe({
              next: (options: ISegListStates2FA[]) => {
                const hasActive2FA = options.some(
                  (option) => option.estadoMetodo === '1'
                );
                if (hasActive2FA) {
                  // Redirigir al componente de verificación de pasos
                  this.router.navigate(['/auth/verification-steps'], {
                    state: {
                      options,
                      usuario: payload.usuario,
                      emailPersonal: this.correoPersonal,
                      emailInstitucional: this.correoInstitucional,
                      nombre: this.nombreCompleto,
                    },
                  });
                } else {
                  // sessionStorage.setItem(Constants.ID_APPLICATION, '7');
                  this.router.navigate(['app']);
                }
              },
              error: (err: any) => {
                console.error('Error al obtener opciones de 2FA:', err);
              },
            });
        },
        error: (err: string) => {
          console.error('Error en la solicitud [login]: ', err);
        },
      });
  }

  protected obtenerCaptcha(): void {
    this.formulario.get('captcha').setValue('');

    this.captchaService.getCaptchaImage().subscribe({
      next: (captcha) => {
        this.imageUrl = URL.createObjectURL(
          this.base64ToBlob(captcha.imagen, 'image/jpeg')
        );
        localStorage.setItem('captchaValue', captcha.texto);
      },
      error: (error) => {
        console.error('Error al obtener la imagen CAPTCHA:', error);
      },
    });
  }

  private base64ToBlob(base64, mimeType): Blob {
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

  protected onRedireccionarRecuperarContrasena() {
    this.router.navigate(['/recovery/pre']);
  }
}
