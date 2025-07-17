import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { BuscarAcusacionReq, AcusacionRes, BuscarSobreseimientoReq, SobreseimientoRes, AgregarAcusacionReq, AgregarAcusacionRes, ActualizarAcusacionReq, ActualizarAcusacionRes, AgregarSobreseimientoRes, AgregarSobreseimientoReq, ActualizarSobreseimientoReq, ActualizarSobreseimientoRes, EliminarAcusacionReq, EliminarAcusacionRes, EliminarSobreseimientoReq, EliminarSobreseimientoRes, BuscarAcusacionReqFiltro, BuscarSobreseimientoReqFiltro } from '@interfaces/contenido-etapa-intermedia/ContenidoEtapaIntermedia';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContenidoEtapaIntermediaService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/contenidoEtapaIntermedia`;

  public buscarAcusacion(request: BuscarAcusacionReq): Observable<AcusacionRes> {
    const url = `${this.baseUrl}/buscarAcusacion`;
    return this.http.post<AcusacionRes>(url, request);
  }

  public buscarSobreseimiento(request: BuscarSobreseimientoReq): Observable<SobreseimientoRes> {
    const url = `${this.baseUrl}/buscarSobreseimiento`;
    return this.http.post<SobreseimientoRes>(url, request);
  }

  public async agregarAcusacion(request: AgregarAcusacionReq): Promise<AgregarAcusacionRes> {
    const url = `${this.baseUrl}/agregarAcusacion`;

    try {
      const response = this.http.post<AgregarAcusacionRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }

  public async actualizarAcusacion(request: ActualizarAcusacionReq): Promise<ActualizarAcusacionRes> {
    const url = `${this.baseUrl}/actualizarAcusacion`;

    try {
      const response = this.http.post<ActualizarAcusacionRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }

  public async agregarSobreseimiento(request: AgregarSobreseimientoReq): Promise<AgregarSobreseimientoRes> {
    const url = `${this.baseUrl}/agregarSobreseimiento`;

    try {
      const response = this.http.post<AgregarSobreseimientoRes>(url, request);
      return await lastValueFrom(response);

    } catch (error) {
      console.error('Error al enviar datos:', error);
      throw new Error('Error al enviar datos');
    }
  }

  public async actualizarSobreseimiento(request: ActualizarSobreseimientoReq): Promise<ActualizarSobreseimientoRes> {
    const url = `${this.baseUrl}/actualizarSobreseimiento`;

    try {
      const response = this.http.post<ActualizarSobreseimientoRes>(url, request);
      return await lastValueFrom(response);

    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }

  public async eliminarAcusacion(request: EliminarAcusacionReq): Promise<EliminarAcusacionRes> {
    const url = `${this.baseUrl}/eliminarAcusacion`;

    try {
      const response = this.http.post<EliminarAcusacionRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }

  public async eliminarSobreseimiento(request: EliminarSobreseimientoReq): Promise<EliminarSobreseimientoRes> {
    const url = `${this.baseUrl}/eliminarSobreseimiento`;

    try {
      const response = this.http.post<EliminarSobreseimientoRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }

  public buscarAcusacionExcel(request: BuscarAcusacionReqFiltro): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = `${this.baseUrl}/buscarAcusacionExcel`;

    return this.http.post(url, request, { headers: headers, responseType: 'blob', });
  }

  public buscarSobreseimientoExcel(request: BuscarSobreseimientoReqFiltro): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = `${this.baseUrl}/buscarSobreseimientoExcel`;

    return this.http.post(url, request, { headers: headers, responseType: 'blob' });
  }
}
