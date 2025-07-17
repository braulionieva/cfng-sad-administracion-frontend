import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResetearContrasenaService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/resetearContrasena`;

  getDatosUsuario(request: any): Observable<any> {
    const url = `${this.baseUrl}/datosUsuario`;
    return this.http.post(url, request);
  }

  getCorreosUsuario(request: any): Observable<any> {
    const url = `${this.baseUrl}/obtenerCorreoUsuario`;
    return this.http.post(url, request);
  }

  resetearContrasena(request: any): Observable<any> {
    const url = `${this.baseUrl}/resetearContrasena`;
    return this.http.post(url, request);
  }
}
