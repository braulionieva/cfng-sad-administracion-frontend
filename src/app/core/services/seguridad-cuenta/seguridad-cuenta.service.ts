import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ISegFecha,
  ISegFechaRequest,
  ISegListHPasswordRequest,
  ISegListPasswordExcelRequest,
  ISegPasswordRequest,
  ISegUpdatePassword,
  ISegUpdatePasswordRequest,
  ISegPaginacionHPassword,
  ISegLoginEmailsRequest,
  ISegLoginEmails,
  ISegEmailStatusValidateRequest,
  ISegEmailStatusValidate,
  ISegGenerateCodeRequest,
  ISegGenerateCode,
  ISegValidateCodeRequest,
  ISegValidateCode,
  ISegActiveEmailSesionRequest,
  ISegActiveEmailSesion,
  ISegListHValidationEmailRequest,
  ISegPaginacionHValidationEmail,
  ISegListValidationEmailExcelRequest,
  ISegListStates2FA,
  ISegListStates2FARequest,
  ISegGenerateGoogleAuthCode,
  ISegGenerateGoogleAuthCodeRequest,
  ISegValidateGoogleAuthCodeRequest,
  ISegValidateGoogleAuthCode,
  ISegGenerateEmailCodeRequest,
  ISegGenerateEmailCode,
  ISegValidateEmailCodeRequest,
  ISegValidateEmailCode,
  ISegListHistory2FARequest,
  ISegListHistory2FA,
  ISegListHistory2FAExcelRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";

@Injectable({ providedIn: 'root' })
export class SeguridadCuentaService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/seguridadCuenta`

  public getFecha(request: ISegFechaRequest): Observable<ISegFecha[]> {
    const url = `${this.baseUrl}/fecha`;
    return this.http.post<ISegFecha[]>(url, request);
  }

  public inciarSesionCorreos(request: ISegLoginEmailsRequest): Observable<ISegLoginEmails> {
    const url = `${this.baseUrl}/correosIniciarSesion`;
    return this.http.post<ISegLoginEmails>(url, request);
  }

  // CONTRASENA
  public verifyCurrentPassword(request: ISegPasswordRequest): Observable<boolean> {
    const url = `${this.baseUrl}/password`;
    return this.http.post<boolean>(url, request);
  }

  public updatePassword(request: ISegUpdatePasswordRequest): Observable<ISegUpdatePassword> {
    const url = `${this.baseUrl}/actualizaPassword`;
    return this.http.post<ISegUpdatePassword>(url, request);
  }

  public getListHistoryPassword(request: ISegListHPasswordRequest): Observable<ISegPaginacionHPassword> {
    const url = `${this.baseUrl}/listaHistorialPassword`;
    return this.http.post<ISegPaginacionHPassword>(url, request);
  }

  public getListaHistorialPasswordExcel(request: ISegListPasswordExcelRequest): Observable<Blob> {
    const url = `${this.baseUrl}/listaHistorialPasswordExcel`;
    return this.http.post(url, request, { responseType: 'blob' });
  }

  // CORREO PERSONAL / INSTITUCIONAL
  public correoEstadoValidado(request: ISegEmailStatusValidateRequest): Observable<ISegEmailStatusValidate> {
    const url = `${this.baseUrl}/correoEstadoValidado`;
    return this.http.post<ISegEmailStatusValidate>(url, request);
  }

  public activarSesionCorreo(request: ISegActiveEmailSesionRequest): Observable<ISegActiveEmailSesion> {
    const url = `${this.baseUrl}/activarSesionCorreo`;
    return this.http.post<ISegActiveEmailSesion>(url, request);
  }

  public generarCodigoValidacion(request: ISegGenerateCodeRequest): Observable<ISegGenerateCode> {
    const url = `${this.baseUrl}/generar`;
    return this.http.post<ISegGenerateCode>(url, request);
  }

  public validarCodigo(request: ISegValidateCodeRequest): Observable<ISegValidateCode> {
    const url = `${this.baseUrl}/validarCodigo`;
    return this.http.post<ISegValidateCode>(url, request);
  }

  public getListHistoryValidationEmail(request: ISegListHValidationEmailRequest): Observable<ISegPaginacionHValidationEmail> {
    const url = `${this.baseUrl}/listaHistorialValidacionCorreo`;
    return this.http.post<ISegPaginacionHValidationEmail>(url, request);
  }

  public getListaHistorialValidacionCorreoExcel(request: ISegListValidationEmailExcelRequest): Observable<Blob> {
    const url = `${this.baseUrl}/listaHistorialCorreoExcel`;
    return this.http.post(url, request, { responseType: 'blob' });
  }

  public getEstadosMetodos2FA(request: ISegListStates2FARequest): Observable<ISegListStates2FA[]> {
    const url = `${this.baseUrl}/estadosOpciones2FA`;
    return this.http.post<ISegListStates2FA[]>(url, request);
  }

  public generarCodigoGoogleAuth(request: ISegGenerateGoogleAuthCodeRequest): Observable<ISegGenerateGoogleAuthCode> {
    const url = `${this.baseUrl}/generarQrCode`;
    return this.http.post<ISegGenerateGoogleAuthCode>(url, request);
  }

  public validarCodigoGoogleAuth(request: ISegValidateGoogleAuthCodeRequest): Observable<ISegValidateGoogleAuthCode> {
    const url = `${this.baseUrl}/validarCodigoQR`;
    return this.http.post<ISegValidateGoogleAuthCode>(url, request);
  }

  public generarCodigoEmail(request: ISegGenerateEmailCodeRequest): Observable<ISegGenerateEmailCode> {
    const url = `${this.baseUrl}/generar6Digitos`;
    return this.http.post<ISegGenerateEmailCode>(url, request);
  }

  public validarCodigoEmail(request: ISegValidateEmailCodeRequest): Observable<ISegValidateEmailCode> {
    const url = `${this.baseUrl}/validarCodigo6Digitos`;
    return this.http.post<ISegValidateEmailCode>(url, request);
  }

  public getListHistory2FA(request: ISegListHistory2FARequest): Observable<ISegListHistory2FA> {
    const url = `${this.baseUrl}/listaHistorial2FA`;
    return this.http.post<ISegListHistory2FA>(url, request);
  }

  public getListHistory2FAExcel(request: ISegListHistory2FAExcelRequest): Observable<Blob> {
    const url = `${this.baseUrl}/listaHistorial2FAExcel`;
    return this.http.post(url, request, { responseType: 'blob' });
  }
}
