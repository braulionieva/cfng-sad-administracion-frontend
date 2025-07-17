import { HttpClient, HttpHeaders } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {
  ActualizarNotificReq,
  ActualizarNotificRes,
  AgregarNotificadorReq,
  AgregarNotificadorRes,
  BuscarNotificadoresReq,
  BuscarNotificadoresResWrapper,
  CentralNotificacionesDTOB,
  DesactivarNotifiReq,
  DesactivarNotificRes,
  FiltroBuscarNotificadoresReq
} from '@interfaces/administrar-notificador/administrar-notificador';
import { Observable } from 'rxjs';
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdministrarNotificadorService {

  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/administrarNotificador`;
  private readonly  http: HttpClient = inject(HttpClient);

  public getCentralNotificacionLst(): Observable<CentralNotificacionesDTOB[]> {
    const url = `${this.baseUrl}/getCentralNotificacionLst`;
    return this.http.get<CentralNotificacionesDTOB[]>(url);
  }

  public buscarNotificadores(request: BuscarNotificadoresReq): Observable<BuscarNotificadoresResWrapper> {
    const url = `${this.baseUrl}/getBuscarNotificadoresLst`;
    return this.http.post<BuscarNotificadoresResWrapper>(url, request);
  }

  public agregarNotificador(request: AgregarNotificadorReq): Observable<AgregarNotificadorRes> {
    const url = `${this.baseUrl}/agregarNotificador`;
    return this.http.post<AgregarNotificadorRes>(url, request);
  }

  public desactivarNotificador(request:DesactivarNotifiReq): Observable<DesactivarNotificRes>{
    const url = `${this.baseUrl}/desactivarNotificador`;
    return this.http.post<DesactivarNotificRes>(url, request);
  }

  public actualizarNotificador(request:ActualizarNotificReq): Observable<ActualizarNotificRes>{
    const url = `${this.baseUrl}/actualizarNotificador`;
    return this.http.post<ActualizarNotificRes>(url, request);
  }

  //public exportarexcel(request: BuscarNotificadoresReq): Observable<any> {
  public exportarexcel(request: FiltroBuscarNotificadoresReq): Observable<any> {
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
