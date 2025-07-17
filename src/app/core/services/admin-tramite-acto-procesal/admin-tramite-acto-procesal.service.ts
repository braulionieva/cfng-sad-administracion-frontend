import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ActoProcesalRelacionadoResponse,
  TramiteBandejaResponse,
  TramiteConfiguracionRequest,
  TramiteEliminacionRequest,
  TramitelMensajeResponse,
} from '@interfaces/admin-tramite-por-acto-procesal/tramite-por-acto-procesal';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';

import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminTramiteActoProcesalService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/tramiteporactoprocesal`;

  public listarBandejaTramiteActoProcesal(
    idTramite: string
  ): Observable<TramiteBandejaResponse[]> {
    const url = `${this.baseUrl}/bandejatramites/${idTramite}`;
    return this.http.get<TramiteBandejaResponse[]>(url);
  }

  public buscarTramitePorNombre(
    tramite: string
  ): Observable<MaestroGenerico[]> {
    const url = `${this.baseUrl}/buscartramite/${tramite}`;
    return this.http.get<MaestroGenerico[]>(url);
  }

  public listarConfiguracionesPorIdTramite(idTramite: string): Observable<any> {
    const url = `${this.baseUrl}/listarconfiguraciones/${idTramite}`;
    return this.http.get<any>(url);
  }

  public agregarTramite(body: TramiteConfiguracionRequest): Observable<any> {
    const url = `${this.baseUrl}/agregartramite`;
    return this.http.post<any>(url, body);
  }

  public listarActoProcesalRelacionado(
    idActoProcesal: string
  ): Observable<ActoProcesalRelacionadoResponse[]> {
    const url = `${this.baseUrl}/listaractosrelacionados/${idActoProcesal}`;
    return this.http.get<ActoProcesalRelacionadoResponse[]>(url);
  }

  public eliminarTramite(
    data: TramiteEliminacionRequest
  ): Observable<TramitelMensajeResponse> {
    const url = `${this.baseUrl}/eliminaractoprocesal`;
    return this.http.delete<TramitelMensajeResponse>(url, { body: data });
  }

  public eliminarConfiguracion(
    data: TramiteConfiguracionRequest
  ): Observable<TramitelMensajeResponse> {
    const url = `${this.baseUrl}/eliminarconfiguracion`;
    return this.http.delete<TramitelMensajeResponse>(url, { body: data });
  }

  public listarBandejaTramiteActoProcesalExcel(
    idTramite: string
  ): Observable<Blob> {
    const url = `${this.baseUrl}/bandejatramites/${idTramite}/Excel`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
