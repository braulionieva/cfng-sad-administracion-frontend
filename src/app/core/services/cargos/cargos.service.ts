import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BACKEND } from "@environments/environment";
import { IListCargosRequest, IPaginacionListCargos, ICrearCargoRequest, ICrearCargo, IEditarCargoRequest, IEditarCargo, IEliminarCargoRequest, ICargoMessage, IListCargosRequestExcel } from "@interfaces/cargos/cargos";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CargosService {
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/cargo`;
  private readonly baseUrlJerarquias = `${BACKEND.CFEMAESTROS}v1/cftm/e/jerarquias`;

  constructor(private readonly http: HttpClient) { }

  public obtenerListaCargos(request: IListCargosRequest): Observable<IPaginacionListCargos> {
    const url = `${this.baseUrl}/listaCargos`;

    return this.http.post<IPaginacionListCargos>(url, request);
  }

  public obtenerJerarquias() {
    return this.http.get(this.baseUrlJerarquias);
  }

  public obtenerCargosJerarquias() {
    const url = `${this.baseUrl}/listaCategoriaCargos`;

    return this.http.get(url);
  }

  public crearCargo(request: ICrearCargoRequest): Observable<ICrearCargo> {
    const url = `${this.baseUrl}/guardaCargo`;

    return this.http.post<ICrearCargo>(url, request);
  }

  public editarCargo(request: IEditarCargoRequest): Observable<IEditarCargo> {
    const url = `${this.baseUrl}/editarCargo`;

    return this.http.post<IEditarCargo>(url, request);
  }

  public eliminarCargo(request: IEliminarCargoRequest): Observable<ICargoMessage> {
    const url = `${this.baseUrl}/eliminaCargo`;

    return this.http.post<ICargoMessage>(url, request);
  }

  public obtenerListaCargosExcel(request: IListCargosRequestExcel): Observable<Blob> {
    const url = `${this.baseUrl}/listaCargosExcel`;

    return this.http.post(url, request, { responseType: 'blob' });
  }
}
