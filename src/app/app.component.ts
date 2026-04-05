import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100">

      <!-- Sidebar -->
      <div class="w-56 bg-indigo-900 text-white flex flex-col">

        <!-- Logo -->
        <div class="p-5 border-b border-indigo-700">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🛡️</span>
            <div>
              <div class="font-bold text-lg">LogML</div>
              <div class="text-xs text-indigo-300">Anomaly Detector</div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1">

        <a routerLink="/"
   routerLinkActive="bg-indigo-700 text-white"
   [routerLinkActiveOptions]="{exact: true}"
   class="flex items-center gap-3 px-3 py-2 rounded-lg
          text-indigo-200 hover:bg-indigo-800 transition-colors">
  <span>🏠</span>
  <span>Home</span>
</a>
          <a routerLink="/live"
             routerLinkActive="bg-indigo-700 text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg
                    text-indigo-200 hover:bg-indigo-800 transition-colors">
            <span>📡</span>
            <span>Live Feed</span>
          </a>

          <a routerLink="/dashboard"
             routerLinkActive="bg-indigo-700 text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg
                    text-indigo-200 hover:bg-indigo-800 transition-colors">
            <span>📊</span>
            <span>Dashboard</span>
          </a>

          <a routerLink="/history"
             routerLinkActive="bg-indigo-700 text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg
                    text-indigo-200 hover:bg-indigo-800 transition-colors">
            <span>🗂️</span>
            <span>Istoric</span>
          </a>

        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-indigo-700">
          <div class="text-xs text-indigo-400">Spring Boot + GraphQL</div>
        </div>

      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-auto">
        <router-outlet></router-outlet>
      </div>

    </div>
  `
})
export class AppComponent {}