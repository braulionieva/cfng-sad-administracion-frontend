import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private http: HttpClient,) { }

    uploadFile(file: Blob): Observable<any> {
      const form = new FormData();
      form.append('file', file);
      return this.http.post(`https://example.com/api/files`, form, {
        headers: {
          'Content-type': 'multipart/form-data'
        }
      });
    }
  }

