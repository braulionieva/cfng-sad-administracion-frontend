import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ActualizarDependenciaRes,
  AgregarDependenciaRes,
  BuscarDependenciaReq, BuscarDependenciaReqFiltro,
  BuscarDependenciaRes,
  EntidadForm,
  EspecialidadDTOB,
  JerarquiaDTOB,
  SiDuplicadoCoVEntidadRes
} from '@interfaces/administrar-dependencia/administrar-dependencia';
import { lastValueFrom, Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdministrarDependenciaService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/administrarDependencia`;

  public buscarDependencia(request: BuscarDependenciaReq): Observable<BuscarDependenciaRes> {
    const url = `${this.baseUrl}/buscarDependencia`;
    return this.http.post<BuscarDependenciaRes>(url, request);
  }

  public getJerarquiaLst(): Observable<JerarquiaDTOB[]> {
    const url = `${this.baseUrl}/getJerarquiaLst`;
    return this.http.get<JerarquiaDTOB[]>(url);
  }

  public getEspecialidadLst(): Observable<EspecialidadDTOB[]> {
    const url = `${this.baseUrl}/getEspecialidadLst`;
    return this.http.get<EspecialidadDTOB[]>(url);
  }

  public getEspecialidadLstXTipoEspecialidad(idNTipoEspecialidad: number): Observable<EspecialidadDTOB[]> {
    const url = `${this.baseUrl}/getEspecialidadLst/${idNTipoEspecialidad}`;
    return this.http.get<EspecialidadDTOB[]>(url);
  }

  public agregarDependencia(request: EntidadForm): Observable<AgregarDependenciaRes> {
    const url = `${this.baseUrl}/agregarDependencia`;
    return this.http.post<AgregarDependenciaRes>(url, request);
  }

  public getDependencia(coVEntidad: string): Observable<EntidadForm> {
    const url = `${this.baseUrl}/getDependencia/${coVEntidad}`;
    return this.http.get<EntidadForm>(url);
  }

  public actualizarDependencia(request: EntidadForm): Observable<ActualizarDependenciaRes> {
    const url = `${this.baseUrl}/actualizarDependencia`;
    return this.http.post<ActualizarDependenciaRes>(url, request);
  }

  public exportarExcel(request: BuscarDependenciaReqFiltro): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarExcel`;

    return this.http.post(url,
      request,
      {
        headers: headers,
        responseType: 'blob',
      }
    );

  }

  public async siDuplicadoCoVEntidad(coVEntidad: string)
    : Promise<SiDuplicadoCoVEntidadRes> {
    const url = `${this.baseUrl}/siDuplicadoCoVEntidad?coVEntidad=${coVEntidad}`;
    const response = this.http.get<SiDuplicadoCoVEntidadRes>(url);
    return await lastValueFrom(response);
  }
}
