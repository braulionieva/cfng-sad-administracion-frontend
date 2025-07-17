import { Observable } from 'rxjs';

export const mock = ( data: any, timeout: number = 1000 ): Observable<any> => {
    return new Observable<any>(( observer ) => {
        setTimeout(() => {
            observer.next(data)
            observer.complete()
        }, timeout);
    })
}