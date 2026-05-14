import { Component, OnInit, OnDestroy,
         ChangeDetectorRef } from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Alert } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-entity-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <div class="flex items-center gap-2 text-sm
                  text-gray-500 mb-4">
        <span>Entity Timeline</span>
      </div>

      <!-- Selector entitate + filtre -->
      <div class="bg-white rounded-xl shadow p-4 mb-6">
        <div class="flex items-center gap-4 flex-wrap">

          <!-- Text box entitate -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600">
              👤 Entitate:
            </label>
            <input [(ngModel)]="entityId"
                   (keyup.enter)="loadHistory()"
                   (ngModelChange)="onEntityChange()"
                   placeholder="ex: admin, user1..."
                   class="px-3 py-2 border border-gray-300
                          rounded-lg text-sm focus:outline-none
                          focus:border-indigo-500 w-40"/>
          </div>

          <!-- Selector interval -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600">
              🕐 Interval:
            </label>
            <select [(ngModel)]="windowMinutes"
                    class="px-3 py-2 border border-gray-300
                           rounded-lg text-sm focus:outline-none
                           focus:border-indigo-500">
              <option [value]="60">Ultima oră</option>
              <option [value]="360">Ultimele 6h</option>
              <option [value]="1440">Ultimele 24h</option>
              <option [value]="10080">Ultima săptămână</option>
              <option [value]="43200">Ultima lună</option>
              <option [value]="999999">Toate</option>
            </select>
          </div>

          <!-- Filtre risk -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-600">
              Risk:
            </label>
            <div class="flex gap-1">
              <button (click)="setLevel('HIGH')"
                      class="px-3 py-1 rounded text-xs
                             font-semibold border transition-colors"
                      [class]="activeLevel === 'HIGH'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'border-gray-300 text-gray-400
                           hover:bg-gray-50'">
                🔴 HIGH
              </button>
              <button (click)="setLevel('MEDIUM')"
                      class="px-3 py-1 rounded text-xs
                             font-semibold border transition-colors"
                      [class]="activeLevel === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700
                           border-yellow-300'
                        : 'border-gray-300 text-gray-400
                           hover:bg-gray-50'">
                🟡 MEDIUM
              </button>
              <button (click)="setLevel('LOW')"
                      class="px-3 py-1 rounded text-xs
                             font-semibold border transition-colors"
                      [class]="activeLevel === 'LOW'
                        ? 'bg-green-100 text-green-700
                           border-green-300'
                        : 'border-gray-300 text-gray-400
                           hover:bg-gray-50'">
                🟢 LOW
              </button>
              <button (click)="setLevel(null)"
                      class="px-3 py-1 rounded text-xs
                             font-semibold border transition-colors"
                      [class]="activeLevel === null
                        ? 'bg-indigo-100 text-indigo-700
                           border-indigo-300'
                        : 'border-gray-300 text-gray-400
                           hover:bg-gray-50'">
                Toate
              </button>
            </div>
          </div>

          <!-- Buton reîncărcare -->
          <button (click)="loadHistory()"
                  [disabled]="!entityId || loading"
                  class="ml-auto flex items-center gap-2
                         px-4 py-2 bg-indigo-600 text-white
                         rounded-lg text-sm font-medium
                         hover:bg-indigo-700
                         disabled:opacity-40
                         disabled:cursor-not-allowed
                         transition-colors">
            <span [class]="loading ? 'animate-spin' : ''">
              🔄
            </span>
            {{ loading ? 'Se încarcă...' : 'Reîncarcă' }}
          </button>

        </div>

        <!-- Loading bar -->
        <div *ngIf="loading"
             class="mt-3 h-1 bg-indigo-100 rounded
                    overflow-hidden">
          <div class="h-full bg-indigo-500 animate-pulse
                      w-full"></div>
        </div>

      </div>

      <!-- Empty state — nicio entitate -->
      <div *ngIf="!entityId"
           class="text-center py-16 text-gray-400">
        <div class="text-4xl mb-3">👤</div>
        <p class="font-medium">
          Introdu o entitate și apasă Reîncarcă
        </p>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading && entityId"
           class="text-center py-16 text-gray-400">
        <div class="text-4xl mb-3 animate-bounce">⏳</div>
        <p>Se încarcă alertele pentru
          <strong class="text-gray-600">
            {{ entityId }}
          </strong>...
        </p>
      </div>

      <!-- Summary -->
      <div *ngIf="!loading && entityId &&
                  alerts.length > 0"
           class="bg-white rounded-xl shadow p-4 mb-6
                  flex items-center gap-6">
        <div class="text-center cursor-pointer"
             (click)="setLevel('HIGH')">
          <div class="text-2xl font-bold text-red-600">
            {{ highCount }}
          </div>
          <div class="text-xs text-gray-500">HIGH</div>
        </div>
        <div class="text-center cursor-pointer"
             (click)="setLevel('MEDIUM')">
          <div class="text-2xl font-bold text-yellow-600">
            {{ mediumCount }}
          </div>
          <div class="text-xs text-gray-500">MEDIUM</div>
        </div>
        <div class="text-center cursor-pointer"
             (click)="setLevel('LOW')">
          <div class="text-2xl font-bold text-green-600">
            {{ lowCount }}
          </div>
          <div class="text-xs text-gray-500">LOW</div>
        </div>
        <div class="text-center cursor-pointer"
             (click)="setLevel(null)">
          <div class="text-2xl font-bold text-indigo-600">
            {{ alerts.length }}
          </div>
          <div class="text-xs text-gray-500">TOTAL</div>
        </div>
        <div class="flex-1">
          <div class="text-xs text-gray-500 mb-1">
            Progresie risc:
          </div>
          <div class="flex h-3 rounded-full overflow-hidden">
            <div *ngFor="let a of alerts"
                 [class]="getProgressClass(a.riskLevel)"
                 [style.width.%]="100 / alerts.length"
                 [title]="a.timestampIso + ' — ' +
                          a.finalRisk">
            </div>
          </div>
        </div>
        <div class="text-right text-xs text-gray-400
                    flex-shrink-0">
          <div>Ultima actualizare</div>
          <div class="font-mono font-medium text-gray-600">
            {{ lastUpdated | date:'HH:mm:ss' }}
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="space-y-2"
           *ngIf="!loading && entityId &&
                  filteredAlerts.length > 0">
        <div *ngFor="let alert of filteredAlerts;
                     let i = index"
             class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center
                        justify-center text-sm border-2
                        flex-shrink-0"
                 [class]="getDotClass(alert.riskLevel)">
              {{ getRiskIcon(alert.riskLevel) }}
            </div>
            <div class="w-0.5 flex-1 bg-gray-200 my-1"
                 *ngIf="i < filteredAlerts.length - 1">
            </div>
          </div>

          <!-- Card alertă — click deschide în tab nou -->
          <div class="flex-1 bg-white rounded-xl shadow p-4
                      mb-2 cursor-pointer hover:shadow-md
                      transition-shadow"
               (click)="openDetail(alert)">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-mono text-sm font-semibold
                           text-gray-700">
                {{ alert.timestampIso | date:'HH:mm:ss' }}
              </span>
              <span class="px-2 py-0.5 rounded text-xs"
                    [class]="getCategoryClass(
                                alert.logCategory)">
                {{ alert.logCategory }}
              </span>
              <span class="text-gray-300 text-xs ml-1"
                    title="Se deschide în tab nou">
                ↗
              </span>
              <span class="ml-auto font-bold text-sm"
                    [class]="getRiskTextClass(
                                alert.riskLevel)">
                {{ alert.finalRisk | number:'1.3-3' }}
              </span>
            </div>
            <div class="font-mono text-xs text-gray-500
                        truncate mb-2">
              {{ alert.rawLog }}
            </div>
            <div class="flex flex-wrap gap-1 mb-2"
                 *ngIf="(alert.rulesFired || []).length > 0">
              <span *ngFor="let rule of
                            (alert.rulesFired || [])"
                    class="px-2 py-0.5 bg-indigo-50
                           text-indigo-700 rounded text-xs">
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

      <!-- Empty state — nicio alertă după filtrare -->
      <div *ngIf="!loading && entityId &&
                  alerts.length > 0 &&
                  filteredAlerts.length === 0"
           class="text-center py-12 text-gray-400
                  bg-white rounded-xl shadow">
        <div class="text-3xl mb-2">🔍</div>
        <p>Nicio alertă
          <strong>{{ activeLevel }}</strong>
          pentru <strong>{{ entityId }}</strong>
        </p>
        <button (click)="setLevel(null)"
                class="mt-3 text-xs text-indigo-600
                       hover:underline">
          Afișează toate
        </button>
      </div>

      <!-- Empty state — nicio alertă deloc -->
      <div *ngIf="!loading && entityId &&
                  alerts.length === 0 && hasLoaded"
           class="text-center py-16 text-gray-400
                  bg-white rounded-xl shadow">
        <div class="text-4xl mb-3">📈</div>
        <p>Nicio alertă pentru
          <strong>{{ entityId }}</strong>
          în intervalul selectat
        </p>
        <button (click)="windowMinutes = 999999;
                         loadHistory()"
                class="mt-3 text-xs text-indigo-600
                       hover:underline">
          Încearcă cu toate intervalele
        </button>
      </div>

    </div>
  `
})
export class EntityTimelineComponent
    implements OnInit, OnDestroy {

  entityId        = '';
  alerts:           Alert[] = [];
  filteredAlerts:   Alert[] = [];
  windowMinutes     = 10080;
  activeLevel:      string | null = null;
  loading           = false;
  hasLoaded         = false;
  lastUpdated:      Date | null = null;

  private destroy$      = new Subject<void>();
  private subscription?: Subscription;

  get highCount() {
    return this.alerts.filter(
      a => a.riskLevel === 'HIGH').length;
  }
  get mediumCount() {
    return this.alerts.filter(
      a => a.riskLevel === 'MEDIUM').length;
  }
  get lowCount() {
    return this.alerts.filter(
      a => a.riskLevel === 'LOW').length;
  }

  constructor(
    private route:        ActivatedRoute,
    public  router:       Router,
    private alertService: AlertService,
    private cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap
        .get('entityId');
    if (id) {
      this.entityId = id;
      // NU încarcă automat la init
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEntityChange(): void {
    this.alerts         = [];
    this.filteredAlerts = [];
    this.hasLoaded      = false;
  }

 loadHistory(): void {
  if (!this.entityId) return;

  if (this.subscription) {
    this.subscription.unsubscribe();
  }

  this.loading = true;
  this.alerts  = [];
  this.cdr.detectChanges(); // ← forțezi update imediat

  this.subscription = this.alertService
    .getEntityHistory(
      this.entityId,
      Number(this.windowMinutes))
    .subscribe({
      next: alerts => {
        this.alerts      = alerts;
        this.lastUpdated = new Date();
        this.hasLoaded   = true;
        this.applyFilter();
        this.loading     = false;
        this.cdr.detectChanges(); // ← forțezi update după date
      },
      error: err => {
        console.error('Eroare GraphQL:', err);
        this.loading   = false;
        this.hasLoaded = true;
        this.cdr.detectChanges(); // ← forțezi update la eroare
      }
    });
}

  setLevel(level: string | null): void {
    this.activeLevel = level;
    this.applyFilter();
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

  openDetail(alert: Alert): void {
    window.open(`/alert/${alert.eventId}`, '_blank');
  }

  getRiskIcon(level: string): string {
    return level === 'HIGH'   ? '🔴'
         : level === 'MEDIUM' ? '🟡'
         : '🟢';
  }

  getRiskTextClass(level: string): string {
    if (level === 'HIGH')   return 'text-red-600';
    if (level === 'MEDIUM') return 'text-yellow-600';
    return 'text-green-600';
  }

  getDotClass(level: string): string {
    if (level === 'HIGH')
      return 'bg-red-50 border-red-400';
    if (level === 'MEDIUM')
      return 'bg-yellow-50 border-yellow-400';
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
    return map[category] ||
           'bg-gray-100 text-gray-700';
  }
}