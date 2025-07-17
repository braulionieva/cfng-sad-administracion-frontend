import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CargoDTOB, DependenciaDTOB, DependenciaUsuarioLstDTORes, DependenciaUsuarioDTO, AgregarDependenciaUsuarioRes,
  DespachoDTOB, SedeDTOB, UsuarioDTOB, EliminarDependenciaUsReq, EliminarDependenciaUsRes, UsuarioRow
} from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { Observable } from 'rxjs';
import { BACKEND } from "@environments/environment";
import { DistritoFiscalDTOB } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';

@Injectable({ providedIn: 'root' })
export class AgregarDependenciaUsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = `${BACKEND.PATH_SAD_DEV}v1/e/dependenciasAsignadas`;

  //dependencias del usuario
  public getUsuarioLst(): Observable<UsuarioRow[]> {
    const url = `${this.baseUrl}/getUsuarioLst`;
    return this.http.get<UsuarioRow[]>(url);
  }

  //dependencias del usuario
  public getDependenciaUsuarioLst(idVUsuario: string): Observable<DependenciaUsuarioLstDTORes[]> {
    const url = `${this.baseUrl}/getDependenciaUsuarioLst/${idVUsuario}`;
    return this.http.get<DependenciaUsuarioLstDTORes[]>(url);
  }

  //sede
  public getSedeLst(): Observable<SedeDTOB[]> {
    const url = `${this.baseUrl}/getSedeLst`;
    return this.http.get<SedeDTOB[]>(url);
  }

  //despacho
  public getDespachoLst(coVEntidad: string): Observable<DespachoDTOB[]> {
    const url = `${this.baseUrl}/getDespachoLst?coVEntidad=${coVEntidad}`;
    return this.http.get<DespachoDTOB[]>(url);
  }

  //df
  public getDistritoFiscalLst(): Observable<DistritoFiscalDTOB[]> {
    const url = `${this.baseUrl}/getDistritoFiscalLst`;
    return this.http.get<DistritoFiscalDTOB[]>(url);
  }

  //dependencias
  public getDependenciaLst(): Observable<DependenciaDTOB[]> {
    const url = `${this.baseUrl}/getDependenciaLst`;
    return this.http.get<DependenciaDTOB[]>(url);
  }

  //cargo
  public getCargoLst(): Observable<CargoDTOB[]> {
    const url = `${this.baseUrl}/getCargoLst`;
    return this.http.get<CargoDTOB[]>(url);
  }

  //usuario sesion
  public getUsuario(idVUsuario: string): Observable<UsuarioDTOB> {
    const url = `${this.baseUrl}/getUsuario/${idVUsuario}`;
    return this.http.get<UsuarioDTOB>(url);
  }

  //agregar dependencia a usuario:
  //agregarDependenciaUsuario
  public agregarDependenciaUsuario(request: DependenciaUsuarioDTO): Observable<AgregarDependenciaUsuarioRes> {
    const url = `${this.baseUrl}/agregarDependenciaUsuario`;
    return this.http.post<AgregarDependenciaUsuarioRes>(url, request);
  }

  public getDependenciaUsuario(idVDependenciaUsuario: string): Observable<DependenciaUsuarioDTO> {
    const url = `${this.baseUrl}/getDependenciaUsuario/${idVDependenciaUsuario}`;
    return this.http.get<DependenciaUsuarioDTO>(url);
  }

  public actualizarDependenciaUsuario(request: DependenciaUsuarioDTO): Observable<DependenciaUsuarioDTO> {
    const url = `${this.baseUrl}/actualizarDependenciaUsuario`;
    return this.http.post<DependenciaUsuarioDTO>(url, request);
  }

  public eliminarDepUs(request: EliminarDependenciaUsReq): Observable<EliminarDependenciaUsRes> {
    const url = `${this.baseUrl}/eliminarDepUs`;
    return this.http.post<EliminarDependenciaUsRes>(url, request);
  }
}
