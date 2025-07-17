import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BACKEND } from "@environments/environment";
import { UsuarioDetalle, ProcesaUsuarioReq, ProcesaUsuarioRes } from "@interfaces/baja-usuario/baja-usuario";
import { Observable, lastValueFrom } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BajaUsuarioService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl_Baja: string = `${BACKEND.PATH_SAD_DEV}v1/e/bajaUsuario`;
  private readonly baseUrl_Block: string = `${BACKEND.PATH_SAD_DEV}v1/e/bloquearUsuario`;

  public getUsuarioDetalle(idVUsuario: string): Observable<UsuarioDetalle> {
    const url = `${this.baseUrl_Baja}/getUsuarioDetalle/${idVUsuario}`;

    return this.http.get<UsuarioDetalle>(url);
  }

  public async procesarUsuario_Baja(tipo: string, request: ProcesaUsuarioReq): Promise<ProcesaUsuarioRes> {
    const url = `${this.baseUrl_Baja}/${tipo}`;

    try {
      return await lastValueFrom(this.http.post<ProcesaUsuarioRes>(url, request));
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }

  public async procesarUsuario_Block(type: string, request: ProcesaUsuarioReq): Promise<ProcesaUsuarioRes> {
    const url = `${this.baseUrl_Block}/${type}`;

    try {
      return await lastValueFrom(this.http.post<ProcesaUsuarioRes>(url, request));
    } catch (error) {
      throw new Error('Error al enviar datos');
    }
  }
}
