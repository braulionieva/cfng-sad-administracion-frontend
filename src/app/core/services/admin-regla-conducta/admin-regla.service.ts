import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdminReglaService {

  private readonly baseUrl :string = `${BACKEND.PATH_SAD_DEV}v1/e/adminReglaConducta`;
  private readonly http: HttpClient = inject(HttpClient);

  public obtenerBandejaReglas(request: any): Observable<any> {
    const url = `${this.baseUrl}/reglas`;
    return this.http.post<any>(url, request);
  }

  public crearReglaConducta(request: any): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post<any>(url, request);
  }

  public editarReglaConducta(request: any): Observable<any> {
    const url = `${this.baseUrl}/editar`;
    return this.http.put<any>(url, request);
  }

  public eliminarReglaConducta(id: number): Observable<any> {
    const url = `${this.baseUrl}/eliminar/${id}`;
    return this.http.delete(url);
  }

  public exportarReglas(request: any): Observable<any> {

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url,
                          request,
                          {
                            headers: headers,
                            responseType: 'blob',
                          }
                          );
  }
}
