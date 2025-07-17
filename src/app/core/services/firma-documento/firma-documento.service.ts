import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";
import { ApiBaseService } from '@services/shared/api.base.service';
import { FirmaDocumentoResponse } from '@interfaces/firma-documento/firma-documento';

@Injectable({
  providedIn: 'root',
})

export class FirmaDocumentoService {
  // private readonly baseUrl = 'http://cfms-sad-administracion-gestion-api-development.apps.dev.ocp4.cfe.mpfn.gob.pe/cfe/sad/administracion/v1';

  constructor(private readonly apiBase: ApiBaseService) { }

  listarFirmaDocumentoPerfil(): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/listar`);

  }
  buscarFirmaDocumentoPerfil(txtTipoDocumento: any): Observable<any> {

    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/buscar/${txtTipoDocumento}`);
  }
  buscarTipoDocumentoActivo(tipoDocumento: string): any {

    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/tipoDocumento/buscar/${tipoDocumento}`)
  }
  listarCargoActivo(): any {

    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/cargos`)
  }
  listarCargoGeneral(): any {

    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/cargos`)
  }
  listarTipoDocumento(): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/tipoDocumento`)
  }

  eliminaCargo(idCargo: string, usuario: string): Observable<FirmaDocumentoResponse> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/cargo/eliminar/${idCargo}/usuario/${usuario}`);
  }

  eliminarFirmaDocumento(codigoDocumento: string, usuario: string): Observable<FirmaDocumentoResponse> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/tipodocumento/eliminar/${codigoDocumento}/usuario/${usuario}`);
  }
  
  /**guardarTipoDocumento(tipoDocumento: string, usuario: string):Observable<any>{
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/tipodocumento/guardar/${tipoDocumento}/usuario/${usuario}`);
  }**/

  guardarTipoDocumento(request: any):Observable<any>{
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/tipodocumento/guardar`, request);
  }

  guardarFirmaDocumentoCargo(request: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/actualizar`, request);
  }
  guardarCargo(codigoCargo: string, usuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/firmadocumento/cargo/guardar/${codigoCargo}/usuario/${usuario}`);
  }

  /**public exportarExcelTipoDocumentos(request: GrupoAleatorioBandejaRequest): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    const url = `${this.baseUrl}/exportarexcel`;

    return this.http.post(url, request, {
      headers: headers,
      responseType: 'blob',
    });
  }**/
}
