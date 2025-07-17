import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {BACKEND} from "@environments/environment";
import { Observable } from 'rxjs';
import { RequestCategoria, RequestSistema } from '@interfaces/mis-aplicaciones/mis-aplicaciones';

@Injectable({
  providedIn: 'root'
})
export class MostrarMisAplicacionesService {

  private readonly baseUrl :string = `${BACKEND.PATH_SAD_DEV}v1/e/mostrarMisAplicaciones`;
  private readonly http: HttpClient = inject(HttpClient);

  getCategorias(request: RequestCategoria): Observable<any> {
    const url = `${this.baseUrl}/categorias`;
    return this.http.post(url, request);
  }

  getSistemas(request: RequestSistema): Observable<any> {
    const url = `${this.baseUrl}/sistemas`;
    return this.http.post(url, request);
  }

  //version donde se considera lista de categorias y sus sistemas
  getMisAplicacionesHeaderTop(request: RequestCategoria): Observable<any> {
    const url = `${this.baseUrl}/misaplicaciones`;
    return this.http.post(url, request);
  }

  getMisAccesosAplicacionesHeaderTop(request: RequestCategoria): Observable<any> {
    const url = `${this.baseUrl}/misaccesosaplicaciones`;
    return this.http.post(url, request);
  }
}
