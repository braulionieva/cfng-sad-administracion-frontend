import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private refreshSedesSource = new Subject<void>();
  refreshSedes$ = this.refreshSedesSource.asObservable();

  constructor() {
    // This is intentional
  }

  emitRefreshSedesEvent() {
    this.refreshSedesSource.next();
  }
}
