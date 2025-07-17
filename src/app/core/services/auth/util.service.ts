import { Constants } from '@constants/constantes';

import { jwtDecode } from 'jwt-decode';
import { Injectable } from '@angular/core';
import { JwtPayload } from '@interfaces/sesion/sesion';


@Injectable({
  providedIn: 'root'
})
export class UtilTokenService {

    constructor() {
      // This is intentional
    }

    public getDecodedToken(): JwtPayload | null {
        const token = sessionStorage.getItem(Constants.TOKEN_NAME);
        if (token) {
          try {

            /**const decodedToken = jwtDecode(token) as JwtPayload;**/
            const decodedToken = jwtDecode<JwtPayload>(token); // Usar generics para evitar la aserción
            return decodedToken;
          } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
          }
        }
        return null;
      }


    public getSpecificValueFromToken(key: keyof JwtPayload): string | null | any {
        let decodedToken : JwtPayload = this.getDecodedToken();
        if (decodedToken && key in decodedToken) {
          return decodedToken[key];
        }
        return null;
      }

}


