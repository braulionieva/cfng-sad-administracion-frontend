import { HttpClient, HttpHeaders } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {
  GrupoAleatorioBandejaRequest,
  GrupoAleatorioBandejaResponse
} from '@interfaces/grupo-aleatorio/grupo-aleatorio';
import { Observable } from 'rxjs';
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root',
})
export class GrupoAleatorioService {

  private readonly baseUrl :string = `${BACKEND.PATH_SAD_DEV}v1/e/grupoaleatorio`;
  private readonly http: HttpClient = inject(HttpClient);


  public obtenerGruposAleatorios(request: GrupoAleatorioBandejaRequest): Observable<GrupoAleatorioBandejaResponse> {
    const url = `${this.baseUrl}/gruposAleatorios`;
    return this.http.post<GrupoAleatorioBandejaResponse>(url, request);
  }
  guardarDocumento(request: any): Observable<any> {
     /**return this.http.post(`${this.baseUrl}/documento`, request);**/
     return this.http.post(`${BACKEND.PATH_SAD_DEV}v1/e/grupoaleatorio/documento`, request);
  }
  cargaInicial(request: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/cargainicial`, request);
  }
  eliminarGrupo(id: string): Observable<any> {
    const url = `${this.baseUrl}/eliminar/${id}`;
    return this.http.delete(url);
  }

  agregarGrupo(request): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, request);
  }
  /**
  // consultaDocumentos(id: string): Observable<any> {
  //   const url = `${this.baseUrl}/documento/${id}`;
  //   return this.http.get(url);
  // }**/
  consultaDocumentos(id: string): Observable<any> {
    /**const url = `${this.baseUrl}/archivo/${id}`;**/
    return this.http.get(`${this.baseUrl}/archivo/${id}`);
  }
  obtenerDocumentoServidor(id: string): Observable<any> {

    return this.http.get(`${this.baseUrl}/archivo/${id}`);
  }

  public exportarGruposAleatorios(
    request: GrupoAleatorioBandejaRequest
  ): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url, request, {
      headers: headers,
      responseType: 'blob',
    });
  }
  obtenerFiscalesPorDespacho(codigoDespacho: string): Observable<any> {
    const url = `${this.baseUrl}/fiscales/despacho/${codigoDespacho}`;
    return this.http.get(url);
  }
  //posible eliminar ahora se trabaja con obtenerDespachosPorCodigoEntidad
  obtenerFiscalesPorEntidad(codigoFiscalia: string): Observable<any> {
    let url:any;
     url = `${this.baseUrl}/fiscales/entidad/${codigoFiscalia}`;

    return this.http.get(url);
  }

  obtenerDespachosPorCodigoEntidad(codigoFiscalia: string): Observable<any> {
    let url:any;
     url = `${this.baseUrl}/despachos/entidadV2/${codigoFiscalia}`;

    return this.http.get(url);
  }
  // public getFiscaliasXDF(idDistritoFiscal): Observable<any> {
  //    return this.http.get(`${this.baseUrl}/fiscalias/distritofiscal/${idDistritoFiscal}`);
  // }

  getFiscaliasXDFSedeTipoYEspecialidad(request: any): Observable<any> {
    const url = `${this.baseUrl}/getFiscaliasXDFSedeTipoYEspecialidad`;
    return this.http.post<any>(url, request);
  }

  public verDetalleGrupoAleatorio(request: any): Observable<any>{
    const url = `${this.baseUrl}/verDetalleGrupoAleatorio`;
    return this.http.post(url, request);
  }

  public obtenerCabeceraVerDetalleGrupoAleatorio(request: any): Observable<any>{
    const url = `${this.baseUrl}/verDetalleGrupoAleatorioCabecera`;
    return this.http.post(url, request);
  }

  //metodos para editar grupo aleatorio
  obtenerFiscaliasGrupoAleatorio(id: string): Observable<any> {
    let url:any;
    url = `${this.baseUrl}/detalle/${id}`;

    return this.http.get(url);
  }

  //metodo para editar grupo aleatorio V2
  obtenerFiscaliasGrupoAleatorioV2(id: string): Observable<any> {
    let url:any;
    url = `${this.baseUrl}/detalleV2/${id}`;

    return this.http.get(url);
  }

  editarGrupo(request): Observable<any> {
    const url = `${this.baseUrl}/editar`;
    return this.http.post(url, request);
  }
}
