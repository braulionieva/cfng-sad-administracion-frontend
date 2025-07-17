import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogDataTransferService {
  private fiscaliaSource = new BehaviorSubject<any>(null);
  currentFiscalia = this.fiscaliaSource.asObservable();

  updateFiscalia(fiscalia: any) {
    this.fiscaliaSource.next(fiscalia);
  }
}
