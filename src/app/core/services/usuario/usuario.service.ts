import {inject, Injectable} from '@angular/core';
import {lastValueFrom, map, Observable} from 'rxjs';
import { BACKEND } from '@environments/environment';
import {
  Dependencia,
  TipoDocumento,
  RequestUsuarioDTO,
  RequestFoto,
} from '@interfaces/usuario/usuario';
import { ApiBaseService } from '@services/shared/api.base.service';
import { FiltrosUsuario } from '@interfaces/shared/shared';
import {SiDuplicadoDocumentoRes} from "@services/admin-usuario/usuarioBean";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/usuario`;

  constructor(private readonly apiBase: ApiBaseService) {}

  bandejaUsuarios(request: FiltrosUsuario): Observable<any> {
    return this.apiBase.post(
      `${this.baseUrl}/usuarios`,
      request
    );
  }

  obtenerUsuario(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${this.baseUrl}/obtenerUsuario/${idUsuario}`);
  }

  obtenerUsuarioXDni(numeroDni: string): Observable<any> {
    return this.apiBase.get(`${this.baseUrl}/obtenerUsuarioXDni/${numeroDni}`);
  }

  registrarFoto(request: RequestFoto): Observable<any> {
    return this.apiBase.post(`${this.baseUrl}/agregarFoto`, request);
  }

  public eliminarFoto(
    idUsuario: string,
    usuarioModificador: string
  ): Observable<any> {
    const url = `${this.baseUrl}/eliminarFoto/${idUsuario}/${usuarioModificador}`;
    return this.apiBase.delete(url);
  }

  obtenerUsuarioCompleto(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${this.baseUrl}/completo/${idUsuario}`);
  }

  historialUsuario(idUsuario: string, filtro: string): Observable<any> {
    return this.apiBase.get(
      `${this.baseUrl}/historial/${idUsuario}/registrador/${filtro}`
    );
  }

  public crearUsuario(request: RequestUsuarioDTO): Observable<any> {
    return this.apiBase.post(`${this.baseUrl}/crearUsuario`, request);
  }

  public updateUsuario(
    idUsuario: string,
    request: RequestUsuarioDTO
  ): Observable<any> {
    return this.apiBase.put(`${this.baseUrl}/editar/${idUsuario}`, request);
  }

  public listarTipoDocumento(): Observable<any> {
    return this.apiBase.get(`${this.baseUrl}/tipodocidentidad/562`);
  }

  public consultarCorreoBD(correo: string): Observable<any> {
    return this.apiBase.get(`${this.baseUrl}/buscaCorreo/${correo}`);
  }

  public getDependenciaPorDistritoFiscalSedeTipoDependencia(
    idDistritoFiscal: number = 2,
    codigoSede: string = '202',
    idTipoEntidad: number = 1
  ): Observable<TipoDocumento[]> {
    return this.apiBase
      .getWithInterface<{ code: number; message: string; data: Dependencia[] }>(
        `${this.baseUrl}/dependenciafiscal/${idDistritoFiscal}/${codigoSede}/${idTipoEntidad}`
      )
      .pipe(
        map((response) => response.data) // Filtrar solo la parte de datos de la respuesta
      );
  }

  public validarCargaMasiva(data: any): Observable<any> {
    return this.apiBase.post(`${this.baseUrl}/validarCargaMasiva`, data);
  }

  public registrarCargaMasiva(data: any): Observable<any> {
    return this.apiBase.post(`${this.baseUrl}/registrarCargaMasiva`, data);
  }

  generateReport(data: any): Observable<any> {
    return this.apiBase.post(`${this.baseUrl}/generate`, data);
  }

  obtenerFotoXCousername(coVUsername: string): Observable<any> {
    return this.apiBase.get(`${this.baseUrl}/obtenerFotoXCousername/${coVUsername}`);
  }

  async siDuplicadoDocumento(
    nuVDocumento: string,
    idNTipoDocIdent: number,
    idVUsuarioActual?: string
  ): Promise<SiDuplicadoDocumentoRes> {
    let url = `${this.baseUrl}/siDuplicadoDocumento?nuVDocumento=${nuVDocumento}&idNTipoDocIdent=${idNTipoDocIdent}`;

    if (idVUsuarioActual) {
      url += `&idVUsuarioActual=${idVUsuarioActual}`;
    }

    return lastValueFrom(this.http.get<SiDuplicadoDocumentoRes>(url));
  }

}
