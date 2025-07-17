import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  SedeBandeja,
  SedeBandejaRequest,
  SedeBandejaResponse,
  SedeBandejaExcelRequest,
} from '@interfaces/admin-sedes/admin-sedes';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminSedeService {
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/administrarsedes`;

  private readonly http: HttpClient = inject(HttpClient);

  public obtenerSedes(request: SedeBandejaRequest): Observable<SedeBandejaResponse> {
    const url = `${this.baseUrl}/listar`;
    return this.http.post<SedeBandejaResponse>(url, request);
  }

  public crearNuevaSede(sede: SedeBandeja): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, sede);
  }

  public editarSede(sede: SedeBandeja): Observable<any> {
    const url = `${this.baseUrl}/editar`;
    return this.http.put(url, sede);
  }

  public eliminarSede(sede: SedeBandeja): Observable<any> {
    const url = `${this.baseUrl}/eliminar`;
    return this.http.post(url, sede);
  }

  public obtenerSedesExcel(request: SedeBandejaExcelRequest): Observable<Blob> {
    const url = `${this.baseUrl}/listarExcel`;
    return this.http.post(url, request, { responseType: 'blob' });
  }
}
