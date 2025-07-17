import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BACKEND } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/usuario/listarOpcionesByUsuarioApliacion`;

  constructor(private readonly http: HttpClient) {}

  public obtenerModulosMenu(data): Observable<any> {
    const user = data.usuario;
    const codeApplication = data.codigoAplicacion;
    const url = `${this.baseUrl}/${user}/${codeApplication}/`;

    return this.http.get<any>(url);
  }
}
