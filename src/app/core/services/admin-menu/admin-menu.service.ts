import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ActualizarOrden,
  MenuInterface, SiDuplicadoNodoCoVAplicacionRes,
} from '@interfaces/admin-menu/admin-menu';
import {lastValueFrom, Observable} from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminMenusService {
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/administrarmenu`;

  private readonly http: HttpClient = inject(HttpClient);

  public crearNodoMenu(nodo: MenuInterface): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, nodo);
  }

  public obtenerListaMenus(idMenuPadre: BigInt): Observable<any> {
    const url = `${this.baseUrl}/listar/${idMenuPadre}`;
    return this.http.get(url);
  }

  public actualizarNodoMenu(nodo: MenuInterface): Observable<any> {
    const url = `${this.baseUrl}/actualizar`;
    return this.http.put(url, nodo);
  }

  public eliminarNodoMenu(nodo: MenuInterface): Observable<any> {
    const url = `${this.baseUrl}/eliminar`;
    return this.http.delete(url, { body: nodo });
  }

  public actualizarOrden(nodo: ActualizarOrden): Observable<any> {
    const url = `${this.baseUrl}/actualizar-orden`;
    return this.http.post(url, nodo);
  }

  /**
   * Verifica si existe duplicidad del código de aplicación
   * @param coVNodo Código del nodp a validar. internamente es coVAplicacion
   * @param idNAplicacionActual //id de aplicacion donde se creará el nodo. internamente es idNAplicacion
   * @param idNNodoActual ID del nodo (opcional, para casos de edición. internamente es idNAplicacion)
   * @returns Promise con la respuesta de duplicidad
   */
  public async siDuplicadoNodoCoVAplicacion(
    coVNodo: string,
    idNAplicacionActual: number,
    idNNodoActual: number
  ): Promise<SiDuplicadoNodoCoVAplicacionRes> {
    let url = `${this.baseUrl}/siDuplicadoNodoCoVAplicacion?coVNodo=${coVNodo}&idNAplicacionActual=${idNAplicacionActual}`;

    // Agregar idNNodoActual al query string solo si está presente
    if (idNNodoActual) {
      url += `&idNNodoActual=${idNNodoActual}`;
    }

    const response = this.http.get<SiDuplicadoNodoCoVAplicacionRes>(url);
    return await lastValueFrom(response);
  }
}
