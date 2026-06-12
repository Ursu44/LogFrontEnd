// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  requiresSetup: boolean;
  requiresTotp:  boolean;
  tempToken:     string;
  qrCodeUrl:     string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl =
    `${environment.apiUrl}/api/auth`;

  private loggedIn$ =
    new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.loggedIn$.asObservable();

  constructor(
    private http:   HttpClient,
    private router: Router
  ) {}

  // ── Login Step 1 ──────────────────────────────
  login(username: string,
        password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { username, password },
      { withCredentials: true }
    );
  }

  // ── Login Step 2: verificare TOTP ─────────────
  verifyTotp(tempToken: string,
             code: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/verify-totp`,
      { tempToken, code },
      { withCredentials: true }
    ).pipe(
      tap(() => this.loggedIn$.next(true))
    );
  }

  // ── Verificare sesiune ────────────────────────
  checkSession(): Observable<boolean> {
    return this.http.get<{ valid: boolean }>(
      `${this.apiUrl}/check`,
      { withCredentials: true }
    ).pipe(
      map(res => {
        this.loggedIn$.next(res.valid);
        return res.valid;
      }),
      catchError(() => {
        this.loggedIn$.next(false);
        return of(false);
      })
    );
  }

  // ── Refresh token ─────────────────────────────
  refreshToken(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    );
  }

  // ── Logout ────────────────────────────────────
  logout(): void {
    this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).subscribe({
      complete: () => {
        this.loggedIn$.next(false);
        this.router.navigate(['/login']);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.loggedIn$.getValue();
  }
}