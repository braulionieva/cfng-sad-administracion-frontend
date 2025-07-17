import { EventEmitter, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CentralesNotificacionesService {
  public showConfirmModal: EventEmitter<any> = new EventEmitter();
  public isCompleteCentrales: EventEmitter<any> = new EventEmitter();

  private readonly actionSubject: Subject<string> = new Subject<string>();
  private readonly successModalSubject: Subject<string> = new Subject<string>();

  public action$: Observable<string> = this.actionSubject.asObservable();
  public successModal$: Observable<string> =
    this.successModalSubject.asObservable();

  public actualizarCentrales: EventEmitter<any> = new EventEmitter();

  public notifyAction(action: string): void {
    this.actionSubject.next(action);
  }

  public notifyCompleteActionCentral($event): void {
    this.isCompleteCentrales.emit($event);
  }

  public notifyShowConfirmModal(action, central?): void {
    this.showConfirmModal.emit({
      setAction: action,
      setCentral: central,
    });
  }

  public notificarActualizacionCentral(data, codigo) {
    this.actualizarCentrales.emit({ data, codigo });
  }

  public notifySuccessModal(action: string): void {
    this.successModalSubject.next(action);
  }
}
