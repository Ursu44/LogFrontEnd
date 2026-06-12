import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router
} from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  template: `
    <nav *ngIf="!isLoginPage()"
         class="bg-white border-b border-gray-200
                shadow-sm sticky top-0 z-50">
      <div class="flex items-center
                  justify-between h-14 px-6">

        <div class="flex items-center">
          <a routerLink="/"
             routerLinkActive="bg-indigo-100
               text-indigo-700 font-semibold"
             [routerLinkActiveOptions]="{exact: true}"
             class="px-6 py-2 text-sm font-medium
                    text-gray-600 hover:bg-indigo-50
                    hover:text-indigo-700
                    transition-all duration-200">
            Home
          </a>
          <div class="w-px h-5 bg-gray-200"></div>
          <a routerLink="/live"
             routerLinkActive="bg-green-100
               text-green-700 font-semibold"
             class="px-6 py-2 text-sm font-medium
                    text-gray-600 hover:bg-green-50
                    hover:text-green-700
                    transition-all duration-200">
            Live Feed
          </a>
          <div class="w-px h-5 bg-gray-200"></div>
          <a routerLink="/dashboard"
             routerLinkActive="bg-indigo-100
               text-indigo-700 font-semibold"
             class="px-6 py-2 text-sm font-medium
                    text-gray-600 hover:bg-indigo-50
                    hover:text-indigo-700
                    transition-all duration-200">
            Dashboard
          </a>
          <div class="w-px h-5 bg-gray-200"></div>
          <a routerLink="/history"
             routerLinkActive="bg-blue-100
               text-blue-700 font-semibold"
             class="px-6 py-2 text-sm font-medium
                    text-gray-600 hover:bg-blue-50
                    hover:text-blue-700
                    transition-all duration-200">
            Istoric
          </a>
          <div class="w-px h-5 bg-gray-200"></div>
          <a routerLink="/entity/admin"
             routerLinkActive="bg-purple-100
               text-purple-700 font-semibold"
             class="px-6 py-2 text-sm font-medium
                    text-gray-600 hover:bg-purple-50
                    hover:text-purple-700
                    transition-all duration-200">
            Timeline
          </a>
          <div class="w-px h-5 bg-gray-200"></div>
          <a routerLink="/incidents"
             routerLinkActive="bg-red-100
               text-red-700 font-semibold"
             class="px-6 py-2 text-sm font-medium
                    text-gray-600 hover:bg-red-50
                    hover:text-red-700
                    transition-all duration-200">
            🔗 Incidente
          </a>
        </div>

        <button (click)="logout()"
                class="flex items-center gap-2
                       px-4 py-2 text-sm font-medium
                       text-gray-600 border
                       border-gray-200 rounded-lg
                       hover:bg-red-50
                       hover:border-red-300
                       hover:text-red-600
                       transition-colors">
          🚪 Logout
        </button>

      </div>
    </nav>

    <router-outlet />
  `
})
export class App {

  constructor(
    private authService: AuthService,
    private router:      Router
  ) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  logout(): void {
    this.authService.logout();
  }
}