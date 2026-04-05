import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">

    <!-- Header -->
<div class="mb-6">
  <div class="flex items-center gap-3 mb-2">
    <span class="text-4xl">🛡️</span>
    <h1 class="text-3xl font-bold text-gray-800">LogML</h1>
  </div>
  <p class="text-gray-500 text-lg">
    Sistem de detecție anomalii în loguri în timp real
  </p>
</div>

<!-- Bara de navigare rapidă -->
<div class="flex gap-3 mb-8">
  <a (click)="router.navigate(['/live'])"
     class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow
            cursor-pointer hover:bg-green-50 hover:border-green-300
            border border-gray-200 transition-colors text-sm font-medium">
    <span>📡</span> Live Feed
  </a>
  <a (click)="router.navigate(['/dashboard'])"
     class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow
            cursor-pointer hover:bg-indigo-50 hover:border-indigo-300
            border border-gray-200 transition-colors text-sm font-medium">
    <span>📊</span> Dashboard
  </a>
  <a (click)="router.navigate(['/history'])"
     class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow
            cursor-pointer hover:bg-blue-50 hover:border-blue-300
            border border-gray-200 transition-colors text-sm font-medium">
    <span>🗂️</span> Istoric
  </a>
  <a (click)="router.navigate(['/entity', 'admin'])"
     class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow
            cursor-pointer hover:bg-purple-50 hover:border-purple-300
            border border-gray-200 transition-colors text-sm font-medium">
    <span>📈</span> Entity Timeline
  </a>
</div>

      <!-- Carduri navigare -->
      <div class="grid grid-cols-2 gap-4">

        <!-- Live Feed -->
        <div (click)="router.navigate(['/live'])"
             class="bg-white rounded-xl shadow p-6 cursor-pointer
                    hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">📡</span>
            <h2 class="text-xl font-bold text-gray-800">Live Feed</h2>
            <span class="ml-auto flex items-center gap-1 px-2 py-1
                         bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p class="text-gray-500 text-sm">
            Stream în timp real al alertelor detectate din loguri.
            Filtrare după risk level și entitate.
          </p>
          <div class="mt-4 flex gap-2">
            <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">HIGH</span>
            <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">MEDIUM</span>
            <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">LOW</span>
          </div>
        </div>

        <!-- Dashboard -->
        <div (click)="router.navigate(['/dashboard'])"
             class="bg-white rounded-xl shadow p-6 cursor-pointer
                    hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">📊</span>
            <h2 class="text-xl font-bold text-gray-800">Dashboard</h2>
          </div>
          <p class="text-gray-500 text-sm">
            Statistici agregate — număr alerte per risk level,
            distribuție și grafice pe intervale de timp.
          </p>
          <div class="mt-4 flex gap-2">
            <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">KPI</span>
            <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">Statistici</span>
            <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">Grafice</span>
          </div>
        </div>

        <!-- Istoric -->
        <div (click)="router.navigate(['/history'])"
             class="bg-white rounded-xl shadow p-6 cursor-pointer
                    hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">🗂️</span>
            <h2 class="text-xl font-bold text-gray-800">Istoric Alerte</h2>
          </div>
          <p class="text-gray-500 text-sm">
            Căutare în PostgreSQL cu filtre avansate —
            risk level, categorie, entitate și interval temporal.
          </p>
          <div class="mt-4 flex gap-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">PostgreSQL</span>
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Filtre</span>
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Export CSV</span>
          </div>
        </div>

        <!-- Entity Timeline -->
        <div (click)="router.navigate(['/entity', 'admin'])"
             class="bg-white rounded-xl shadow p-6 cursor-pointer
                    hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">📈</span>
            <h2 class="text-xl font-bold text-gray-800">Entity Timeline</h2>
          </div>
          <p class="text-gray-500 text-sm">
            Istoricul alertelor per entitate — vizualizare cronologică
            a activității suspecte a unui utilizator sau IP.
          </p>
          <div class="mt-4 flex gap-2">
            <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Timeline</span>
            <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Per entitate</span>
          </div>
        </div>

      </div>

      <!-- Info arhitectură -->
      <div class="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 class="font-semibold text-gray-700 mb-3">🏗️ Arhitectură sistem</h3>
        <div class="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <span class="px-2 py-1 bg-white border rounded">Kafka</span>
          <span class="text-gray-400">→</span>
          <span class="px-2 py-1 bg-white border rounded">Python ML</span>
          <span class="text-gray-400">→</span>
          <span class="px-2 py-1 bg-white border rounded">Kafka ml_alerts</span>
          <span class="text-gray-400">→</span>
          <span class="px-2 py-1 bg-white border rounded">Spring Boot</span>
          <span class="text-gray-400">→</span>
          <span class="px-2 py-1 bg-white border rounded">GraphQL</span>
          <span class="text-gray-400">→</span>
          <span class="px-2 py-1 bg-white border rounded">Angular</span>
        </div>
      </div>

    </div>
  `
})
export class HomeComponent {
  constructor(public router: Router) {}
}