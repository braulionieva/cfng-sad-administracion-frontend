import {HttpClient, HttpHeaders} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {
  BandejaEstadoDeNotificacionResponse,
  EstadoDeNotificacionRequest,
  FiltroEstadoNotificacion
} from "@interfaces/admin-estado-de-notificacion/estado-de-notificacion";
import { Filtros } from "@interfaces/shared/shared";

import { Observable } from "rxjs";
import {BACKEND} from "@environments/environment";
import {BuscarAplicacionFiltro} from "@interfaces/aplicacion-bandeja/aplicacionBean";

@Injectable({
    providedIn: 'root'
})

export class EstadoDeNotificacionService {
    private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/estadocedula`;
    private readonly  http: HttpClient = inject(HttpClient);

    public buscarEstadosCeduNotificacion(filtros: FiltroEstadoNotificacion): Observable<BandejaEstadoDeNotificacionResponse[]> {
        const url = `${this.baseUrl}/buscarEstadosCeduNotificacion`;
      return this.http.post<BandejaEstadoDeNotificacionResponse[]>(url, filtros);
    }

    public agregarEstado(body: EstadoDeNotificacionRequest): Observable<any> {
        const url = `${this.baseUrl}/agregarestado`;
        return this.http.post<any>(url, body);
    }

    public editarEstado(body: EstadoDeNotificacionRequest): Observable<any> {
        const url = `${this.baseUrl}/editarestado`;
        return this.http.put<any>(url, body);
    }

  public exportarexcel(filtroSearchReq: FiltroEstadoNotificacion): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url, filtroSearchReq, { headers: headers, responseType: 'blob', });
  }

}
