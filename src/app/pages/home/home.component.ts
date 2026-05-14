import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-5xl mx-auto">

      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-1">
          <span class="text-4xl">🛡️</span>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Log Analyzer</h1>
            <p class="text-sm text-gray-500">
              Sistem de detecție anomalii în loguri în timp real
            </p>
          </div>
        </div>
      </div>

      <!-- Quick nav -->
      <div class="flex gap-2 mb-8 flex-wrap">
        <button (click)="router.navigate(['/live'])"
                class="flex items-center gap-2 px-4 py-2 bg-white border
                       border-gray-200 rounded-lg text-sm font-medium
                       hover:bg-green-50 hover:border-green-300 transition-colors">
          📡 Live Feed
          <span class="flex items-center gap-1 text-xs bg-green-100
                       text-green-700 px-2 py-0.5 rounded-full">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        </button>
        <button (click)="router.navigate(['/dashboard'])"
                class="flex items-center gap-2 px-4 py-2 bg-white border
                       border-gray-200 rounded-lg text-sm font-medium
                       hover:bg-blue-50 hover:border-blue-300 transition-colors">
          📊 Dashboard
        </button>
        <button (click)="router.navigate(['/history'])"
                class="flex items-center gap-2 px-4 py-2 bg-white border
                       border-gray-200 rounded-lg text-sm font-medium
                       hover:bg-purple-50 hover:border-purple-300 transition-colors">
          🗂️ Istoric
        </button>
        <button (click)="router.navigate(['/entity', 'admin'])"
                class="flex items-center gap-2 px-4 py-2 bg-white border
                       border-gray-200 rounded-lg text-sm font-medium
                       hover:bg-teal-50 hover:border-teal-300 transition-colors">
          📈 Timeline
        </button>
        <button (click)="router.navigate(['/incidents'])"
                class="flex items-center gap-2 px-4 py-2 bg-white border
                       border-gray-200 rounded-lg text-sm font-medium
                       hover:bg-red-50 hover:border-red-300 transition-colors">
           Incidente
        </button>
      </div>

      <!-- Grid 2x2 -->
      <div class="grid grid-cols-2 gap-3 mb-3">

        <!-- Live Feed -->
        <div (click)="router.navigate(['/live'])"
             class="bg-white rounded-xl border border-gray-200 border-l-4
                    border-l-green-500 p-5 cursor-pointer hover:shadow-md
                    hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">📡</span>
            <div class="flex-1">
              <div class="font-semibold text-gray-800">Live Feed</div>
              <div class="text-xs text-gray-500">stream în timp real</div>
            </div>
            <span class="flex items-center gap-1 text-xs bg-green-100
                         text-green-700 px-2 py-0.5 rounded-full border
                         border-green-300">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full
                           animate-pulse"></span>LIVE
            </span>
          </div>
          <p class="text-xs text-gray-500 mb-3 leading-relaxed">
            Stream în timp real al alertelor detectate. Subscripție
            WebSocket GraphQL — alertele apar instant fără refresh.
          </p>
        </div>

        <!-- Dashboard -->
        <div (click)="router.navigate(['/dashboard'])"
             class="bg-white rounded-xl border border-gray-200 border-l-4
                    border-l-blue-500 p-5 cursor-pointer hover:shadow-md
                    hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">📊</span>
            <div>
              <div class="font-semibold text-gray-800">Dashboard</div>
              <div class="text-xs text-gray-500">statistici agregate</div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-3 leading-relaxed">
            Grafice și KPI-uri agregate — distribuție HIGH/MEDIUM/LOW,
            evoluție în timp, categorii de loguri.
          </p>
        </div>

        <!-- Istoric -->
        <div (click)="router.navigate(['/history'])"
             class="bg-white rounded-xl border border-gray-200 border-l-4
                    border-l-purple-500 p-5 cursor-pointer hover:shadow-md
                    hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">🗂️</span>
            <div>
              <div class="font-semibold text-gray-800">Istoric alerte</div>
              <div class="text-xs text-gray-500">căutare în baza de date</div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-3 leading-relaxed">
            Căutare avansată în baza de date — filtrare după risk level,
            categorie, entitate și interval temporal.
          </p>
        </div>

        <!-- Entity Timeline -->
        <div (click)="router.navigate(['/entity', 'admin'])"
             class="bg-white rounded-xl border border-gray-200 border-l-4
                    border-l-teal-500 p-5 cursor-pointer hover:shadow-md
                    hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">📈</span>
            <div>
              <div class="font-semibold text-gray-800">Entity Timeline</div>
              <div class="text-xs text-gray-500">cronologie per entitate</div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-3 leading-relaxed">
            Vizualizare cronologică a activității unui utilizator sau IP —
            evoluția scorurilor ML în timp.
          </p>
        </div>

      </div>

      <!-- Incidente — card lat -->
      <div (click)="router.navigate(['/incidents'])"
           class="bg-white rounded-xl border border-gray-200 border-l-4
                  border-l-red-500 p-5 cursor-pointer hover:shadow-md
                  hover:-translate-y-0.5 transition-all">
        <div class="flex items-start gap-4">
          <span class="text-2xl mt-0.5">🔗</span>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <div class="font-semibold text-gray-800">Incidente corelate</div>
            </div>
            <p class="text-xs text-gray-500 mb-3 leading-relaxed">
              Reconstrucție criminalistică automată — corelarea evenimentelor
              per entitate în ferestre de 10 minute, identificarea root cause
              prin DFS și clasificarea tipului de atac cu mapare MITRE ATT&CK.
            </p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class HomeComponent {
  constructor(public router: Router) {}
}