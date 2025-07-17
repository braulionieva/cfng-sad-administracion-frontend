import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { DistritoGeografico } from '@interfaces/admin-sedes/admin-sedes';
import { Observable, map } from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class MaestroService {
  private readonly baseUrlMaestroSad = `${BACKEND.PATH_SAD_DEV}v1/e/maestrosad`;
  private readonly baseUrlMaestros =`${BACKEND.CFEMAESTROS}v1`;

  private readonly http: HttpClient = inject(HttpClient);

  public obtenerDistritosFiscales(): Observable<any> {
    const url = `${this.baseUrlMaestros}/cftm/e/distritofiscal`;
    return this.http.get<any>(url);
  }

  public obtenerDistritoGeografico(
    idDistritoFiscal: number
  ): Observable<DistritoGeografico[]> {
    const url = `${this.baseUrlMaestroSad}/distritogeografico/${idDistritoFiscal}`;
    return this.http.get<DistritoGeografico[]>(url);
  }

  public listarTramites(): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/listartramites`;
    return this.http.get<any>(url);
  }

  public listarActoProcesal(): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/actosprocesales`;
    return this.http.get<any>(url);
  }

  public listarCarpetaCuadernos(): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/cuadernos`;
    return this.http.get<any[]>(url);
  }

  public listarTipoEspecialidad(): Observable<any> {
    const url = `${this.baseUrlMaestros}/cftm/e/tipoespecialidad`;
    return this.http.get<any>(url);
  }

  public listarEspecialidad(): Observable<any> {
    const url = `${this.baseUrlMaestros}/cftm/e/especialidad`;
    return this.http.get<any>(url);
  }

  public listarEspecialidadPorTipo(codigoTipo: string): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/especialidad/${codigoTipo}`;
    return this.http.get<any>(url);
  }

  public listarJerarquia(): Observable<any> {
    const url = `${this.baseUrlMaestros}/cftm/e/jerarquias`;
    return this.http.get<any>(url);
  }

  public listarTipoProceso(): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/tipoproceso`;
    return this.http.get<any>(url);
  }

  public listarSubTipoProceso(idProceso: number): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/subtipos/${idProceso}`;
    return this.http.get<any>(url);
  }

  public listarEtapas(): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/etapas`;
    return this.http.get<any>(url);
  }

  public listarDistritosFiscalesActivos(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/cftm/e/distritofiscal`)
      .pipe(map((response) => response.data));
  }

  public listarDependenciasFiscalesActivosPorDistritoFiscal(
    id: number
  ): Observable<any> {
    const url = `${this.baseUrlMaestros}/cftm/e/dependenciafiscal/distritofiscal/${id}`;
    return this.http.get<any>(url);
  }

  public listarDependenciasFiscalesActivos(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/cftm/e/dependenciafiscal`)
      .pipe(map((response) => response.data));
  }

  public listarDespachosActivos(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/cftm/e/despacho`)
      .pipe(map((response) => response.data));
  }

  public listarDependenciasPorDistrito(
    idDistritoFiscal: number
  ): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(
        `${this.baseUrlMaestros}/cftm/e/dependenciafiscal/distritofiscal/${idDistritoFiscal}`
      )
      .pipe(map((response) => response.data));
  }

  public listarDespachoPorEntidad(
    idDependencia: string
  ): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/cftm/e/despacho/${idDependencia}`)
      .pipe(map((response) => response.data));
  }

  public listarTipoEspecialidad_pipe(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/cftm/e/tipoespecialidad`)
      .pipe(map((response) => response.data));
  }

  public listarEspecialidad_pipe(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/cftm/e/especialidad`)
      .pipe(map((response) => response.data));
  }

  public listarEstadoCaso(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/eftm/e/estadocaso`)
      .pipe(map((response) => response.data));
  }

  public listarDistribucionAleatoria(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/eftm/t/tipodistribucionaleatoria`)
      .pipe(map((response) => response.data));
  }

  public listarDelitoEspecifico(): Observable<any> {
    const url = `${this.baseUrlMaestros}/cftm/e/delito/subgenerico/especifico`;
    return this.http.get<any>(url);
  }
  public listarArticulos(): Observable<MaestroGenerico[]> {
    return this.http
      .get<any>(`${this.baseUrlMaestros}/cftm/e/delito`)
      .pipe(map((response) => response.data));
  }

  public listarCargos(): Observable<any> {
    const url = `${this.baseUrlMaestroSad}/cargos`;
    return this.http.get<any>(url);
  }

  public listarDependencias(request: any): Observable<any> {
    const url = `${this.baseUrlMaestroSad}/dependencias`;
    return this.http.post<any>(url, request);
  }

  public listarNacionalidad(): Observable<any> {
    const url = `${this.baseUrlMaestroSad}/nacionalidad`;
    return this.http.get<any>(url);
  }
  public listarTipoDocumento(): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/tipodocumento`;
    return this.http.get<any>(url).pipe(map((response) => response.data));
  }
  public listarTipoEntidad(): Observable<any> {
    const url = `${this.baseUrlMaestros}/eftm/e/tipoentidad`;
    return this.http.get<any>(url).pipe(map((response) => response.data));
  }
}
