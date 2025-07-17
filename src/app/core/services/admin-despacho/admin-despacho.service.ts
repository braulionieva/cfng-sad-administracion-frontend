import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Dependencia,
  Despacho,
  DespachoBandejaRequest,
  DespachoResponse,
  DistritoFiscal,
  Filtros,
  Sede,
  Topologia
} from '@interfaces/admin-despacho/admin-despacho';
import { Observable } from 'rxjs';
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdminDespachoService {

  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/adminDespacho`;

  private readonly  http: HttpClient = inject(HttpClient);

  public obtenerDespachos(request: DespachoBandejaRequest): Observable<DespachoResponse> {
    const url = `${this.baseUrl}/despachos`;
    return this.http.post<DespachoResponse>(url, request);
  }

  public listarComboDistritoFiscal(): Observable<DistritoFiscal[]> {
    const url = `${this.baseUrl}/distritosFiscales`;
    return this.http.post<DistritoFiscal[]>(url, null);
  }

  public listarComboDependencia(distritoFiscal: DistritoFiscal): Observable<Dependencia[]> {
    const url = `${this.baseUrl}/dependencias`;
    return this.http.post<Dependencia[]>(url, distritoFiscal);
  }

  public exportarDespachos(request: Filtros): Observable<any> {

    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url,
                          request,
                          {
                            headers: headers,
                            responseType: 'blob',
                          }
                          );
  }

  public listarComboSede(distritoFiscal: DistritoFiscal): Observable<Sede[]> {
    const url = `${this.baseUrl}/sedes`;
    return this.http.post<Sede[]>(url, distritoFiscal);
  }

  public listarComboDependenciaBySede(sede: Sede): Observable<Dependencia[]> {
    const url = `${this.baseUrl}/dependenciasBySede`;
    return this.http.post<Dependencia[]>(url, sede);
  }

  public listarComboTopologia(): Observable<Topologia[]> {
    const url = `${this.baseUrl}/topologias`;
    return this.http.post<Topologia[]>(url, null);
  }

  public crearDespacho(despacho: Despacho): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, despacho);
  }

  public editarDespacho(despacho: Despacho): Observable<any> {
    const url = `${this.baseUrl}/editar`;
    return this.http.put(url, despacho);
  }

  public obtenerDespacho(despacho: Despacho): Observable<Despacho> {
    const url = `${this.baseUrl}/getDespacho`;
    return this.http.post<Despacho>(url, despacho);
  }

  public eliminarDespacho(codigoDespacho: string): Observable<any> {
    const url = `${this.baseUrl}/eliminar/${codigoDespacho}`;
    return this.http.delete(url);
  }

}
