import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/shared/token.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    //anade jwt a header si token existe
    if (this.tokenService.exist()) {

      request = request.clone({
        setHeaders: { Authorization: this.tokenService.get() },
      });
    }
    //si request es invalido(token vencio) cierra sesion
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if(error.url!==null)
          {const urlSplitted = error.url.split('/');
          if (urlSplitted[urlSplitted.length] !== 'login') {
            this.tokenService.clear();
            this.router.navigateByUrl('/auth/login');
          }}
        }
        return throwError(() => error); // Usar función de fábrica para el error
      })
    );
  }
}
