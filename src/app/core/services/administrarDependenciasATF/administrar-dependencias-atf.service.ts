import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import {
  ActualizarDependenciaAtfRe,
  ActualizarDependenciaAtfReq,
  AgregarDependenciaAtfReq, AgregarDependenciaAtfRes, BuscarDependenciaAtfFiltro,
  BuscarDependenciaAtfReq,
  DepartamentoATF, DependenciaAtfTRowRes, EliminarDependenciaAtfReq, EliminarDependenciaAtfRes,
  RegionATF,
  TipoATF
} from '@interfaces/administrarDependenciasATF/administrarDependenciasATF';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministrarDependenciasATFService {
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/administrarDependenciasATF`;
  private readonly http: HttpClient = inject(HttpClient);

  public async listarTipoATF(): Promise<TipoATF[]> {
    const url = `${this.baseUrl}/listarTipoATF`;

    try {
      const response = this.http.get<TipoATF[]>(url);
      return await lastValueFrom(response);

    } catch (error) {
      console.error('Error al enviar datos:', error);
      throw new Error('Error al enviar datos');
    }
  }

  public async listarRegionATF(): Promise<RegionATF[]> {
    const url = `${this.baseUrl}/listarRegionATF`;
    const observable = this.http.get<RegionATF[]>(url);

    return await lastValueFrom(observable);
  }

  public async listarDepartamentoATFPorRegion_Async(coNRegion: number): Promise<DepartamentoATF[]> {
    const url = `${this.baseUrl}/listarDepartamentoATFPorRegion/${coNRegion}`;
    const response = this.http.get<DepartamentoATF[]>(url);
    return await lastValueFrom(response);
  }

  public listarDepartamentoATFPorRegion(coNRegion: number): Observable<DepartamentoATF[]> {
    const url = `${this.baseUrl}/listarDepartamentoATFPorRegion/${coNRegion}`;
    return this.http.get<DepartamentoATF[]>(url);
  }

  async buscarDependenciasATF(request: BuscarDependenciaAtfReq): Promise<DependenciaAtfTRowRes> {
    const url = `${this.baseUrl}/buscarDependenciasATF`;
    const response = this.http.post<DependenciaAtfTRowRes>(url, request);
    return await lastValueFrom(response);
  }

  public async agregarDependenciaAtf(request: AgregarDependenciaAtfReq): Promise<AgregarDependenciaAtfRes> {
    const url = `${this.baseUrl}/agregarDependenciaAtf`;
    const response = this.http.post<AgregarDependenciaAtfRes>(url, request);

    return await lastValueFrom(response);
  }

  public async actualizarDependenciaAtf(request: ActualizarDependenciaAtfReq): Promise<ActualizarDependenciaAtfRe> {
    const url = `${this.baseUrl}/actualizarDependenciaAtf`;
    const response = this.http.post<ActualizarDependenciaAtfRe>(url, request);

    return await lastValueFrom(response);
  }

  public async eliminarDependenciaAtf(request: EliminarDependenciaAtfReq): Promise<EliminarDependenciaAtfRes> {
    const url = `${this.baseUrl}/eliminarDependenciaAtf`;
    const response = this.http.post<EliminarDependenciaAtfRes>(url, request);

    return await lastValueFrom(response);
  }

  public buscarDependenciasATFExcel(request: BuscarDependenciaAtfFiltro): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/buscarDependenciasATFExcel`;

    return this.http.post(url, request, { headers: headers, responseType: 'blob' });
  }
}
