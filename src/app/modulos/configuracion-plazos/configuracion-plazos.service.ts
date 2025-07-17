import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionPlazosService {
  public showConfirmModal = new EventEmitter();
  public isCompleteActionPlazo = new EventEmitter();
  public refreshPlazo = new EventEmitter();

  private actionSubject = new Subject<string>();
  private successModalSubject = new Subject<any>();

  public action$ = this.actionSubject.asObservable();
  public successModal$ = this.successModalSubject.asObservable();

  constructor(_httpService: HttpClient) {
    // This is intentional
  }

  notifyAction(action: string) {
    this.actionSubject.next(action);
  }

  notifyCompleteActionPlazo() {
    this.isCompleteActionPlazo.emit();
  }

  notifyShowConfirmModal(action, plazo?) {
    this.showConfirmModal.emit({
      setAction: action,
      setPlazo: plazo,
    });
  }

  notifySuccessModal(action: string, plazo: any, codigoPlazo?: string) {
    this.successModalSubject.next({ action, plazo, codigoPlazo });
  }

  triggerRefreshPlazos() {
    this.refreshPlazo.emit();
  }
}
