import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { v4 as uuid } from 'uuid';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
};

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private endpoint = `cloud/casos/`;

  constructor(private http: HttpClient) { }

  uploadDocument(file: File, caseCode: string = undefined, type: string = 'notificaciones'): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.endpoint}${caseCode}/archivos/${type}/${uuid()}.pdf`, formData, httpOptions)
  }

}
