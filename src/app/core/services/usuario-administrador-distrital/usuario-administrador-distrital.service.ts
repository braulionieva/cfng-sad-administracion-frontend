import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from '@services/shared/api.base.service';
import { FirmaDocumentoResponse } from '@interfaces/firma-documento/firma-documento';

@Injectable({
  providedIn: 'root',
})

export class UsuarioAdministradorDistritalService {
  // private readonly baseUrl = 'http://cfms-sad-administracion-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/sad/administracion/v1';

  constructor(private readonly apiBase: ApiBaseService) { }

  obtenerListaFechasNoLaborables(request: any): any {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/e/calendarionolaborable/listar`, request);

  }
  agregarFechaNoLaborable(request: any): any {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/e/calendarionolaborable/agregar`, request);
  }

  eliminarFechaNoLaborable(fecha: string, usuario: string): Observable<FirmaDocumentoResponse> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/e/calendarionolaborable/eliminarFecha/${fecha}/usuario/${usuario}`);
  }
}
