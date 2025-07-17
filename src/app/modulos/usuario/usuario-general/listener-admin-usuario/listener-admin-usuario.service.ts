import { Injectable } from '@angular/core';
import { UsuarioMenuOpcionId } from '@interfaces/agregar-dependencia-us/agregar-dependencia-us';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListenerAdminUsuarioService {
  //variabla para informar la opcion y el usuario selecionado a los escuchas suscritos
  private _usuarioMenuOpcionId: BehaviorSubject<UsuarioMenuOpcionId>;
  private _infoUsuario: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {
    this._usuarioMenuOpcionId = new BehaviorSubject<UsuarioMenuOpcionId>(null);
  }

  //metodo que permite saber qué opcion se ha elegido y el usuarioRow
  getUsuarioMenuOpcionId(): Observable<UsuarioMenuOpcionId> {
    return this._usuarioMenuOpcionId.asObservable();
  }

  //metodo que permite registrar la opcion elegida y el usuarioRow
  setUsuarioMenuOpcionId(usuarioMenuOpcionId: UsuarioMenuOpcionId) {
    this._usuarioMenuOpcionId.next(usuarioMenuOpcionId);
  }

  // Métodos para manejar infoUsuario
  setInfoUsuario(info: any) {
    this._infoUsuario.next(info);
  }

  getInfoUsuario(): Observable<any> {
    return this._infoUsuario.asObservable();
  }

  // Nuevo método para restablecer el BehaviorSubject
  resetUsuarioMenuOpcionId() {
    this._usuarioMenuOpcionId.next(null);
  }
}
