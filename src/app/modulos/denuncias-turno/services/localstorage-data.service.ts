import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageDataService {
  constructor() {
    // This is intentional
  }

  postFiscaliasToLocalStorage(fiscalias: Array<any>) {
    const fiscaliasLocalStorage = JSON.stringify(fiscalias);
    localStorage.setItem('fiscalia-grupo-aleatorio', fiscaliasLocalStorage);
  }

  getFiscaliasDataLocalStorage() {
    const fiscaliasData = localStorage.getItem('fiscalias-grupo-aleatorio');
    if (!fiscaliasData) return;

    return JSON.parse(fiscaliasData);
  }

  postFiscaliaToLocalStorage(fiscalia: any) {
    const fiscaliasData = this.getFiscaliasDataLocalStorage();
    fiscaliasData.push(fiscalia);

    this.postFiscaliaToLocalStorage(fiscaliasData);
  }
}
