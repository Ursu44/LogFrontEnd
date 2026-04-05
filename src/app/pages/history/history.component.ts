import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Alert } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">

      <div class="flex items-center gap-3 mb-6">
        <button (click)="router.navigate(['/live'])"
                class="hover:text-indigo-600 transition-colors text-gray-500">
          ← Live Feed
        </button>
        <span class="text-gray-300">/</span>
        <h1 class="text-2xl font-bold text-gray-800">Istoric Alerte</h1>
      </div>

      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          🔍 Filtre căutare PostgreSQL
        </h2>
        <div class="grid grid-cols-3 gap-4 mb-4">

          <!-- Risk Level -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">
              Risk Level
            </label>
            <div class="flex gap-4">
              <label *ngFor="let level of ['HIGH', 'MEDIUM', 'LOW']"
                     class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                       [checked]="isLevelChecked(level)"
                       (change)="toggleLevel(level)"
                       class="w-4 h-4 rounded accent-indigo-600">
                <span class="text-sm font-medium"
                      [class]="getRiskTextClass(level)">
                  {{ getRiskIcon(level) }} {{ level }}
                </span>
              </label>
            </div>
          </div>

          <!-- Categorie -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">
              Categorie
            </label>
            <select [(ngModel)]="selectedCategory"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:border-indigo-500">
              <option value="">Toate</option>
              <option value="auth">Auth</option>
              <option value="web">Web</option>
              <option value="network">Network</option>
              <option value="system">System</option>
              <option value="alert">Alert</option>
            </select>
          </div>

          <!-- Entitate -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">
              Entitate
            </label>
            <input [(ngModel)]="selectedEntity"
                   placeholder="ex: admin, root, 192.168.1.5"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg
                          text-sm focus:outline-none focus:border-indigo-500">
          </div>

          <!-- Interval -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">
              Interval
            </label>
            <select [(ngModel)]="selectedWindow"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:border-indigo-500">
              <option value="60">Ultima oră</option>
              <option value="360">Ultimele 6h</option>
              <option value="1440">Ultimele 24h</option>
              <option value="10080">Ultima săptămână</option>
              <option value="999999">Toate</option>
            </select>
          </div>

          <!-- Limită -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">
              Max rezultate
            </label>
            <select [(ngModel)]="selectedLimit"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:border-indigo-500">
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
               <option value="5000">6000</option>
            </select>
          </div>

        </div>

        <div class="flex gap-3">
          <button (click)="search()"
                  [disabled]="loading"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg
                         hover:bg-indigo-700 transition-colors text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? '⏳ Căutare...' : '🔍 Caută în PostgreSQL' }}
          </button>
          <button (click)="clearFilters()"
                  class="px-4 py-2 border border-gray-300 rounded-lg
                         hover:bg-gray-100 transition-colors text-sm">
            ✕ Resetează
          </button>
        </div>
      </div>

      <!-- Loading bar -->
      <div *ngIf="loading"
           class="w-full h-1 bg-indigo-200 rounded mb-4 overflow-hidden">
        <div class="h-full bg-indigo-600 animate-pulse w-full"></div>
      </div>

      <!-- Rezultate -->
      <div *ngIf="hasSearched">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">
          {{ results.length }} alerte găsite
        </h2>

        <div class="bg-white rounded-xl shadow overflow-hidden"
             *ngIf="results.length > 0">
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
                  class="border-b border-gray-100 cursor-pointer
                         hover:bg-gray-50 transition-colors"
                  [class]="getRowClass(alert.riskLevel)">
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-bold"
                        [class]="getRiskBadgeClass(alert.riskLevel)">
                    {{ getRiskIcon(alert.riskLevel) }} {{ alert.riskLevel }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span (click)="goToTimeline(alert.entityId);
                                 $event.stopPropagation()"
                        class="text-indigo-600 font-medium
                               hover:underline cursor-pointer">
                    {{ alert.entityId }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 bg-blue-100 text-blue-700
                               rounded text-xs">
                    {{ alert.logCategory }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span *ngFor="let rule of (alert.rulesFired || []).slice(0,2)"
                        class="inline-block px-2 py-0.5 bg-indigo-50
                               text-indigo-700 rounded text-xs mr-1">
                    {{ rule }}
                  </span>
                  <span *ngIf="(alert.rulesFired || []).length > 2"
                        class="text-xs text-gray-400">
                    +{{ (alert.rulesFired || []).length - 2 }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="font-mono font-semibold text-xs"
                        [class]="getRiskTextClass(alert.riskLevel)">
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

        <div *ngIf="results.length === 0"
             class="text-center py-16 text-gray-400 bg-white rounded-xl shadow">
          <div class="text-4xl mb-3">🔍</div>
          <p class="font-medium">Nicio alertă găsită</p>
          <p class="text-sm mt-1">
            Încearcă un interval mai mare sau filtre diferite
          </p>
        </div>
      </div>

      <!-- Initial state -->
      <div *ngIf="!hasSearched && !loading"
           class="text-center py-20 text-gray-400">
        <div class="text-4xl mb-3">🗂️</div>
        <p class="font-medium">Selectează filtrele și apasă Caută</p>
      </div>

    </div>
  `
})
export class HistoryComponent {

  selectedLevels: string[] = ['HIGH', 'MEDIUM'];
  selectedCategory = '';
  selectedEntity = '';
  selectedWindow = '999999';
  selectedLimit = '100';

  results: Alert[] = [];
  loading = false;
  hasSearched = false;

  constructor(
    public router: Router,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

 search(): void {
  this.loading = true;
  this.hasSearched = true;

  const riskLevel = this.selectedLevels.length === 1
    ? this.selectedLevels[0]
    : undefined;

  console.log('🔍 Parametri trimiși:', {
    riskLevel,
    category: this.selectedCategory,
    entityId: this.selectedEntity,
    windowMinutes: Number(this.selectedWindow),
    limit: Number(this.selectedLimit),
    selectedLevels: this.selectedLevels
  });

  this.alertService.getAlerts({
    riskLevel,
    category: this.selectedCategory || undefined,
    entityId: this.selectedEntity && this.selectedEntity.trim() !== '' 
    ? this.selectedEntity.trim() 
    : undefined,
    windowMinutes: Number(this.selectedWindow),
    limit: Number(this.selectedLimit),
  }).subscribe({
  next: alerts => {
  console.log('entityId trimis:', JSON.stringify(this.selectedEntity));
  console.log('entityId length:', this.selectedEntity?.length);
  console.log(`✅ [${this.selectedWindow} min] Total primit: ${alerts.length}`);
  console.log('📋 Toate alertele primite:', alerts);
  console.log('📊 Distribuție:', {
    HIGH: alerts.filter(a => a.riskLevel === 'HIGH').length,
    MEDIUM: alerts.filter(a => a.riskLevel === 'MEDIUM').length,
    LOW: alerts.filter(a => a.riskLevel === 'LOW').length,
  });
  console.log('🕐 Primul timestamp:', alerts[0]?.timestampIso);
  console.log('🕐 Ultimul timestamp:', alerts[alerts.length - 1]?.timestampIso);

  this.results = this.selectedLevels.length > 1
    ? alerts.filter(a => this.selectedLevels.includes(a.riskLevel))
    : alerts;

  console.log('📋 Rezultate după filtrare locală:', this.results.length);
  this.loading = false;
  this.cdr.detectChanges();
},
    error: err => {
      console.error('❌ Eroare:', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  clearFilters(): void {
    this.selectedLevels = ['HIGH', 'MEDIUM'];
    this.selectedCategory = '';
    this.selectedEntity = '';
    this.selectedWindow = '999999';
    this.selectedLimit = '100';
    this.results = [];
    this.hasSearched = false;
    this.cdr.detectChanges();
  }

  isLevelChecked(level: string): boolean {
    return this.selectedLevels.includes(level);
  }

  toggleLevel(level: string): void {
    if (this.selectedLevels.includes(level)) {
      this.selectedLevels = this.selectedLevels.filter(l => l !== level);
    } else {
      this.selectedLevels.push(level);
    }
  }

  getRiskIcon(level: string): string {
    return level === 'HIGH' ? '🔴' : level === 'MEDIUM' ? '🟡' : '🟢';
  }

  getRiskTextClass(level: string): string {
    if (level === 'HIGH')   return 'text-red-600';
    if (level === 'MEDIUM') return 'text-yellow-600';
    return 'text-green-600';
  }

  getRiskBadgeClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-100 text-red-700';
    if (level === 'MEDIUM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getRowClass(level: string): string {
    if (level === 'HIGH')   return 'border-l-4 border-l-red-400';
    if (level === 'MEDIUM') return 'border-l-4 border-l-yellow-400';
    return 'border-l-4 border-l-green-400';
  }

  openDetail(alert: Alert): void {
    this.router.navigate(['/alert', alert.eventId]);
  }

  goToTimeline(entityId: string): void {
    this.router.navigate(['/entity', entityId]);
  }
}