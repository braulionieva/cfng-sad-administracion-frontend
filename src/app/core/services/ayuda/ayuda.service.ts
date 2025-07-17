import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {BACKEND} from '@environments/environment';
import {lastValueFrom} from 'rxjs';
import {
  AyudaDetalleObj,
  BusquedaObj,
  CategoriaListadoRowRes,
  CategoriasPadreObj,
  TagsObj
} from "@interfaces/ayuda/ayuda";

@Injectable({
  providedIn: 'root'
})
export class AyudaService {
  private readonly baseUrl: string = `${BACKEND.PATH_SAD_DEV}v1/e/ayuda`;
  private readonly baseUrlDocumento: string = `${BACKEND.MS_GENERALES_DOCUMENTO}v2/cftm/ayuda`;
  private readonly http: HttpClient = inject(HttpClient);

  async obtenerTags(idCategoria: string): Promise<TagsObj[]> {
    const url = idCategoria ? `${this.baseUrl}/tags/${idCategoria}` : `${this.baseUrl}/tags`;
    const observable = this.http.get<TagsObj[]>(url);
    return await lastValueFrom(observable);
  }

  async obtenerCategorias(request: BusquedaObj): Promise<CategoriaListadoRowRes> {
    const url = `${this.baseUrl}/categorias`;
    const response = this.http.post<CategoriaListadoRowRes>(url, request);
    return await lastValueFrom(response);
  }

  async obtenerCategoriasPadre(): Promise<CategoriasPadreObj[]> {
    const url = `${this.baseUrl}/categoriaspadre`;
    const response = this.http.get<CategoriasPadreObj[]>(url);
    return await lastValueFrom(response);
  }

  async obtenerCategoriaDetalle(idCategoria: string): Promise<AyudaDetalleObj> {
    const url = `${this.baseUrl}/${idCategoria}`;
    const observable = this.http.get<AyudaDetalleObj>(url);
    return await lastValueFrom(observable);
  }

  async guardarTag(request: TagsObj): Promise<TagsObj> {
    const url = `${this.baseUrl}/tag`;
    const response = this.http.post<TagsObj>(url, request);
    return await lastValueFrom(response);
  }

  async eliminarTag(request: TagsObj): Promise<string> {
    const url = `${this.baseUrl}/tag/eliminar/${request.idTag}`;
    const response = this.http.post<string>(url, request);
    return await lastValueFrom(response);
  }

  async eliminarCategoria(idCategoria: string): Promise<string> {
    const url = `${this.baseUrl}/categoria/eliminar/${idCategoria}`;
    const response = this.http.post<string>(url, idCategoria);
    return await lastValueFrom(response);
  }

  async guardarCategoria(request: AyudaDetalleObj): Promise<AyudaDetalleObj> {
    const url = `${this.baseUrl}/categoria`;
    const response = this.http.post<AyudaDetalleObj>(url, request);
    return await lastValueFrom(response);
  }

  async cargarArchivo(file: File): Promise<any> {
    const url = `${this.baseUrlDocumento}/cargar`;
    const formData = new FormData();
    formData.append("archivo", file, file.name);
    const response = this.http.post<any>(url, formData);
    return await lastValueFrom(response);
  }

}
