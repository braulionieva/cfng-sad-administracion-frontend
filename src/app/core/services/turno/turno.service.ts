import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BACKEND} from "@environments/environment";
import {ListaTurnoTabla, RequestFiltrarTurno, TurnoResponse} from '@interfaces/administrar-turno/administrar-turno';
import {ApiBaseService} from '@services/shared/api.base.service';

@Injectable({
  providedIn: 'root',
})

export class TurnoService {

  constructor(private readonly apiBase: ApiBaseService) { }

  obtenerListaTurnos(request: RequestFiltrarTurno): Observable<TurnoResponse> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/e/turno/listarturno`, request);
  }

  obtenerTurnosDependencia(codigoDependencia: any): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/e/turno/turnosDependencia/${codigoDependencia}`);

  }

  listarDependenciasPorDistrito(idDistritoFiscal: any): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/e/turno/entidad/distritofiscal/${idDistritoFiscal}`);
  }

  eliminarTurno(idTurno: string, usuario: string): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/e/turno/eliminar/${idTurno}/usuario/${usuario}`);
  }

  agregarTurno(request: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/e/turno/agregar`, request);
  }

  editarTurno(request: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/e/turno/editar`, request);
  }

  agregarListaTurno(request: ListaTurnoTabla): Observable<TurnoResponse> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/e/turno/agregarLista`, request);
  }

  obtenerListaDespachos(): Observable<any> {
    return this.apiBase.get(`${BACKEND.PATH_SAD_DEV}v1/e/turno/despachos`);
  }

  cargaMasivaTurno(enviarData: any): Observable<any> {
    return this.apiBase.post(`${BACKEND.PATH_SAD_DEV}v1/e/turno/cargaMasiva`, enviarData);
  }
}
