import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Alert } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-entity-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button (click)="router.navigate(['/live'])" class="hover:text-indigo-600 transition-colors">← Live Feed</button>
        <span>/</span><span>Entity Timeline</span>
      </div>

      <!-- Selector entitate + filtre -->
      <div class="bg-white rounded-xl shadow p-4 mb-6">
        <div class="flex items-center gap-4 flex-wrap">

          <!-- Dropdown entitate -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600">👤 Entitate:</label>
            <select [(ngModel)]="entityId" (change)="loadHistory()"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:border-indigo-500 min-w-32">
              <option value="">-- Selectează --</option>
              <option *ngFor="let e of availableEntities" [value]="e">{{ e }}</option>
            </select>
          </div>

          <!-- Selector interval -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600">🕐 Interval:</label>
            <select [(ngModel)]="windowMinutes" (change)="loadHistory()"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:border-indigo-500">
              <option [value]="60">Ultima oră</option>
              <option [value]="360">Ultimele 6h</option>
              <option [value]="1440">Ultimele 24h</option>
              <option [value]="10080">Ultima săptămână</option>
              <option [value]="999999">Toate</option>
            </select>
          </div>

          <!-- Filtre risk -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600">Risk:</label>
            <div class="flex gap-1">
              <button (click)="setLevel('HIGH')"
                      class="px-3 py-1 rounded text-xs font-semibold border transition-colors"
                      [class]="activeLevel === 'HIGH'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'border-gray-300 text-gray-400 hover:bg-gray-50'">
                🔴 HIGH
              </button>
              <button (click)="setLevel('MEDIUM')"
                      class="px-3 py-1 rounded text-xs font-semibold border transition-colors"
                      [class]="activeLevel === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        : 'border-gray-300 text-gray-400 hover:bg-gray-50'">
                🟡 MEDIUM
              </button>
              <button (click)="setLevel('LOW')"
                      class="px-3 py-1 rounded text-xs font-semibold border transition-colors"
                      [class]="activeLevel === 'LOW'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'border-gray-300 text-gray-400 hover:bg-gray-50'">
                🟢 LOW
              </button>
              <button (click)="setLevel(null)"
                      class="px-3 py-1 rounded text-xs font-semibold border transition-colors"
                      [class]="activeLevel === null
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                        : 'border-gray-300 text-gray-400 hover:bg-gray-50'">
                Toate
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty state — nicio entitate selectată -->
      <div *ngIf="!entityId" class="text-center py-16 text-gray-400">
        <div class="text-4xl mb-3">👤</div>
        <p class="font-medium">Selectează o entitate din dropdown</p>
      </div>

      <!-- Summary -->
      <div class="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-6"
           *ngIf="entityId && alerts.length > 0">
        <div class="text-center cursor-pointer" (click)="setLevel('HIGH')">
          <div class="text-2xl font-bold text-red-600">{{ highCount }}</div>
          <div class="text-xs text-gray-500">HIGH</div>
        </div>
        <div class="text-center cursor-pointer" (click)="setLevel('MEDIUM')">
          <div class="text-2xl font-bold text-yellow-600">{{ mediumCount }}</div>
          <div class="text-xs text-gray-500">MEDIUM</div>
        </div>
        <div class="text-center cursor-pointer" (click)="setLevel('LOW')">
          <div class="text-2xl font-bold text-green-600">{{ lowCount }}</div>
          <div class="text-xs text-gray-500">LOW</div>
        </div>
        <div class="text-center cursor-pointer" (click)="setLevel(null)">
          <div class="text-2xl font-bold text-indigo-600">{{ alerts.length }}</div>
          <div class="text-xs text-gray-500">TOTAL</div>
        </div>
        <div class="flex-1">
          <div class="text-xs text-gray-500 mb-1">Progresie risc:</div>
          <div class="flex h-3 rounded-full overflow-hidden">
            <div *ngFor="let a of alerts"
                 [class]="getProgressClass(a.riskLevel)"
                 [style.width.%]="100 / alerts.length"
                 [title]="a.timestampIso + ' — ' + a.finalRisk">
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="space-y-2" *ngIf="entityId && filteredAlerts.length > 0">
        <div *ngFor="let alert of filteredAlerts; let i = index" class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center
                        text-sm border-2 flex-shrink-0"
                 [class]="getDotClass(alert.riskLevel)">
              {{ getRiskIcon(alert.riskLevel) }}
            </div>
            <div class="w-0.5 flex-1 bg-gray-200 my-1"
                 *ngIf="i < filteredAlerts.length - 1"></div>
          </div>
          <div class="flex-1 bg-white rounded-xl shadow p-4 mb-2
                      cursor-pointer hover:shadow-md transition-shadow"
               (click)="openDetail(alert)">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-mono text-sm font-semibold text-gray-700">
                {{ alert.timestampIso | date:'HH:mm:ss' }}
              </span>
              <span class="px-2 py-0.5 rounded text-xs"
                    [class]="getCategoryClass(alert.logCategory)">
                {{ alert.logCategory }}
              </span>
              <span class="ml-auto font-bold text-sm"
                    [class]="getRiskTextClass(alert.riskLevel)">
                {{ alert.finalRisk | number:'1.3-3' }}
              </span>
            </div>
            <div class="font-mono text-xs text-gray-500 truncate mb-2">
              {{ alert.rawLog }}
            </div>
            <div class="flex flex-wrap gap-1 mb-2"
                 *ngIf="(alert.rulesFired || []).length > 0">
              <span *ngFor="let rule of (alert.rulesFired || [])"
                    class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                {{ rule }}
              </span>
            </div>
            <div class="flex gap-3 text-xs text-gray-500"
                 *ngIf="alert.entityContext">
              <span *ngIf="alert.entityContext.failedAuth > 0">
                🔐 {{ alert.entityContext.failedAuth }} failed
              </span>
              <span *ngIf="alert.entityContext.sudoCount > 0">
                🔑 {{ alert.entityContext.sudoCount }} sudo
              </span>
              <span *ngIf="alert.entityContext.lsass > 0">
                💾 {{ alert.entityContext.lsass }} lsass
              </span>
              <span *ngIf="alert.entityContext.uploads > 0">
                📤 {{ alert.entityContext.uploads }} uploads
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state — nicio alertă -->
      <div *ngIf="entityId && alerts.length === 0"
           class="text-center py-16 text-gray-400">
        <div class="text-4xl mb-3">📈</div>
        <p>Nicio alertă pentru <strong>{{ entityId }}</strong> în intervalul selectat</p>
      </div>

    </div>
  `
})
export class EntityTimelineComponent implements OnInit {

  entityId = '';
  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  windowMinutes = 999999;
  activeLevel: string | null = null;

  availableEntities: string[] = [
    'admin', 'root', 'guest', 'user1', 'user2',
    'test', 'backup', 'service', 'support',
    '192.168.1.1', '192.168.22.16', '192.168.8.17'
  ];

  get highCount()   { return this.alerts.filter(a => a.riskLevel === 'HIGH').length; }
  get mediumCount() { return this.alerts.filter(a => a.riskLevel === 'MEDIUM').length; }
  get lowCount()    { return this.alerts.filter(a => a.riskLevel === 'LOW').length; }

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Dacă vine din Live Feed cu entityId în URL
    const id = this.route.snapshot.paramMap.get('entityId');
    if (id) {
      this.entityId = id;
      this.loadHistory();
    }
  }

loadHistory(): void {
  if (!this.entityId) {
    console.log('⚠️ Nicio entitate selectată');
    return;
  }

  console.log('🔍 loadHistory:', {
    entityId: this.entityId,
    windowMinutes: this.windowMinutes,
    type: typeof this.windowMinutes
  });

  this.alertService.getEntityHistory(this.entityId, Number(this.windowMinutes))
    .subscribe({
      next: alerts => {
        console.log('✅ Alerte primite:', alerts.length);
        console.log('📋 Prima alertă:', alerts[0]);
        this.alerts = alerts;
        this.applyFilter();
        console.log('📊 După filtrare:', this.filteredAlerts.length);
      },
      error: err => console.error('❌ Eroare GraphQL:', err)
    });
}

setLevel(level: string | null): void {
  console.log('🎯 setLevel:', level);
  this.activeLevel = level;
  this.applyFilter();
  console.log('📊 filteredAlerts după setLevel:', this.filteredAlerts.length);
}

  applyFilter(): void {
    if (this.activeLevel === null) {
      this.filteredAlerts = [...this.alerts];
    } else {
      this.filteredAlerts = this.alerts.filter(
        a => a.riskLevel === this.activeLevel
      );
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

  getDotClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-50 border-red-400';
    if (level === 'MEDIUM') return 'bg-yellow-50 border-yellow-400';
    return 'bg-green-50 border-green-400';
  }

  getProgressClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-500';
    if (level === 'MEDIUM') return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      auth:    'bg-blue-100 text-blue-700',
      web:     'bg-green-100 text-green-700',
      network: 'bg-orange-100 text-orange-700',
      system:  'bg-purple-100 text-purple-700',
      alert:   'bg-red-100 text-red-700',
    };
    return map[category] || 'bg-gray-100 text-gray-700';
  }

  openDetail(alert: Alert): void {
    this.router.navigate(['/alert', alert.eventId]);
  }
}