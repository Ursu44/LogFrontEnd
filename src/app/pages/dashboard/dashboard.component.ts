import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardStats } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>

        <div class="flex items-center gap-4">

          <select [(ngModel)]="windowMinutes"
                  (ngModelChange)="onWindowChange()"
                  class="px-3 py-2 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:border-indigo-500">
            <option [value]="15">Ultimele 15 min</option>
            <option [value]="30">Ultimele 30 min</option>
            <option [value]="60">Ultima oră</option>
            <option [value]="360">Ultimele 6h</option>
            <option [value]="1440">Ultimele 24h</option>
            <option [value]="10080">Ultima săptămână</option>
            <option [value]="999999">Toate</option>
          </select>

          <button (click)="reload()"
                  [disabled]="loading"
                  class="px-3 py-2 border border-gray-300 rounded-lg
                         hover:bg-gray-100 transition-colors text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? '⏳ Se încarcă...' : '🔄 Reîncarcă' }}
          </button>

          <!-- Timestamp ultima actualizare -->
          <span *ngIf="lastUpdated" class="text-xs text-gray-400">
            Actualizat: {{ lastUpdated | date:'HH:mm:ss' }}
          </span>

        </div>
      </div>

      <!-- Loading bar -->
      <div *ngIf="loading"
           class="w-full h-1 bg-indigo-200 rounded mb-4 overflow-hidden">
        <div class="h-full bg-indigo-600 animate-pulse w-full"></div>
      </div>

      <ng-container *ngIf="stats && !loading; else loadingTpl">

        <!-- KPI Cards -->
        <div class="grid grid-cols-4 gap-4 mb-6">

          <div class="bg-white rounded-xl shadow p-5 text-center">
            <div class="text-3xl font-bold text-indigo-600">
              {{ stats.totalAlerts }}
            </div>
            <div class="text-sm text-gray-500 mt-1">Total Alerte</div>
          </div>

          <div class="bg-white rounded-xl shadow p-5 text-center
                      cursor-pointer hover:shadow-md transition-shadow"
               (click)="goToFeed()">
            <div class="text-3xl font-bold text-red-600">
              {{ stats.highCount }}
            </div>
            <div class="text-xs text-red-400 font-medium mt-1">
              {{ getPercent(stats.highCount, stats.totalAlerts) }}% din total
            </div>
            <div class="text-sm text-gray-500 mt-1">🔴 HIGH</div>
          </div>

          <div class="bg-white rounded-xl shadow p-5 text-center
                      cursor-pointer hover:shadow-md transition-shadow"
               (click)="goToFeed()">
            <div class="text-3xl font-bold text-yellow-600">
              {{ stats.mediumCount }}
            </div>
            <div class="text-xs text-yellow-400 font-medium mt-1">
              {{ getPercent(stats.mediumCount, stats.totalAlerts) }}% din total
            </div>
            <div class="text-sm text-gray-500 mt-1">🟡 MEDIUM</div>
          </div>

          <div class="bg-white rounded-xl shadow p-5 text-center
                      cursor-pointer hover:shadow-md transition-shadow"
               (click)="goToFeed()">
            <div class="text-3xl font-bold text-green-600">
              {{ stats.lowCount }}
            </div>
            <div class="text-xs text-green-400 font-medium mt-1">
              {{ getPercent(stats.lowCount, stats.totalAlerts) }}% din total
            </div>
            <div class="text-sm text-gray-500 mt-1">🟢 LOW</div>
          </div>

        </div>

        <!-- Distribuție vizuală -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Distribuție Risk Level
          </h2>

          <!-- HIGH -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-red-600 font-medium">🔴 HIGH</span>
              <span class="text-gray-500">
                {{ stats.highCount }}
                <span class="text-red-500 font-semibold ml-1">
                  ({{ getPercent(stats.highCount, stats.totalAlerts) }}%)
                </span>
              </span>
            </div>
            <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full transition-all duration-500
                          flex items-center justify-end pr-2"
                   [style.width.%]="getPercent(stats.highCount, stats.totalAlerts)">
                <span class="text-white text-xs font-bold"
                      *ngIf="getPercent(stats.highCount, stats.totalAlerts) > 10">
                  {{ getPercent(stats.highCount, stats.totalAlerts) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- MEDIUM -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-yellow-600 font-medium">🟡 MEDIUM</span>
              <span class="text-gray-500">
                {{ stats.mediumCount }}
                <span class="text-yellow-500 font-semibold ml-1">
                  ({{ getPercent(stats.mediumCount, stats.totalAlerts) }}%)
                </span>
              </span>
            </div>
            <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-yellow-500 rounded-full transition-all duration-500
                          flex items-center justify-end pr-2"
                   [style.width.%]="getPercent(stats.mediumCount, stats.totalAlerts)">
                <span class="text-white text-xs font-bold"
                      *ngIf="getPercent(stats.mediumCount, stats.totalAlerts) > 10">
                  {{ getPercent(stats.mediumCount, stats.totalAlerts) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- LOW -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-green-600 font-medium">🟢 LOW</span>
              <span class="text-gray-500">
                {{ stats.lowCount }}
                <span class="text-green-500 font-semibold ml-1">
                  ({{ getPercent(stats.lowCount, stats.totalAlerts) }}%)
                </span>
              </span>
            </div>
            <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all duration-500
                          flex items-center justify-end pr-2"
                   [style.width.%]="getPercent(stats.lowCount, stats.totalAlerts)">
                <span class="text-white text-xs font-bold"
                      *ngIf="getPercent(stats.lowCount, stats.totalAlerts) > 10">
                  {{ getPercent(stats.lowCount, stats.totalAlerts) }}%
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Interval real -->
        <div class="text-center text-xs text-gray-400 mt-1"
             *ngIf="stats.oldestAlert">
          Interval real:
          {{ stats.oldestAlert | date:'dd/MM/yy HH:mm' }}
          →
          {{ stats.newestAlert | date:'dd/MM/yy HH:mm' }}
        </div>

        <!-- Avertisment fără date -->
        <div class="text-center text-xs text-orange-400 mt-2"
             *ngIf="stats.totalAlerts === 0">
          ⚠️ Nu există date în intervalul selectat.
          Încearcă un interval mai mare sau selectează "Toate".
        </div>

      </ng-container>

      <!-- Loading template -->
      <ng-template #loadingTpl>
        <div class="text-center py-20 text-gray-400">
          <div class="text-4xl mb-3">⏳</div>
          <p>Se încarcă statisticile...</p>
        </div>
      </ng-template>

    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats: DashboardStats | null = null;
  windowMinutes = 999999;
  loading = false;
  lastUpdated: Date | null = null;

  constructor(
    private alertService: AlertService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  onWindowChange(): void {
    this.stats = null;
    this.loadStats();
  }

  reload(): void {
    this.stats = null;
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.alertService.getDashboardStats(Number(this.windowMinutes))
      .subscribe({
        next: stats => {
          this.stats = stats;
          this.lastUpdated = new Date();
          setTimeout(() => {
            this.loading = false;
            this.cdr.detectChanges();
          }, 300);
        },
        error: err => {
          console.error('Eroare stats:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getPercent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  goToFeed(): void {
    this.router.navigate(['/live']);
  }

  ngOnDestroy(): void {}
}