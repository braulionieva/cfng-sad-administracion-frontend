import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";
import {
  ActualizarAplicacionRes,
  AgregarAplicacionReq,
  AgregarAplicacionRes,
  AgregarLogoAppReq,
  AgregarLogoAppRes,
  AplicacionDTOB,
  AplicacionForm,
  BuscarAplicacioResWrap,
  CategoriaResponse,
  DisponibilidadResponse,
  EliminarAplicacioReq,
  EliminarAplicacioRes,
  EliminarLogoAplicacioReq,
  EliminarLogoAplicacioRes,
  BuscarAplicacionFiltro,
  BuscarAplicacionReq, SiDuplicadoCoVAplicacionRes
} from "@interfaces/aplicacion-bandeja/aplicacionBean";

@Injectable({ providedIn: 'root' })
export class AdminAplicacionService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/adminAplicacion`;

  //realiza la busqueda a partir de las palabras clave escrito en keyword
  public buscarAplicacionesFormFiltro(request: BuscarAplicacionReq): Observable<BuscarAplicacioResWrap> {
    const url = `${this.baseUrl}/buscarAplicacionesFormFiltro`;
    return this.http.post<BuscarAplicacioResWrap>(url, request);
  }

  public getDisponibilidadLst(): Observable<DisponibilidadResponse[]> {
    const url = `${this.baseUrl}/getDisponibilidadLst`;
    return this.http.get<DisponibilidadResponse[]>(url);
  }

  public getCategoriaLst(): Observable<CategoriaResponse[]> {
    const url = `${this.baseUrl}/getCategoriaLst`;
    return this.http.get<CategoriaResponse[]>(url);
  }
  public getAplicacionDropDownLst(): Observable<AplicacionDTOB[]> {
    const url = `${this.baseUrl}/getAplicacionDropDownLst`;
    return this.http.get<AplicacionDTOB[]>(url);
  }

  public getAplicacion(idNAplicacion: number): Observable<AplicacionForm> {
    const url = `${this.baseUrl}/getAplicacion/${idNAplicacion}`;
    return this.http.get<AplicacionForm>(url);
  }

  public async getAplicacionAsync(idNAplicacion: number): Promise<AplicacionForm> {
    const url = `${this.baseUrl}/getAplicacion/${idNAplicacion}`;
    try {
      const response = this.http.get<AplicacionForm>(url);
      return await lastValueFrom(response);

    } catch (error) {
      console.error('Error al enviar datos:', error);
      throw new Error('Error al enviar datos');
    }
  }

  public agregarAplicacion(request: AgregarAplicacionReq): Observable<AgregarAplicacionRes> {
    const url = `${this.baseUrl}/agregarAplicacion`;
    return this.http.post<AgregarAplicacionRes>(url, request);
  }

  public actualizarAplicacion(request: AgregarAplicacionReq): Observable<ActualizarAplicacionRes> {
    const url = `${this.baseUrl}/actualizarAplicacion`;
    return this.http.post<ActualizarAplicacionRes>(url, request);
  }

  public eliminarAplicacion(request: EliminarAplicacioReq): Observable<EliminarAplicacioRes> {
    const url = `${this.baseUrl}/eliminarAplicacion`;
    return this.http.post<EliminarAplicacioRes>(url, request);
  }

  public exportarexcel(filtroSearchReq: BuscarAplicacionFiltro): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url, filtroSearchReq, { headers: headers, responseType: 'blob', });
  }

  public agregarLogoAplicacion(request: AgregarLogoAppReq): Observable<AgregarLogoAppRes> {
    const url = `${this.baseUrl}/agregarLogo`;
    return this.http.post<AgregarLogoAppRes>(url, request);
  }

  public eliminarLogoAplicacion(request: EliminarLogoAplicacioReq): Observable<EliminarLogoAplicacioRes> {
    const url = `${this.baseUrl}/eliminarLogoAplicacion`;
    return this.http.post<EliminarLogoAplicacioRes>(url, request);
  }

  public async siDuplicadoCoVAplicacion(
    coVAplicacion: string,
    idNAplicacionActual: number
  ): Promise<SiDuplicadoCoVAplicacionRes> {
    let url = `${this.baseUrl}/siDuplicadoCoVAplicacion?coVAplicacion=${coVAplicacion}`;

    // Agregar idNAplicacionActual al query string solo si está presente
    if (idNAplicacionActual) {
      url += `&idNAplicacionActual=${idNAplicacionActual}`;
    }

    const response = this.http.get<SiDuplicadoCoVAplicacionRes>(url);
    return await lastValueFrom(response);
  }
}
