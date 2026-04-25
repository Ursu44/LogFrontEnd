import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { Alert } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-live-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold text-gray-800">Live Alerts</h1>

          <!-- Indicator LIVE / PAUSED -->
          <span class="flex items-center gap-2 px-3 py-1 rounded-full
                       text-sm font-semibold"
                [class]="isPaused
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-green-100 text-green-700'">
            <span class="w-2 h-2 rounded-full"
                  [class]="isPaused
                    ? 'bg-orange-500'
                    : 'bg-green-500 animate-pulse'"></span>
            {{ isPaused ? 'PAUSED' : 'LIVE' }}
          </span>

          <!-- Contoare cu procente -->
          <span class="px-2 py-1 bg-red-100 text-red-700 rounded
                       text-sm font-bold">
            {{ highCount }} HIGH
            <span class="font-normal opacity-75">({{ highPercent }}%)</span>
          </span>
          <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded
                       text-sm font-bold">
            {{ mediumCount }} MED
            <span class="font-normal opacity-75">({{ mediumPercent }}%)</span>
          </span>
          <span class="px-2 py-1 bg-green-100 text-green-700 rounded
                       text-sm font-bold">
            {{ lowCount }} LOW
            <span class="font-normal opacity-75">({{ lowPercent }}%)</span>
          </span>
        </div>

        <div class="flex gap-2">
          <button (click)="togglePause()"
                  class="px-4 py-2 rounded-lg border border-gray-300
                         hover:bg-gray-100 transition-colors text-sm">
            {{ isPaused ? '▶ Reia' : '⏸ Pauză' }}
          </button>
          <button (click)="exportCsv()"
                  class="px-4 py-2 rounded-lg border border-gray-300
                         hover:bg-gray-100 transition-colors text-sm">
            ⬇ Export CSV
          </button>
          <button (click)="goToHistory()"
                  class="px-4 py-2 rounded-lg bg-indigo-600 text-white
                         hover:bg-indigo-700 transition-colors text-sm">
            🗂 Caută în Istoric
          </button>
        </div>
      </div>

      <!-- Bare de progres vizuale -->
      <div class="bg-white rounded-xl shadow p-4 mb-4"
           *ngIf="totalCount > 0">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-medium text-gray-500 w-16">HIGH</span>
          <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-red-500 rounded-full transition-all duration-500"
                 [style.width.%]="highPercent">
            </div>
          </div>
          <span class="text-xs font-mono text-red-600 w-12 text-right">
            {{ highPercent }}%
          </span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-medium text-gray-500 w-16">MEDIUM</span>
          <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-yellow-500 rounded-full transition-all duration-500"
                 [style.width.%]="mediumPercent">
            </div>
          </div>
          <span class="text-xs font-mono text-yellow-600 w-12 text-right">
            {{ mediumPercent }}%
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-gray-500 w-16">LOW</span>
          <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-green-500 rounded-full transition-all duration-500"
                 [style.width.%]="lowPercent">
            </div>
          </div>
          <span class="text-xs font-mono text-green-600 w-12 text-right">
            {{ lowPercent }}%
          </span>
        </div>
      </div>

      <!-- Filtre -->
      <div class="flex items-center gap-4 mb-4">
        <div class="flex gap-2">
          <button *ngFor="let level of ['HIGH', 'MEDIUM', 'LOW']"
                  (click)="toggleRiskLevel(level)"
                  class="px-3 py-1 rounded-full text-sm font-semibold
                         border transition-colors"
                  [class]="isSelected(level)
                    ? getRiskSelectedClass(level)
                    : 'border-gray-300 text-gray-500 hover:bg-gray-100'">
            {{ getRiskIcon(level) }} {{ level }}
          </button>
        </div>

        <button (click)="resetFilters()"
                class="px-3 py-1 rounded-full text-sm font-semibold
                       border transition-colors"
                [class]="selectedRiskLevels.length === 3
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-100'">
          🔄 Toate
        </button>

        <input [(ngModel)]="searchTerm"
               (input)="applyFilters()"
               placeholder="Caută entitate sau regulă..."
               class="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                      text-sm focus:outline-none focus:border-indigo-500">
      </div>

      <!-- Tabel alerte -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Risk</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Entitate</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Categorie</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Reguli</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Score</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">Timp</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let alert of filteredAlerts"
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
                <div class="flex items-center gap-2">
                  <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                         [class]="getScoreBarClass(alert.riskLevel)"
                         [style.width.%]="alert.finalRisk * 100">
                    </div>
                  </div>
                  <span class="text-xs font-mono text-gray-600">
                    {{ alert.finalRisk | number:'1.3-3' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">
                {{ alert.timestampIso | date:'HH:mm:ss' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filteredAlerts.length === 0"
             class="text-center py-16 text-gray-400">
          <div class="text-4xl mb-3">📡</div>
          <p>Așteptând alerte...</p>
        </div>
      </div>
    </div>
  `
})
export class LiveFeedComponent implements OnInit, OnDestroy {

  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  selectedRiskLevels: string[] = ['HIGH', 'MEDIUM', 'LOW'];
  searchTerm = '';
  isPaused = false;

  private sub!: Subscription;
  private MAX_ALERTS = 200;

  // ── Getter-e contoare ─────────────────────────────────────────
  get highCount()   { return this.alerts.filter(a => a.riskLevel === 'HIGH').length; }
  get mediumCount() { return this.alerts.filter(a => a.riskLevel === 'MEDIUM').length; }
  get lowCount()    { return this.alerts.filter(a => a.riskLevel === 'LOW').length; }
  get totalCount()  { return this.alerts.length; }

  // ── Getter-e procente ─────────────────────────────────────────
  get highPercent(): number {
    if (!this.totalCount) return 0;
    return Math.round((this.highCount / this.totalCount) * 100);
  }

  get mediumPercent(): number {
    if (!this.totalCount) return 0;
    return Math.round((this.mediumCount / this.totalCount) * 100);
  }

  get lowPercent(): number {
    if (!this.totalCount) return 0;
    return Math.round((this.lowCount / this.totalCount) * 100);
  }

  constructor(
    private alertService: AlertService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Istoricul din PostgreSQL la pornire
    this.alertService.getRecentAlerts().subscribe(alerts => {
      this.alerts = [...alerts];
      this.applyFilters();
      this.cdr.detectChanges();
    });

    // Alerte live prin WebSocket
    this.sub = this.alertService.subscribeToAlerts().subscribe({
      next: alert => {
        if (this.isPaused) return;
        const exists = this.alerts.some(a => a.eventId === alert.eventId);
        if (!exists) {
          this.alerts = [alert, ...this.alerts].slice(0, this.MAX_ALERTS);
          this.applyFilters();
          this.cdr.detectChanges();
          // procentele se recalculează automat — sunt getter-e
        }
      },
      error: err => console.error('Eroare subscription:', err)
    });
  }

  togglePause(): void { this.isPaused = !this.isPaused; }

  toggleRiskLevel(level: string): void {
    if (this.selectedRiskLevels.length === 1 &&
        this.selectedRiskLevels.includes(level)) {
      this.selectedRiskLevels = ['HIGH', 'MEDIUM', 'LOW'];
    } else {
      this.selectedRiskLevels = [level];
    }
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedRiskLevels = ['HIGH', 'MEDIUM', 'LOW'];
    this.searchTerm = '';
    this.applyFilters();
  }

  isSelected(level: string): boolean {
    return this.selectedRiskLevels.length === 1 &&
           this.selectedRiskLevels.includes(level);
  }

  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      if (!this.selectedRiskLevels.includes(alert.riskLevel)) return false;
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        const inEntity = alert.entityId?.toLowerCase().includes(term);
        const inRules  = (alert.rulesFired || [])
          .some(r => r.toLowerCase().includes(term));
        if (!inEntity && !inRules) return false;
      }
      return true;
    });
  }

  getRiskIcon(level: string): string {
    return level === 'HIGH' ? '🔴' : level === 'MEDIUM' ? '🟡' : '🟢';
  }

  getRiskBadgeClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-100 text-red-700';
    if (level === 'MEDIUM') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }

  getRiskSelectedClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-100 text-red-700 border-red-300';
    if (level === 'MEDIUM') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  }

  getRowClass(level: string): string {
    if (level === 'HIGH')   return 'border-l-4 border-l-red-400';
    if (level === 'MEDIUM') return 'border-l-4 border-l-yellow-400';
    return 'border-l-4 border-l-green-400';
  }

  getScoreBarClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-500';
    if (level === 'MEDIUM') return 'bg-yellow-500';
    return 'bg-green-500';
  }

  openDetail(alert: Alert): void {
    this.router.navigate(['/alert', alert.eventId]);
  }

  goToTimeline(entityId: string): void {
    this.router.navigate(['/entity', entityId]);
  }

  goToHistory(): void {
    this.router.navigate(['/history']);
  }

  exportCsv(): void {
    const headers = ['eventId','entityId','riskLevel','finalRisk',
                     'logCategory','rulesFired','timestampIso'];
    const rows = this.filteredAlerts.map(a => [
      a.eventId, a.entityId, a.riskLevel, a.finalRisk,
      a.logCategory, (a.rulesFired || []).join(';'), a.timestampIso
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement('a');
    el.href = url;
    el.download = `alerts_${new Date().toISOString()}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}