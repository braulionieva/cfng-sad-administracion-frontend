import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginacionListaDistrito, ListaDepartamento, ListaProvincia } from '@interfaces/cobertura-central/cobertura-central';
import { Observable } from 'rxjs';
import { BACKEND } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class CoberturaCentralesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/coberturaCentrales`;
  private readonly baseCentralUrl = `${BACKEND.CFEMAESTROS}v1/notm/e`;

  public getListaDepartamentos(): Observable<ListaDepartamento[]> {
    const url = `${this.baseUrl}/departamentos`;

    return this.http.post<ListaDepartamento[]>(url, {});
  }

  public getListaProvincias(codigoDeptoReniec): Observable<ListaProvincia[]> {
    const url = `${this.baseUrl}/provincias`;

    return this.http.post<ListaProvincia[]>(url, { codigoDeptoReniec });
  }

  public getListaDistritosFiscales(): Observable<any> {
    const url = `${this.baseUrl}/distritosFiscales`;

    return this.http.post<any>(url, {});
  }

  public getListaSedes(idDistritoFiscal): Observable<any> {
    const url = `${this.baseUrl}/sedes`;

    return this.http.post<any>(url, { idDistritoFiscal });
  }

  public getDistritos(request): Observable<IPaginacionListaDistrito> {
    const url = `${this.baseUrl}/distritos`;

    return this.http.post<IPaginacionListaDistrito>(url, request);
  }

  public getFiscalias(requestData): Observable<any> {
    const url = `${this.baseUrl}/fiscalias`;
 
    return this.http.post<any>(url, requestData);
  }

  public asignarCentralCoberturas(requestData): Observable<any> {
    const url = `${this.baseUrl}/asignarCentral`;

    return this.http.post<any>(url, requestData);
  }

  public asignarCentralFiscalias(requestData): Observable<any> {
    const url = `${this.baseUrl}/asignarCentralFiscalias`;

    return this.http.post<any>(url, requestData);
  }

  public getListaCentrales(): Observable<any> {
    const url = `${this.baseCentralUrl}/central`;
    
    return this.http.get<any>(url);
  }
}
