import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Aplicacion,
  Categoria,
  DataTreeNodeRequestDTO,
  IListPerfilesRequest,
  IPaginacionListPerfiles,
  Perfil,
  TreeNode,
} from '@interfaces/admin-perfiles/admin-perfiles';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminPerfilesService {
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/adminPerfil`;

  private readonly http: HttpClient = inject(HttpClient);

  public obtenerCategorias(): Observable<Categoria[]> {
    const url = `${this.baseUrl}/categorias`;
    return this.http.get<Categoria[]>(url);
  }

  public obtenerAplicacionesByCategoria(
    idCategoria: number
  ): Observable<Aplicacion[]> {
    const url = `${this.baseUrl}/aplicaciones/${idCategoria}`;
    return this.http.get<Aplicacion[]>(url);
  }

  // public obtenerPerfilesByAplicacion(
  //   idAplicacion: BigInt
  // ): Observable<Perfil[]> {
  //   const url = `${this.baseUrl}/perfiles/${idAplicacion}`;
  //   return this.http.get<Perfil[]>(url);
  // }

  public obtenerPerfilesByAplicacion(
    request: IListPerfilesRequest
  ): Observable<IPaginacionListPerfiles> {
    const url = `${this.baseUrl}/perfiles`;
    return this.http.post<IPaginacionListPerfiles>(url, request);
  }

  public eliminarPerfil(idPerfil: BigInt): Observable<any> {
    const url = `${this.baseUrl}/eliminar/${idPerfil}`;
    return this.http.delete(url);
  }

  public crearPerfil(perfil: Perfil): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, perfil);
  }

  public editarPerfil(perfil: Perfil): Observable<any> {
    const url = `${this.baseUrl}/editar`;
    return this.http.put(url, perfil);
  }

  public obtenerPerfil(idPerfil: BigInt): Observable<Perfil> {
    const url = `${this.baseUrl}/perfil/${idPerfil}`;
    return this.http.get<Perfil>(url);
  }

  public obtenerArbolOpcionesMenu(
    data: DataTreeNodeRequestDTO
  ): Observable<TreeNode[]> {
    const url = `${this.baseUrl}/getArbolOpcionesMenu`;
    return this.http.post<TreeNode[]>(url, data);
  }

  public registrarOpcionesMenu(
    dataLs: DataTreeNodeRequestDTO[]
  ): Observable<any> {
    const url = `${this.baseUrl}/registrarOpcionesMenu`;
    return this.http.post(url, dataLs);
  }
}
