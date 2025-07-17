import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { SedeDTOB } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { BuscarFiscaliaConfigReqWrap, BuscarFiscaliaConfigResWrap, FiscaliaPorDFDTO, FiscaliaPadreTableRow, GetFiscaliasXCustomParamsReq, GetFiscaliaXCoEntidadBasicRes, AgregarFiscaliaPadreRes, AgregarFiscaliaPadreReq, ActualizarFiscaliaPadreReq, ActualizarFiscaliaPadreRes, EliminarFiscaliaPadreReq, EliminarFiscaliaPadreRes } from '@interfaces/configurarMasDeUnaFiscalia/ConfigurarMasDeUnaFiscalia';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigurarMasDeUnaFiscaliaService {
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/configurarMasDeUnaFiscalia`;
  private readonly http: HttpClient = inject(HttpClient);

  public buscarFiscaliaConfig(request: BuscarFiscaliaConfigReqWrap):
    Observable<BuscarFiscaliaConfigResWrap> {
    const url = `${this.baseUrl}/buscarFiscaliaConfig`;
    return this.http.post<BuscarFiscaliaConfigResWrap>(url, request);
  }

  //sede x DF
  public getSedesXDF(idNDistritoFiscal: number): Observable<SedeDTOB[]> {
    const url = `${this.baseUrl}/getSedesXDF/${idNDistritoFiscal}`;
    return this.http.get<SedeDTOB[]>(url);
  }

  //metodo asincronico para obtener datos
  public async getSedesXDFAsync(idNDistritoFiscal: number): Promise<SedeDTOB[]> {
    const url = `${this.baseUrl}/getSedesXDF/${idNDistritoFiscal}`;
    try {
      const response = this.http.get<SedeDTOB[]>(url);
      return await lastValueFrom(response);

    } catch (error) {
      console.error('Error al obtener los datos:', error);
      throw new Error('Error al obtener los datos');
    }
  }

  public getFiscaliasXDF(idNDistritoFiscal: number): Observable<FiscaliaPorDFDTO[]> {
    const url = `${this.baseUrl}/getFiscaliasXDF?idNDistritoFiscal=${idNDistritoFiscal}`;
    return this.http.get<FiscaliaPorDFDTO[]>(url);
  }

  public getFiscaliasXCustomParams(request: GetFiscaliasXCustomParamsReq): Observable<FiscaliaPorDFDTO[]> {
    const url = `${this.baseUrl}/getFiscaliasXCustomParams`;
    return this.http.post<FiscaliaPorDFDTO[]>(url, request);
  }

  public getFiscaliasXSede(coVSede: string): Observable<FiscaliaPorDFDTO[]> {
    const url = `${this.baseUrl}/getFiscaliasXSede?coVSede=${coVSede}`;
    return this.http.get<FiscaliaPorDFDTO[]>(url);
  }

  public getFiscaliasXJerarquia(idNJerarquia: number): Observable<FiscaliaPorDFDTO[]> {
    const url = `${this.baseUrl}/getFiscaliasXJerarquia/${idNJerarquia}`;
    return this.http.get<FiscaliaPorDFDTO[]>(url);
  }

  public getFiscaliasPadreForTable(coVEntidad: string): Observable<FiscaliaPadreTableRow[]> {
    const url = `${this.baseUrl}/getFiscaliasPadreForTable?coVEntidad=${coVEntidad}`;
    return this.http.get<FiscaliaPadreTableRow[]>(url);
  }

  public getFiscaliasXCoEntidadBasic(coVEntidad: string): Observable<GetFiscaliaXCoEntidadBasicRes> {
    const url = `${this.baseUrl}/getFiscaliasXCoEntidadBasic?coVEntidad=${coVEntidad}`;
    return this.http.get<GetFiscaliaXCoEntidadBasicRes>(url);
  }

  exportarexcel(request: BuscarFiscaliaConfigReqWrap) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url, request, { headers: headers, responseType: 'blob' });
  }

  public async agregarFiscaliaPadre(request: AgregarFiscaliaPadreReq): Promise<AgregarFiscaliaPadreRes> {
    const url = `${this.baseUrl}/agregarFiscaliaPadre`;

    try {
      const response = this.http.post<AgregarFiscaliaPadreRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      console.error('Error validating configuration type:', error);
      throw new Error('Failed to validate configuration type');
    }
  }

  public async actualizarFiscaliaPadre(request: ActualizarFiscaliaPadreReq): Promise<ActualizarFiscaliaPadreRes> {
    const url = `${this.baseUrl}/actualizarFiscaliaPadre`;

    try {
      const response = this.http.post<ActualizarFiscaliaPadreRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      console.error('Error validating configuration type:', error);
      throw new Error('Failed to validate configuration type');
    }
  }

  public async eliminarFiscaliaPadre(request: EliminarFiscaliaPadreReq): Promise<EliminarFiscaliaPadreRes> {
    const url = `${this.baseUrl}/eliminarFiscaliaPadre`;

    try {
      const response = this.http.post<EliminarFiscaliaPadreRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      console.error('Error validating configuration type:', error);
      throw new Error('Failed to validate configuration type');
    }
  }
}