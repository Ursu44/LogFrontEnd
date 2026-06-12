// src/app/pages/login/login.component.ts

import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthService,
  LoginResponse
} from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="min-h-screen flex items-center
                justify-center bg-gray-50">
      <div class="bg-white rounded-xl shadow-lg
                  p-8 w-full max-w-sm">

        <!-- Header -->
        <div class="flex items-center gap-3 mb-8">
          <span class="text-3xl">🛡️</span>
          <div>
            <h1 class="text-xl font-bold
                        text-gray-800">
              Log Analyzer
            </h1>
            <p class="text-xs text-gray-500">
              Sistem detecție anomalii
            </p>
          </div>
        </div>

        <!-- Step 1: credențiale -->
        <div *ngIf="step === 'login'">
          <div class="mb-4">
            <label class="text-xs font-medium
                          text-gray-600 mb-1 block">
              Username
            </label>
            <input [(ngModel)]="username"
                   (keyup.enter)="doLogin()"
                   placeholder="username"
                   class="w-full border border-gray-300
                          rounded-lg px-3 py-2 text-sm
                          focus:outline-none
                          focus:border-indigo-500"/>
          </div>
          <div class="mb-6">
            <label class="text-xs font-medium
                          text-gray-600 mb-1 block">
              Parolă
            </label>
            <input [(ngModel)]="password"
                   (keyup.enter)="doLogin()"
                   type="password"
                   placeholder="••••••••"
                   class="w-full border border-gray-300
                          rounded-lg px-3 py-2 text-sm
                          focus:outline-none
                          focus:border-indigo-500"/>
          </div>
          <button (click)="doLogin()"
                  [disabled]="loading"
                  class="w-full bg-indigo-600
                         text-white rounded-lg
                         py-2.5 text-sm font-medium
                         hover:bg-indigo-700
                         disabled:opacity-50
                         transition-colors">
            {{ loading
               ? 'Se verifică...'
               : 'Autentificare' }}
          </button>
        </div>

        <!-- Step 2: QR code setup -->
        <div *ngIf="step === 'setup'">
          <div class="text-center mb-4">
            <span class="text-2xl">📱</span>
            <h2 class="font-semibold
                        text-gray-800 mt-2">
              Configurare 2FA
            </h2>
            <p class="text-xs text-gray-500 mt-1">
              Scanează cu Google Authenticator
            </p>
          </div>
          <div class="flex justify-center mb-4">
            <img [src]="qrCodeUrl"
                 alt="QR Code 2FA"
                 class="w-48 h-48 border-2
                        border-gray-200
                        rounded-lg p-2"/>
          </div>
          <p class="text-xs text-center
                    text-gray-500 mb-4">
            Introdu codul de 6 cifre din aplicație
          </p>
          <input [(ngModel)]="totpCode"
                 (keyup.enter)="doVerifyTotp()"
                 placeholder="000000"
                 maxlength="6"
                 class="w-full border border-gray-300
                        rounded-lg px-3 py-2 mb-4
                        text-center font-mono
                        text-xl tracking-widest
                        focus:outline-none
                        focus:border-green-500"/>
          <button (click)="doVerifyTotp()"
                  [disabled]="loading ||
                              totpCode.length !== 6"
                  class="w-full bg-green-600
                         text-white rounded-lg
                         py-2.5 text-sm font-medium
                         hover:bg-green-700
                         disabled:opacity-50
                         transition-colors">
            {{ loading
               ? 'Se verifică...'
               : 'Activează 2FA' }}
          </button>
        </div>

        <!-- Step 3: cod TOTP -->
        <div *ngIf="step === 'totp'">
          <div class="text-center mb-6">
            <span class="text-4xl">🔐</span>
            <h2 class="font-semibold
                        text-gray-800 mt-2">
              Verificare 2FA
            </h2>
            <p class="text-xs text-gray-500 mt-1">
              Introdu codul din
              Google Authenticator
            </p>
          </div>
          <input [(ngModel)]="totpCode"
                 (keyup.enter)="doVerifyTotp()"
                 placeholder="000000"
                 maxlength="6"
                 class="w-full border border-gray-300
                        rounded-lg px-3 py-3 mb-6
                        text-center font-mono
                        text-3xl tracking-widest
                        focus:outline-none
                        focus:border-indigo-500"/>
          <button (click)="doVerifyTotp()"
                  [disabled]="loading ||
                              totpCode.length !== 6"
                  class="w-full bg-indigo-600
                         text-white rounded-lg
                         py-2.5 text-sm font-medium
                         hover:bg-indigo-700
                         disabled:opacity-50
                         transition-colors">
            {{ loading
               ? 'Se verifică...'
               : 'Verifică' }}
          </button>
          <button (click)="goBack()"
                  class="w-full mt-2 text-xs
                         text-gray-400
                         hover:text-gray-600 py-1">
            ← Înapoi la login
          </button>
        </div>

        <!-- Eroare -->
        <div *ngIf="error"
             class="mt-4 p-3 bg-red-50 border
                    border-red-200 rounded-lg">
          <p class="text-red-600 text-xs
                    text-center">
            {{ error }}
          </p>
        </div>

        <!-- Debug — stergi dupa testare -->
        <p class="text-xs text-gray-300
                  text-center mt-4">
          step: {{ step }}
        </p>

      </div>
    </div>
  `
})
export class LoginComponent {

  step      = 'login';
  username  = '';
  password  = '';
  totpCode  = '';
  tempToken = '';
  qrCodeUrl = '';
  error     = '';
  loading   = false;

  constructor(
    private authService: AuthService,
    private router:      Router,
    private cdr:         ChangeDetectorRef
  ) {}

  doLogin(): void {
    if (!this.username || !this.password) return;

    this.loading = true;
    this.error   = '';
    this.cdr.detectChanges();

    this.authService
      .login(this.username, this.password)
      .subscribe({
        next: (res: LoginResponse) => {
          console.log('✅ Login response:', res);
          console.log('requiresSetup:', res.requiresSetup);
          console.log('requiresTotp:', res.requiresTotp);

          this.loading   = false;
          this.tempToken = res.tempToken;

          if (res.requiresSetup) {
            this.qrCodeUrl = res.qrCodeUrl;
            this.step      = 'setup';
            console.log('→ step setat pe setup');
          } else if (res.requiresTotp) {
            this.step = 'totp';
            console.log('→ step setat pe totp');
          }

          this.cdr.detectChanges();
          console.log('→ step curent:', this.step);
        },
        error: (err) => {
          console.error('❌ Login error:', err);
          this.loading = false;
          this.error   = 'Credențiale incorecte';
          this.cdr.detectChanges();
        }
      });
  }

  doVerifyTotp(): void {
    if (this.totpCode.length !== 6) return;

    this.loading = true;
    this.error   = '';
    this.cdr.detectChanges();

    this.authService
      .verifyTotp(this.tempToken, this.totpCode)
      .subscribe({
        next: () => {
          console.log('✅ TOTP verificat');
          this.loading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('❌ TOTP error:', err);
          this.loading  = false;
          this.error    = 'Cod TOTP invalid';
          this.totpCode = '';
          this.cdr.detectChanges();
        }
      });
  }

  goBack(): void {
    this.step     = 'login';
    this.totpCode = '';
    this.error    = '';
    this.cdr.detectChanges();
  }
}