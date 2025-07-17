import { Injectable } from '@angular/core';
import { Constants } from 'src/app/shared/constants/constantes';

@Injectable({ providedIn: 'root' })
export class StorageService {
  public get() {
    const _system = sessionStorage.getItem(Constants.TOKEN_NAME);

    if (_system === null)
      return;

    return JSON.parse(_system);
  }

  public getItem(itemName: string) {
    const _system = sessionStorage.getItem(Constants.TOKEN_NAME);
    if (_system === null) return;
    const _systemParsed = JSON.parse(_system);
    return _systemParsed[itemName];
  }

  public createItem(itemName: string, itemValue: string) {
    const _system = this.get();
    const _systemUpdated = { ..._system, [itemName]: itemValue };
    sessionStorage.setItem(Constants.TOKEN_NAME, JSON.stringify(_systemUpdated));
  }

  public clearItem(itemName: string) {
    const _system = this.get();
    delete _system[itemName];
    sessionStorage.setItem(Constants.TOKEN_NAME, JSON.stringify(_system));
  }

  public exist() {
    return !!sessionStorage.getItem(Constants.TOKEN_NAME);
  }

  public existItem(itemName: string) {
    return this.exist() ? !!this.getItem(itemName) : false;
  }
}
