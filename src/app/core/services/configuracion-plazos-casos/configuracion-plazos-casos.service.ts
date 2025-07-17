import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PlazoResponse,
  EliminacionPlazoResponse,
} from '@modulos/configuracion-plazos/configuracion-plazos.interface';
import { BACKEND } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionPlazosCasosService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/plazosCasosAplicacion`;
  private readonly baseUrlMaestros: string = `${BACKEND.PATH_SAD_DEV}v1/e/plazoDocObs`;

  public obtenerTipoConfiguracion() {
    const url = `${this.baseUrlMaestros}/getTipoConfiguracionLst`;
    return this.http.get(url);
  }

  public obtenerDistritoFiscal() {
    const url = `${this.baseUrlMaestros}/getDistritoFiscalLst`;
    return this.http.get(url);
  }

  public obtenerTipoEspecialidad() {
    const url = `${this.baseUrlMaestros}/getTipoEspecialidadLst`;
    return this.http.get(url);
  }

  public obtenerEspecialidadPorId(id: number) {
    const url = `${this.baseUrlMaestros}/getEspecialidadLst/${id}`;
    return this.http.get(url);
  }

  public obtenerPlazoCasos(request) {
    const url = `${this.baseUrl}/plazosCasos`;
    return this.http.post<PlazoResponse>(url, request);
  }

  public crearPlazoCaso(request) {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, request);
  }

  public editarPlazoCaso(request) {
    const url = `${this.baseUrl}/editar`;
    return this.http.post(url, request);
  }

  public eliminarPlazoCaso(request) {
    const url = `${this.baseUrl}/eliminar`;
    return this.http.post<EliminacionPlazoResponse>(url, request);
  }

  public exportarExcelPlazosCasos(request): Observable<Blob> {
    const url = `${this.baseUrl}/exportarExcel`;
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post(url, request, {
      headers: headers,
      responseType: 'blob',
    });
  }
}
