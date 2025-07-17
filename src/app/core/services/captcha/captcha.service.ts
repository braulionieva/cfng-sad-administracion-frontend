import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {BACKEND} from "@environments/environment";

@Injectable()
export class CaptchaService {

  private readonly baseUrl :string = `${BACKEND.PATH_SAD_DEV}v1/e/captcha`;
  private readonly http: HttpClient = inject(HttpClient);

  public getCaptchaImage(): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get(`${this.baseUrl}/generar`, { headers: headers, responseType: 'json' });
  }

}
