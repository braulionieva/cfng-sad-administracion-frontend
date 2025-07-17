import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComunDialogService {
  private showDialogSource = new Subject<any>();
  showDialog$ = this.showDialogSource.asObservable();

  private hideDialogSource = new Subject<any>();
  hideDialog$ = this.hideDialogSource.asObservable();

  showDialog(params: any) {
    this.showDialogSource.next(params);
  }

  hideDialog(params: any) {
    this.hideDialogSource.next(params);
  }
}
