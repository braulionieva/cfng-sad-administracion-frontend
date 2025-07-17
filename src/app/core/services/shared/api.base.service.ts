import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Origin, Authorization, X-Requested-With, X-Custom-Header, Content-Type, Accept'
  }),
};

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  private readonly http: HttpClient = inject(HttpClient);

  post(url: string, body: object): Observable<any> {
    return this.http.post(url, body, httpOptions);
  }

  get(url: string): Observable<any> {
    return this.http.get(url, httpOptions);
  }

  getWithInterface<Response>(url: string): Observable<Response> {
    return this.http.get<Response>(url, httpOptions);
  }

  put(url: string, body: object): Observable<any> {
    return this.http.put(url, body, httpOptions);
  }

  delete(url: string): Observable<any> {
    return this.http.delete(url, httpOptions);
  }

  deleteRetornaTexto(url: string): Observable<any> {
    return this.http.delete(url, { responseType: 'text' });
  }

}
