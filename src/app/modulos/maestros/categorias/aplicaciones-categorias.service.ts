import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AplicacionesCategoriasService {
  public showConfirmModal = new EventEmitter();
  public isCompleteCategorias = new EventEmitter();

  private readonly actionSubject = new Subject<string>();
  private readonly successModalSubject = new Subject<string>();

  public action$ = this.actionSubject.asObservable();
  public successModal$ = this.successModalSubject.asObservable();

  public actualizarCategorias = new EventEmitter();

  constructor(_httpService: HttpClient) {
    // This is intentional
  }

  notifyAction(action: string) {
    this.actionSubject.next(action);
  }

  notifyCompleteActionCategoria($event) {
    this.isCompleteCategorias.emit($event);
  }

  notifyShowConfirmModal(action, nombreCategoria, categoria?) {
    this.showConfirmModal.emit({
      setAction: action,
      setNombreCategoria: nombreCategoria,
      setCategoria: categoria,
    });
  }

  notificarActualizacionCategorias(data, codigo) {
    this.actualizarCategorias.emit({ data, codigo });
  }

  notifySuccessModal(action: any) {
    this.successModalSubject.next(action);
  }
}
