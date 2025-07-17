import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';
import { ApiBaseService } from '@services/shared/api.base.service';
import { FirmaDocumentoResponse } from '@interfaces/firma-documento/firma-documento';

@Injectable({
  providedIn: 'root',
})
export class CalendarioNoLaborableService {

  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/calendarionolaborable`;

  constructor(private readonly apiBase: ApiBaseService) {}

  obtenerListaFechasNoLaborables(request: any): any {
    return this.apiBase.post(
      `${this.baseUrl}/listar`,
      request
    );
  }
  agregarFechaNoLaborable(request: any): any {
    return this.apiBase.post(
      `${this.baseUrl}/agregar`,
      request
    );
  }
  editarFechaNoLaborable(request: any): any {
    return this.apiBase.post(
      `${this.baseUrl}/editar`,
      request
    );
  }
  consultarFechaNoLaborable(
    idDiaNoLaborable: string
  ): Observable<FirmaDocumentoResponse> {
    return this.apiBase.get(
      `${this.baseUrl}/consultar/${idDiaNoLaborable}`
    );
  }
  eliminarFechaNoLaborable(
    idCalendario: string,
    usuario: string
  ): Observable<FirmaDocumentoResponse> {
    return this.apiBase.get(
      `${this.baseUrl}/eliminar/${idCalendario}/usuario/${usuario}`
    );
  }
  public cargaMasivaCalendario(data: any): Observable<any> {
    return this.apiBase.post(
      `${this.baseUrl}/cargaMasiva`,
      data
    );
  }
}
