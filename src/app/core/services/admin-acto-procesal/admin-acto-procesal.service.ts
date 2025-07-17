import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {
  ActoProcesalBandejaDetalleResponse,
  ActoProcesalConfiguracionRequest, ActoProcesaleResponseWrapper,
  ActoProcesalMensajeResponse,
  ActoProcesalRegistradoResponse,
  ConfiguracionRequest,
  ContadorTramites
} from "@interfaces/admin-acto-procesal/acto-procesal";
import {BACKEND} from "@environments/environment";
import {ActosProcesalesRequest} from "@modulos/gestion-fiscal/acto-procesal/interfaces/acto-procesal.interface";

@Injectable({providedIn: 'root'})
export class AdminActoProcesalService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/actoprocesal`;

  // public listarBandejaDetalleActoProcesal(idActoProcesal: string): Observable<ActoProcesalBandejaDetalleResponse[]> {
  //     const url = `${this.baseUrl}/detalles/${idActoProcesal}`;
  //     return this.http.get<ActoProcesalBandejaDetalleResponse[]>(url);
  // }

  public listarDetalleActoProcesal(idActoProcesal: string): Observable<ActoProcesalBandejaDetalleResponse[]> {
    const url = `${this.baseUrl}/listarDetalleActoProcesal/${idActoProcesal}`;
    return this.http.get<ActoProcesalBandejaDetalleResponse[]>(url);
  }

  // public buscarActosProcesales(request: ActosProcesalesRequest): Observable<ActoProcesalBandejaDetalleResponse[]> {
  //   const url = `${this.baseUrl}/buscarActosProcesales`;
  //   return this.http.post<ActoProcesalBandejaDetalleResponse[]>(url, request);
  // }

  public buscarActosProcesales(request: ActosProcesalesRequest): Observable<ActoProcesaleResponseWrapper> {
    const url = `${this.baseUrl}/buscarActosProcesales`;
    return this.http.post<ActoProcesaleResponseWrapper>(url, request);
  }

  public contarTramitePorActoProcesal(idActoProcesal: string): Observable<ContadorTramites> {
    const url = `${this.baseUrl}/contartramitesactoprocesal/${idActoProcesal}`;
    return this.http.get<ContadorTramites>(url);
  }

  public eliminarActoProcesal(data: ActoProcesalConfiguracionRequest): Observable<ActoProcesalMensajeResponse> {
    const url = `${this.baseUrl}/eliminaractoprocesal`;
    return this.http.delete<ActoProcesalMensajeResponse>(url, ({body: data}));
  }

  public agregarActoProcesal(data: ActoProcesalConfiguracionRequest): Observable<ActoProcesalRegistradoResponse> {
    const url = `${this.baseUrl}/agregaractoprocesal`;
    return this.http.post<ActoProcesalRegistradoResponse>(url, data);
  }

  public agregarConfiguracion(data: ConfiguracionRequest): Observable<any> {
    const url = `${this.baseUrl}/agregarconfiguracion`;
    return this.http.post(url, data);
  }

  public contarTramitePorConfiguracion(idConfiguracion: string): Observable<ContadorTramites> {
    const url = `${this.baseUrl}/contartramitesconfiguracion/${idConfiguracion}`;
    return this.http.get<ContadorTramites>(url);
  }

  public eliminarConfiguracion(data: ActoProcesalConfiguracionRequest): Observable<ActoProcesalMensajeResponse> {
    const url = `${this.baseUrl}/eliminarconfiguracion`;
    return this.http.delete<ActoProcesalMensajeResponse>(url, ({body: data}));
  }
}
