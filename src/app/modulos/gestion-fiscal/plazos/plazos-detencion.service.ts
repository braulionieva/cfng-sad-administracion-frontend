import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlazosDetencionService {
  public showConfirmModal = new EventEmitter();
  public isCompleteActionPlazo = new EventEmitter();

  private actionSubject = new Subject<string>();
  private successModalSubject = new Subject<string>();

  public action$ = this.actionSubject.asObservable();
  public successModal$ = this.successModalSubject.asObservable();

  public actualizacionPlazos = new EventEmitter();

  constructor(_httpService: HttpClient) {
    // This is intentional
  }

  notifyAction(action: string) {
    this.actionSubject.next(action);
  }

  notifyCompleteActionPlazo($event) {
    this.isCompleteActionPlazo.emit($event);
  }

  notifyShowConfirmModal(action, especialidad, plazo?) {
    this.showConfirmModal.emit({
      setAction: action,
      setEspecialidad: especialidad,
      setPlazo: plazo,
    });
  }

  notificarActalizacionPlazos(data, codigo) {
    this.actualizacionPlazos.emit({ data, codigo });
  }

  notifySuccessModal(action: string) {
    this.successModalSubject.next(action);
  }
}
