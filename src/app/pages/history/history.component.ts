import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Alert, AlertFilters } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">

      <div class="flex items-center gap-3 mb-6">
        <button (click)="router.navigate(['/live'])" class="hover:text-indigo-600 transition-colors text-gray-500">← Live Feed</button>
        <span class="text-gray-300">/</span>
        <h1 class="text-2xl font-bold text-gray-800">Istoric Alerte</h1>
      </div>

      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">🔍 Filtre căutare PostgreSQL</h2>
        <div class="grid grid-cols-3 gap-4 mb-4">

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Risk Level</label>
            <div class="flex gap-2">
              <label *ngFor="let level of ['HIGH', 'MEDIUM', 'LOW']"
                     class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox"
                       [checked]="isLevelChecked(level)"
                       (change)="toggleLevel(level)"
                       class="rounded">
                <span class="text-sm">{{ getRiskIcon(level) }} {{ level }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Categorie</label>
            <select [(ngModel)]="filters.category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Toate</option>
              <option value="auth">Auth</option>
              <option value="web">Web</option>
              <option value="network">Network</option>
              <option value="system">System</option>
              <option value="alert">Alert</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Entitate</label>
            <input [(ngModel)]="filters.entityId"
                   placeholder="ex: admin, root, 192.168.1.5"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Interval</label>
            <select [(ngModel)]="filters.windowMinutes"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
              <option [value]="15">Ultimele 15 min</option>
              <option [value]="30">Ultimele 30 min</option>
              <option [value]="60">Ultima oră</option>
              <option [value]="180">Ultimele 3h</option>
              <option [value]="360">Ultimele 6h</option>
              <option [value]="1440">Ultimele 24h</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Max rezultate</label>
            <select [(ngModel)]="filters.limit"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500">
              <option [value]="50">50</option>
              <option [value]="100">100</option>
              <option [value]="200">200</option>
              <option [value]="500">500</option>
            </select>
          </div>

        </div>
        <div class="flex gap-3">
          <button (click)="search()" [disabled]="loading"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? '⏳ Căutare...' : '🔍 Caută în PostgreSQL' }}
          </button>
          <button (click)="clearFilters()"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm">
            ✕ Resetează
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="w-full h-1 bg-indigo-200 rounded mb-4 overflow-hidden">
        <div class="h-full bg-indigo-600 animate-pulse w-full"></div>
      </div>

      <div *ngIf="hasSearched">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-700">{{ results.length }} alerte găsite</h2>
        </div>

        <div class="bg-white rounded-xl shadow overflow-hidden" *ngIf="results.length > 0">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Risk</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Entitate</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Categorie</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Reguli</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Score</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let alert of results"
                  (click)="openDetail(alert)"
                  class="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  [class]="getRowClass(alert.riskLevel)">
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-bold" [class]="getRiskBadgeClass(alert.riskLevel)">
                    {{ getRiskIcon(alert.riskLevel) }} {{ alert.riskLevel }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span (click)="goToTimeline(alert.entityId); $event.stopPropagation()"
                        class="text-indigo-600 font-medium hover:underline cursor-pointer">
                    {{ alert.entityId }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{{ alert.logCategory }}</span>
                </td>
                <td class="px-4 py-3">
                  <span *ngFor="let rule of (alert.rulesFired || []).slice(0,2)"
                        class="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs mr-1">
                    {{ rule }}
                  </span>
                  <span *ngIf="(alert.rulesFired || []).length > 2" class="text-xs text-gray-400">
                    +{{ (alert.rulesFired || []).length - 2 }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-mono font-semibold text-xs" [class]="getRiskTextClass(alert.riskLevel)">
                    {{ alert.finalRisk | number:'1.3-3' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500 font-mono text-xs">
                  {{ alert.timestampIso | date:'dd/MM/yy HH:mm:ss' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="results.length === 0" class="text-center py-16 text-gray-400 bg-white rounded-xl shadow">
          <div class="text-4xl mb-3">🔍</div>
          <p class="font-medium">Nicio alertă găsită</p>
          <p class="text-sm mt-1">Încearcă un interval mai mare sau filtre diferite</p>
        </div>
      </div>

      <div *ngIf="!hasSearched && !loading" class="text-center py-20 text-gray-400">
        <div class="text-4xl mb-3">🗂️</div>
        <p class="font-medium">Selectează filtrele și apasă Caută</p>
        <p class="text-sm mt-1 text-gray-300">Date preluate din PostgreSQL — alerte HIGH și MEDIUM din sesiunile anterioare</p>
      </div>

    </div>
  `
})
export class HistoryComponent {

  filters: AlertFilters = { windowMinutes: 30, limit: 100 };
  selectedLevels: string[] = ['HIGH', 'MEDIUM'];
  results: Alert[] = [];
  loading = false;
  hasSearched = false;

  constructor(public router: Router, private alertService: AlertService) {}

  search(): void {
    this.loading = true;
    this.hasSearched = true;
    const riskLevel = this.selectedLevels.length === 1 ? this.selectedLevels[0] : undefined;
    this.alertService.getAlerts({
      ...this.filters,
      riskLevel,
      category: this.filters.category || undefined,
      entityId: this.filters.entityId || undefined,
    }).subscribe({
      next: alerts => {
        this.results = this.selectedLevels.length > 1
          ? alerts.filter(a => this.selectedLevels.includes(a.riskLevel))
          : alerts;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  clearFilters(): void {
    this.filters = { windowMinutes: 30, limit: 100 };
    this.selectedLevels = ['HIGH', 'MEDIUM'];
    this.results = [];
    this.hasSearched = false;
  }

  isLevelChecked(level: string): boolean { return this.selectedLevels.includes(level); }
  toggleLevel(level: string): void {
    if (this.selectedLevels.includes(level)) {
      this.selectedLevels = this.selectedLevels.filter(l => l !== level);
    } else {
      this.selectedLevels.push(level);
    }
  }
  getRiskIcon(level: string): string { return level === 'HIGH' ? '🔴' : level === 'MEDIUM' ? '🟡' : '🟢'; }
  getRiskBadgeClass(level: string): string {
    if (level === 'HIGH') return 'bg-red-100 text-red-700';
    if (level === 'MEDIUM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }
  getRiskTextClass(level: string): string {
    if (level === 'HIGH') return 'text-red-600';
    if (level === 'MEDIUM') return 'text-yellow-600';
    return 'text-green-600';
  }
  getRowClass(level: string): string {
    if (level === 'HIGH') return 'border-l-4 border-l-red-400';
    if (level === 'MEDIUM') return 'border-l-4 border-l-yellow-400';
    return 'border-l-4 border-l-green-400';
  }
  openDetail(alert: Alert): void { this.router.navigate(['/alert', alert.eventId]); }
  goToTimeline(entityId: string): void { this.router.navigate(['/entity', entityId]); }
}