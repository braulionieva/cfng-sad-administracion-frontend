import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Constants } from '@constants/constantes';

@Injectable({ providedIn: 'root' })
export class TokenService {
  constructor(private storageService: StorageService) {}

  public get() {
    const _tokenName = this.storageService.getItem('token');
    return _tokenName;
  }

  public getWithoutBearer() {
    const _tokenName = this.storageService.getItem('token');
    return _tokenName.split(' ')[1];
  }

  public save(token: string) {
    this.storageService.createItem('token', token);
  }

  public clear() {
    this.storageService.clearItem('token');
  }

  public getDecoded() {
    const helper = new JwtHelperService();

    let token = JSON.parse(sessionStorage.getItem(Constants.TOKEN_NAME));

    return helper.decodeToken(token.token);
  }

  public exist() {
    return this.storageService.existItem('token');
  }
}
