import { inject, Injectable } from '@angular/core';
import { BACKEND } from "@environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  RecuperarContrasenaPremailReq,
  RecuperarContrasenapremailRes, UsuarioRecuperacionPw, ValidarTokenRecuperarPwReq
} from "@interfaces/recuperar-contrasena/RecuperarContrasena";

@Injectable({ providedIn: 'root' })
export class RecuperarContrasenaService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/recuperarContrasena`;

  recuperarContrasenapremail(request: RecuperarContrasenaPremailReq): Observable<RecuperarContrasenapremailRes> {
    const url = `${this.baseUrl}/recuperarContrasenapremail`;
    return this.http.post<RecuperarContrasenapremailRes>(url, request);
  }

  validarTokenRecuperarPw(request: ValidarTokenRecuperarPwReq): Observable<UsuarioRecuperacionPw> {
    const url = `${this.baseUrl}/validarTokenRecuperarPw`;
    return this.http.post<UsuarioRecuperacionPw>(url, request);
  }
}
