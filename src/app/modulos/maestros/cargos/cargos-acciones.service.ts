import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CargosAccionesService {
  public showConfirmModal = new EventEmitter();
  public isCompleteActionCharger = new EventEmitter();

  private readonly actionSubject = new Subject<string>();
  private readonly successModalSubject = new Subject<string>();

  public action$ = this.actionSubject.asObservable();
  public successModal$ = this.successModalSubject.asObservable();

  public actualizarPlazo = new EventEmitter();

  notifyAction(action: string) {
    this.actionSubject.next(action);
  }

  notifyCompleteActionCharger($event) {
    this.isCompleteActionCharger.emit($event);
  }

  notificarActualizacionCharger(data, codigo) {
    this.actualizarPlazo.emit({ data, codigo });
  }

  notifyShowConfirmModal(action, nombre, cargo?) {
    this.showConfirmModal.emit({
      setAction: action,
      setNombre: nombre,
      setCargo: cargo,
    });
  }

  notifySuccessModal(action: string) {
    this.successModalSubject.next(action);
  }
}
