import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import {
  ICrearCentralNotificacionRequest,
  IEditarCentralNotificacionRequest,
  IEliminarCentralNotificacion,
  IEliminarCentralNotificacionRequest,
  IListCentralNotificacionesRequest,
  IPaginacionListCentralNotificaciones,
  IMessageDuplicado,
  IEditarCentralNotificacionDuplicado,
} from '@interfaces/central-notifcaciones/central-notificaciones';

@Injectable({ providedIn: 'root' })
export class CentralNotificacionesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/centralesNotificaciones`;
  private readonly baseUrlMaestros: string = `${BACKEND.CFEMAESTROS}`;

  public obtenerListaCentralesNotificaciones(request: IListCentralNotificacionesRequest): Observable<IPaginacionListCentralNotificaciones> {
    const url = `${this.baseUrl}/listaCentralesNotificaciones`;
    return this.http.post<IPaginacionListCentralNotificaciones>(url, request);
  }

  public crearNuevaCentral(request: ICrearCentralNotificacionRequest): Observable<IMessageDuplicado> {
    const url = `${this.baseUrl}/agregaCentralNotificacion`;
    return this.http.post<IMessageDuplicado>(url, request);
  }

  public editarCentral(request: IEditarCentralNotificacionRequest): Observable<IEditarCentralNotificacionDuplicado> {
    const url = `${this.baseUrl}/modificaCentralNotificacion`;
    return this.http.post<IEditarCentralNotificacionDuplicado>(url, request);
  }

  public eliminarCentral(request: IEliminarCentralNotificacionRequest): Observable<IEliminarCentralNotificacion> {
    const url = `${this.baseUrl}/eliminaCentralNotificacion`;
    return this.http.post<IEliminarCentralNotificacion>(url, request);
  }

  public getListaDistritosFiscales(): Observable<any> {
    const url = `${this.baseUrlMaestros}v1/cftm/e/distritofiscal`;
    return this.http.get<any>(url);
  }
}
