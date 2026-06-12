// src/app/core/interceptors/jwt.interceptor.ts

import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take
} from 'rxjs';

let isRefreshing = false;
let refreshSubject =
  new BehaviorSubject<boolean>(false);

export const jwtInterceptor: HttpInterceptorFn =
    (req, next) => {

  const authService = inject(AuthService);
  const router      = inject(Router);

  // Adaugi withCredentials la toate requesturile
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Ignoră erorile de la auth endpoints
      if (req.url.includes('/api/auth/')) {
        return throwError(() => error);
      }

      if (error.status === 401) {

        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject.next(false);

          return authService
            .refreshToken()
            .pipe(
              switchMap(() => {
                isRefreshing = false;
                refreshSubject.next(true);
                // Reface requestul original
                return next(authReq);
              }),
              catchError(refreshError => {
                isRefreshing = false;
                refreshSubject.next(false);
                authService.logout();
                router.navigate(['/login']);
                return throwError(
                  () => refreshError);
              })
            );

        } else {
          // Refresh în curs — aștepți
          return refreshSubject.pipe(
            filter(done => done === true),
            take(1),
            switchMap(() => next(authReq))
          );
        }
      }

      if (error.status === 403) {
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};