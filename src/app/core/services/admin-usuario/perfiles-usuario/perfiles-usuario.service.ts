import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PerfilCategoria, PerfilSistema } from '@interfaces/perfiles-usuario/perfiles-usuario';
import { Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";

@Injectable({ providedIn: 'root', })
export class PerfilesUsuarioService {
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/agregarPerfiles`;
  private readonly http: HttpClient = inject(HttpClient);

  public getCategorias(): Observable<PerfilCategoria[]> {
    const url = `${this.baseUrl}/categorias`;
    return this.http.post<PerfilCategoria[]>(url, {});
  }

  public getSistemas(idCategoria): Observable<PerfilSistema[]> {
    const url = `${this.baseUrl}/sistemas`;
    return this.http.post<PerfilSistema[]>(url, { idCategoria });
  }

  public getListaPerfiles(request): Observable<any> {
    const url = `${this.baseUrl}/perfiles`;
    return this.http.post<any>(url, request);
  }

  public agregarPerfil(perfilesRequest): Observable<any> {
    const url = `${this.baseUrl}/agregarPerfil`;
    return this.http.post<any>(url, perfilesRequest);
  }

  public getListaOpcionesPerfil(perfilesRequest): Observable<any> {
    const url = `${this.baseUrl}/listaOpcionesPerfil`;
    return this.http.post<any>(url, perfilesRequest);
  }

  public registrarOpcionesMenu(request): Observable<any> {
    const url = `${this.baseUrl}/opcionPerfil`;
    return this.http.post<any>(url, request);
  }
}
