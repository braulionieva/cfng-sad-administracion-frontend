import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import {
  ICrearPlazo, ICrearPlazoRequest, IEditarPlazo, IEditarPlazoRequest, IEliminarPlazo,
  IEliminarPlazoRequest, IListPlazosRequest, IListPlazosRequestExcel, IPaginacionListPlazos,
} from '@interfaces/administrar-plazos/administrar-plazos';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdministrarPlazosService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/administrarPlazosActosTramitesEtapas`;
  private readonly baseUrlMaestros: string = `${BACKEND.CFEMAESTROS}`;

  public obtenerListaPlazos(request: IListPlazosRequest): Observable<IPaginacionListPlazos> {
    const url = `${this.baseUrl}/listaPlazosActosTramitesEtapas`;
    return this.http.post<IPaginacionListPlazos>(url, request);
  }

  public crearPlazo(request: ICrearPlazoRequest): Observable<ICrearPlazo> {
    const url = `${this.baseUrl}/guardaPlazo`;
    return this.http.post<ICrearPlazo>(url, request);
  }

  public editarPlazo(request: IEditarPlazoRequest): Observable<IEditarPlazo> {
    const url = `${this.baseUrl}/editarPlazoActosTramitesEtapas`;
    return this.http.post<IEditarPlazo>(url, request);
  }

  public eliminarPlazo(request: IEliminarPlazoRequest): Observable<IEliminarPlazo> {
    const url = `${this.baseUrl}/eliminarPlazoActosTramitesEtapas`;
    return this.http.post<IEliminarPlazo>(url, request);
  }

  public obtenerListaPlazosExcel(request: IListPlazosRequestExcel): Observable<Blob> {

    const url = `${this.baseUrl}/listaPlazosActosTramitesEtapasExcel`;
    return this.http.post(url, request, { responseType: 'blob' });
  }

  public obtenerListaDetallePlazosActosTramitesEtapas(request: any): Observable<any> {
    const url = `${this.baseUrl}/listaDetallePlazosActosTramitesEtapas`;
    return this.http.post<any>(url, request);
  }

  public crearNuevotramite(request: any): Observable<any> {
    const url = `${this.baseUrl}/agregaPlazoActosTramitesEtapas`;
    return this.http.post<any>(url, request);
  }

  public obtenerListaTramites(request: any): Observable<any> {
    const url = `${this.baseUrl}/listaTramites`;
    return this.http.post<any>(url, request);
  }

  // dropdowns
  public listaTipos(): Observable<any> {
    const url =
      `${this.baseUrlMaestros}v1/eftm/e/tiposPlazos`;
    return this.http.get(url);
  }

  public listaDistritosFiscales(): Observable<any> {
    const url =
      `${this.baseUrlMaestros}v1/cftm/e/distritofiscal`;
    return this.http.get(url);
  }

  public listaTiposEspecialidad(): Observable<any> {
    const url =
      `${this.baseUrlMaestros}v1/cftm/e/tipoespecialidad`;
    return this.http.get(url);
  }

  public listaEspecialidades(tipoEspecialidadId: any): Observable<any> {
    const url = `${this.baseUrlMaestros}v1/eftm/e/especialidad/${tipoEspecialidadId}`;
    return this.http.get(url);
  }
  l;
  public listaEtapas(request: any): Observable<any> {
    const url = `${this.baseUrl}/listaPreEtapasEtapas`;
    return this.http.post(url, request);
  }

  public listaUnidadesMedida(): Observable<any> {
    const url =
      `${this.baseUrlMaestros}v1/eftm/e/tipounidad`;
    return this.http.get(url);
  }

  public listaComplejidad(): Observable<any> {
    const url =
      `${this.baseUrlMaestros}v1/eftm/e/tipocomplejidad`;
    return this.http.get(url);
  }
}
