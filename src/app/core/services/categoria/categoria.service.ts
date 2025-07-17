import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {
  CategoriasRequest, CategoriasResponse, Categorias, CategoriasCreate, IAgregarLogoCategoriaRequest, IAgregarLogoCategoria,
  IEliminarLogoCategoriaRequest, IEliminarLogoCategoria
} from '@interfaces/categorias/categorias';
import { BACKEND } from '@environments/environment';

@Injectable({ providedIn: 'root', })
export class CategoriaService {
  private readonly baseUrl: string;
  private readonly refreshTableSubject = new Subject<void>();

  constructor(private readonly http: HttpClient) {
    this.baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/categoriaAplicacion`;
  }

  callRefreshTable() {
    this.refreshTableSubject.next();
  }

  getRefreshTableListener(): Observable<void> {
    return this.refreshTableSubject.asObservable();
  }

  public obtenerCategorias(request: CategoriasRequest) {
    const url = `${this.baseUrl}/categorias`;
    return this.http.post<CategoriasResponse>(url, request);
  }

  public crearCategoria(request: CategoriasCreate) {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, request);
  }

  public buscarCategoriaPorId(request) {
    const url = `${this.baseUrl}/categoriasPorId`;
    return this.http.post<Categorias>(url, request);
  }

  public actualizarCategoriaPorId(request) {
    const url = `${this.baseUrl}/editar`;
    return this.http.post(url, request);
  }

  public eliminarCategoriaPorId(request) {
    const url = `${this.baseUrl}/eliminar`;
    return this.http.post(url, request);
  }

  public agregarLogoCategoria(request: IAgregarLogoCategoriaRequest): Observable<IAgregarLogoCategoria> {
    const url = `${this.baseUrl}/agregarLogo`;
    return this.http.post<IAgregarLogoCategoria>(url, request);
  }

  public eliminarLogoCategoria(request: IEliminarLogoCategoriaRequest): Observable<IEliminarLogoCategoria> {
    const url = `${this.baseUrl}/eliminarLogo`;
    return this.http.post<IEliminarLogoCategoria>(url, request);
  }

  public obtenerListaCategoriasPadre() {
    const url = `${this.baseUrl}/categoriasPadre`;
    return this.http.get<any>(url);
  }
}
