import { HttpClient, HttpHeaders } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import { ServidorBandejaRequest, ServidorBandejaResponse, ServidorDTO } from '@interfaces/servidor/servidor';
import { Observable } from 'rxjs';
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ServidorService {

  private readonly baseUrl :string = `${BACKEND.PATH_SAD_DEV}v1/e/servidor`;
  private readonly http: HttpClient = inject(HttpClient);

  public obtenerServidores(request: ServidorBandejaRequest): Observable<ServidorBandejaResponse> {
    const url = `${this.baseUrl}/servidores`;
    return this.http.post<ServidorBandejaResponse>(url, request);
  }

  public exportarServidores(request: ServidorBandejaRequest): Observable<any> {

    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url, request, {
      headers: headers,
      responseType: 'blob',
    });

  }

  public agregarServidor(request : ServidorDTO): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, request);
  }

  public editarServidor(request : ServidorDTO): Observable<any> {
    const url = `${this.baseUrl}/editar`;
    return this.http.post(url, request);
  }

  public eliminarServidor(id: number): Observable<any> {
    const url = `${this.baseUrl}/eliminar/${id}`;
    return this.http.delete(url);
  }




}
