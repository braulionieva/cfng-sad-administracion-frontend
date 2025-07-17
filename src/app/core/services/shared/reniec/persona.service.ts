import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  PersonaRequest,
  PersonaResponse,
} from '@interfaces/shared/reniec/persona';
import {BACKEND} from "@environments/environment";

@Injectable({
  providedIn: 'root',
})
export class PersonaService {

  private readonly apiUrl =`${BACKEND.PATH_SAD_DEV}/personanatural/consulta/general`;

  private readonly http: HttpClient = inject(HttpClient);

  public consultarPersona(personaRequest: PersonaRequest): Observable<PersonaResponse> {
    const headers = new HttpHeaders({'Content-Type': 'application/json', });
    return this.http
      .post<PersonaResponse>(this.apiUrl, personaRequest, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o error de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta no exitoso
      errorMessage = `Código de Estado: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
