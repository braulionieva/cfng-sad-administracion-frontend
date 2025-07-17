import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LoginNewRequestDTO,
  LoginRequestDTO,
  RegistrarAccesoRequest,
  RegistrarAccesoRequestRes
} from '@interfaces/sesion/sesion';
import { Observable, catchError } from 'rxjs';
import { BACKEND } from '@environments/environment';
import {
  ISegGenerateEmailCode,
  ISegGenerateEmailCodeRequest,
  ISegListStates2FA,
  ISegListStates2FARequest,
  ISegValidateEmailCode,
  ISegValidateEmailCodeRequest,
  ISegValidateGoogleAuthCode,
  ISegValidateGoogleAuthCodeRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';


@Injectable({ providedIn: 'root' })
export class Auth2Service {
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/sesion`;
  private readonly baseUrl2: string = `${BACKEND.PATH_SAD_DEV}v1/e/seguridadCuenta`;
  private readonly http: HttpClient = inject(HttpClient);

  /**
   *funcion que se va encargar de validar el usuario y pass
   *si sale ok devuelve el token de sesión
   **/
  public login(loginRequest: LoginNewRequestDTO): Observable<any> {
    const url: string = `${this.baseUrl}/tokenSesion-new`;
    return this.http.post(url, loginRequest);
  }

  public validarUsuario(usuario: string): Observable<any> {
    const url = `${this.baseUrl}/validarUsuario/${usuario}`;

    return this.http.get(url).pipe(
      catchError((error) => {
        return error;
      })
    );
  }

  validarPassword(loginRequest: LoginRequestDTO): Observable<any> {
    const url = `${this.baseUrl}/validarPassword`;

    return this.http.post(url, loginRequest).pipe(
      catchError((error) => {
        return error;
      })
    );
  }

  obtenerTokenSesion(usuario: string): Observable<any> {
    const url = `${this.baseUrl}/tokenSesion/${usuario}`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      catchError((error) => {
        return error;
      })
    );
  }

  logoutSesion(usuario: string): Observable<any> {
    const url = `${this.baseUrl}/cerrarSesion/${usuario}`;

    return this.http.get(url).pipe(
      catchError((error) => {
        return error;
      })
    );
  }

  obtenerDependenciasUsuario(usuario: string): Observable<any> {
    const url = `${this.baseUrl}/dependencias/${usuario}`;

    return this.http.get(url).pipe(
      catchError((error) => {
        return error;
      })
    );
  }

  validarDependenciaUsuario(usuario: string): Observable<any> {
    const url = `${this.baseUrl}/validarDependenciaUsuario/${usuario}`;

    return this.http.get(url).pipe(
      catchError((error) => {
        return error;
      })
    );
  }

  /* Obtener informacion de sessionStorage */
  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  getUserInfo() {
    return this.getToken() ? this.parseJwt(this.getToken()) : null;
  }

  getCondicionalesCambioPassword(usuario: string): Observable<any> {
    const url = `${this.baseUrl}/condicionalesCambioPassword/${usuario}`;

    return this.http.get(url).pipe(
      catchError((error) => {
        return error;
      })
    );
  }

  obtenerOpciones2FA(
    request: ISegListStates2FARequest
  ): Observable<ISegListStates2FA[]> {
    const url = `${this.baseUrl2}/estadosOpciones2FA`;
    return this.http.post<ISegListStates2FA[]>(url, request);
  }

  enviarCodigoEmail(
    request: ISegGenerateEmailCodeRequest
  ): Observable<ISegGenerateEmailCode> {
    const url = `${this.baseUrl2}/generar6Digitos`;
    return this.http.post<ISegGenerateEmailCode>(url, request);
  }

  validarCodigoEmails(
    request: ISegValidateEmailCodeRequest
  ): Observable<ISegValidateEmailCode> {
    const url = `${this.baseUrl2}/validarCodigo6Digitos`;
    return this.http.post<ISegValidateEmailCode>(url, request);
  }

  validarCodigoGoogle(
    request: ISegValidateGoogleAuthCodeRequest
  ): Observable<ISegValidateGoogleAuthCode> {
    const url = `${this.baseUrl2}/validarCodigoQR`;
    return this.http.post<ISegValidateGoogleAuthCode>(url, request);
  }

  loginWithGoogle(payload: { idToken: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/tokenSesion-google`, payload);
  }

  registrarAcceso(request: RegistrarAccesoRequest): Observable<RegistrarAccesoRequestRes> {
    const url = `${this.baseUrl}/registrarAcesso`;
    return this.http.post<RegistrarAccesoRequestRes>(url, request);
  }
}
