import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActualizarPlazoRes, BuscarPlazoDocObsRes, BuscarPlazoReq, DistritoFiscalDTOB, EliminarPlazoReq, EliminarPlazoRes, EspecialidadDTOB, InsertarPlazoRes, PlazoForm, TipoConfiguracionPlazo, TipoDias, TipoEspecialidadDTOB } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import { lastValueFrom, Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";

@Injectable({ providedIn: 'root' })
export class PlazoDocObsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/plazoDocObs`;

  //search
  public buscarPlazoFormFiltro(buscarPlazoReq: BuscarPlazoReq): Observable<BuscarPlazoDocObsRes> {
    const url = `${this.baseUrl}/buscarPlazoFormFiltro`;
    return this.http.post<BuscarPlazoDocObsRes>(url, buscarPlazoReq);
  }

  public getTipoConfiguracionLst(): Observable<TipoConfiguracionPlazo[]> {
    const url = `${this.baseUrl}/getTipoConfiguracionLst`;
    return this.http.get<TipoConfiguracionPlazo[]>(url);
  }

  //df
  public getDistritoFiscalLst(): Observable<DistritoFiscalDTOB[]> {
    const url = `${this.baseUrl}/getDistritoFiscalLst`;
    return this.http.get<DistritoFiscalDTOB[]>(url);
  }

  public getEspecialidadLst(idNTipoEspecialidad: number): Observable<EspecialidadDTOB[]> {
    const url = `${this.baseUrl}/getEspecialidadLst/${idNTipoEspecialidad}`;
    return this.http.get<EspecialidadDTOB[]>(url);
  }

  public getTipoEspecialidadLst(): Observable<TipoEspecialidadDTOB[]> {
    const url = `${this.baseUrl}/getTipoEspecialidadLst`;
    return this.http.get<TipoEspecialidadDTOB[]>(url);
  }

  public getTipoEspecialidadLstPorDF(idNDistritoFiscal: number): Observable<TipoEspecialidadDTOB[]> {
    const url = `${this.baseUrl}/getTipoEspecialidadLstPorDF?idNDistritoFiscal=${idNDistritoFiscal}`;
    return this.http.get<TipoEspecialidadDTOB[]>(url);
  }

  public getTipoDias(): Observable<TipoDias[]> {
    const url = `${this.baseUrl}/getTipoDias`;
    return this.http.get<TipoDias[]>(url);
  }

  public async validarUnicidadTipoConfigXEspecialidad(idNTipoConfiguracion: number, idNDistritoFiscal: number, idNTipoEspecialidad: number, idVEspecialidad: string): Promise<boolean> {
    const url = `${this.baseUrl}/validarUnicidadTipoConfigXEspecialidad/${idNTipoConfiguracion}/${idNDistritoFiscal}/${idNTipoEspecialidad}/${idVEspecialidad}`;

    try {
      const response = this.http.get<boolean>(url);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  public async validarUnicidadTipoConfigXTipEspecialidad(idNTipoConfiguracion: number, idNDistritoFiscal: number, idNTipoEspecialidad: number): Promise<boolean> {
    const url = `${this.baseUrl}/validarUnicidadTipoConfigXTipEspecialidad/${idNTipoConfiguracion}/${idNDistritoFiscal}/${idNTipoEspecialidad}`;

    try {
      const response = this.http.get<boolean>(url);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  public async validarUnicidadTipoConfigXDistritoFiscal(idNTipoConfiguracion: number, idNDistritoFiscal: number): Promise<boolean> {
    const url = `${this.baseUrl}/validarUnicidadTipoConfigXDistritoFiscal/${idNTipoConfiguracion}/${idNDistritoFiscal}`;

    try {
      const response = this.http.get<boolean>(url);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  public async validarUnicidadTipoConfigXEspecialidadUpd(idVPlazoCaso: string, idNTipoConfiguracion: number, idNDistritoFiscal: number, idNTipoEspecialidad: number, idVEspecialidad: string): Promise<boolean> {
    const url = `${this.baseUrl}/validarUnicidadTipoConfigXEspecialidadUpd/${idVPlazoCaso}/${idNTipoConfiguracion}/${idNDistritoFiscal}/${idNTipoEspecialidad}/${idVEspecialidad}`;

    try {
      const response = this.http.get<boolean>(url);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  public async validarUnicidadTipoConfigXTipEspecialidadUpd(idVPlazoCaso: string, idNTipoConfiguracion: number, idNDistritoFiscal: number, idNTipoEspecialidad: number): Promise<boolean> {
    const url = `${this.baseUrl}/validarUnicidadTipoConfigXTipEspecialidadUpd/${idVPlazoCaso}/${idNTipoConfiguracion}/${idNDistritoFiscal}/${idNTipoEspecialidad}`;

    try {
      const response = this.http.get<boolean>(url);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  public async validarUnicidadTipoConfigXDistritoFiscalUpd(idVPlazoCaso: string, idNTipoConfiguracion: number, idNDistritoFiscal: number): Promise<boolean> {
    const url = `${this.baseUrl}/validarUnicidadTipoConfigXDistritoFiscalUpd/${idVPlazoCaso}/${idNTipoConfiguracion}/${idNDistritoFiscal}`;

    try {
      const response = this.http.get<boolean>(url);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  public async insertarPlazo(request: PlazoForm): Promise<InsertarPlazoRes> {
    const url = `${this.baseUrl}/insertarPlazo`;

    try {
      const response = this.http.post<InsertarPlazoRes>(url, request);
      return await lastValueFrom(response);

    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  //PlazoFormEdit
  public async getPlazoDocObs(idVPlazoCaso: string): Promise<PlazoForm> {
    const url = `${this.baseUrl}/getPlazoDocObs/${idVPlazoCaso}`;
    try {
      const response = this.http.get<PlazoForm>(url);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }

  public async actualizarPlazo(request: PlazoForm): Promise<ActualizarPlazoRes> {
    const url = `${this.baseUrl}/actualizarPlazo`;

    try {
      const response = this.http.post<ActualizarPlazoRes>(url, request);
      return await lastValueFrom(response);
    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }


  exportarexcel(request: BuscarPlazoReq) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url, request, { headers: headers, responseType: 'blob', });
  }

  public async eliminarPlazo(request: EliminarPlazoReq): Promise<EliminarPlazoRes> {
    const url = `${this.baseUrl}/eliminarPlazo`;

    try {
      const response = this.http.post<EliminarPlazoRes>(url, request);
      return await lastValueFrom(response);

    } catch (error) {
      throw new Error('Failed to validate configuration type');
    }
  }
}
