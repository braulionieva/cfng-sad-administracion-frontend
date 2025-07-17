import { inject, Injectable, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ICrearPlazoDetencion,
  ICrearPlazoDetencionRequest,
  IEditarPlazoDetencion,
  IEditarPlazoRequest,
  IEliminarPlazoDetencion,
  IEliminarPlazoRequest,
  IListPlazoDetencionFlagranciaExcelRequest,
  IListPlazoDetencionFlagranciaRequest,
  IPaginacionListPlazoDetencionFlagrania,
} from '@interfaces/plazo-detencion-flagrancia/plazo-detencion-flagrancia';
import { BACKEND } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class PlazoDetencionFlagranciaService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/plazoDetencionFlagrancia`;

  public obtenerListaCategorias(): Observable<any[]> {
    const url = `${this.baseUrl}/listaTipoEspecialidad`;
    return this.http.get<any[]>(url);
  }

  public obtenerListaEspecialidad(idTipoEspecialidad: number): Observable<any[]> {
    const url = `${this.baseUrl}/listaEspecialidad?idTipoEspecialidad=${idTipoEspecialidad}`;
    return this.http.get<any[]>(url);
  }

  public obtenerListaPlazosDetencionFlagrancia(request: IListPlazoDetencionFlagranciaRequest): Observable<IPaginacionListPlazoDetencionFlagrania> {
    const url = `${this.baseUrl}/listaPlazosDetencionFlagrancia`;
    return this.http.post<IPaginacionListPlazoDetencionFlagrania>(url, request);
  }

  public obtenerListaPlazosDetencionFlagranciaExcel(request: IListPlazoDetencionFlagranciaExcelRequest): Observable<Blob> {
    const url = `${this.baseUrl}/listaPlazosDetencionFlagranciaExcel`;
    return this.http.post(url, request, { responseType: 'blob' });
  }

  public crearNuevoPlazo(request: ICrearPlazoDetencionRequest): Observable<ICrearPlazoDetencion> {
    const url = `${this.baseUrl}/crearPlazoDetencionFlagrancia`;
    return this.http.post<ICrearPlazoDetencion>(url, request);
  }

  public editarPlazo(request: IEditarPlazoRequest): Observable<IEditarPlazoDetencion> {
    const url = `${this.baseUrl}/editarPlazoDetencionFlagrancia`;
    return this.http.post<IEditarPlazoDetencion>(url, request);
  }

  public eliminarPlazo(request: IEliminarPlazoRequest): Observable<IEliminarPlazoDetencion> {
    const url = `${this.baseUrl}/eliminaPlazoDetencionFlagrancia`;
    return this.http.post<IEliminarPlazoDetencion>(url, request);
  }
}
