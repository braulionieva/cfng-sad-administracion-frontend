import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BACKEND } from "@environments/environment";
import { UsuarioDetalle, ProcesaUsuarioReq, ProcesaUsuarioRes } from "@interfaces/baja-usuario/baja-usuario";
import { ApiBaseService } from "@services/shared/api.base.service";
import { Observable, lastValueFrom } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AdminDistritalService {
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/t/admindistrital`
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiBase: ApiBaseService = inject(ApiBaseService);

  //metodo para detectar si la ruta actual es local o no
  public getUsuarioDetalle(idUsuario: string): Observable<UsuarioDetalle> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/detalle/${idUsuario}`);
  }

  public getDependenciasAdminDistrital(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/dependenciasadmin/${idUsuario}`);
  }

  public getDFiscalAdminDistrital(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/dfiscaladmin/${idUsuario}`);
  }

  public getDFiscalUsuario(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/dfiscalusuario/${idUsuario}`);
  }

  public getDFiscalAdmin(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/dfiscaladmin/${idUsuario}`);
  }

  public getDependenciasUsuario(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/dependenciasusuario/${idUsuario}`);
  }

  public asignarAdminDistrital(request: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/asignar`, request);
  }

  public bajaAdminDistrital(request: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/baja`, request);
  }

  esAdminDistrital(idUsuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/t/admindistrital/perfil/${idUsuario}`);
  }

  public async procesarBloquearUsuario(request: ProcesaUsuarioReq): Promise<ProcesaUsuarioRes> {
    const url = `${this.baseUrl}/procesarBloquearUsuario`;

    try {
      return await lastValueFrom(this.http.post<ProcesaUsuarioRes>(url, request));
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }

  public async procesarDesbloquearUsuario(request: ProcesaUsuarioReq): Promise<ProcesaUsuarioRes> {
    const url = `${this.baseUrl}/procesarDesbloquearUsuario`;

    try {
      return await lastValueFrom(this.http.post<ProcesaUsuarioRes>(url, request));
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }
}
