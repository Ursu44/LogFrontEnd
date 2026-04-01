import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
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

          <!-- Selector interval -->
          <select [(ngModel)]="windowMinutes"
                  (change)="loadStats()"
                  class="px-3 py-2 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:border-indigo-500">
            <option [value]="15">Ultimele 15 min</option>
            <option [value]="30">Ultimele 30 min</option>
            <option [value]="60">Ultima oră</option>
            <option [value]="360">Ultimele 6h</option>
          </select>

          <!-- Auto-refresh toggle -->
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox"
                   [(ngModel)]="autoRefresh"
                   (change)="toggleAutoRefresh()"
                   class="rounded">
            Auto-refresh 30s
          </label>

          <!-- Refresh manual -->
          <button (click)="loadStats()"
                  class="px-3 py-2 border border-gray-300 rounded-lg
                         hover:bg-gray-100 transition-colors text-sm">
            🔄 Reîncarcă
          </button>

        </div>
      </div>

      <ng-container *ngIf="stats; else loading">

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
               (click)="goToFeed('HIGH')">
            <div class="text-3xl font-bold text-red-600">
              {{ stats.highCount }}
            </div>
            <div class="text-sm text-gray-500 mt-1">🔴 HIGH</div>
          </div>

          <div class="bg-white rounded-xl shadow p-5 text-center
                      cursor-pointer hover:shadow-md transition-shadow"
               (click)="goToFeed('MEDIUM')">
            <div class="text-3xl font-bold text-yellow-600">
              {{ stats.mediumCount }}
            </div>
            <div class="text-sm text-gray-500 mt-1">🟡 MEDIUM</div>
          </div>

          <div class="bg-white rounded-xl shadow p-5 text-center
                      cursor-pointer hover:shadow-md transition-shadow"
               (click)="goToFeed('LOW')">
            <div class="text-3xl font-bold text-green-600">
              {{ stats.lowCount }}
            </div>
            <div class="text-sm text-gray-500 mt-1">🟢 LOW</div>
          </div>

        </div>

        <!-- Distribuție vizuală -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Distribuție Risk Level
          </h2>

          <!-- Bara progres HIGH -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-red-600 font-medium">🔴 HIGH</span>
              <span class="text-gray-500">{{ stats.highCount }}</span>
            </div>
            <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full transition-all duration-500"
                   [style.width.%]="getPercent(stats.highCount, stats.totalAlerts)">
              </div>
            </div>
          </div>

          <!-- Bara progres MEDIUM -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-yellow-600 font-medium">🟡 MEDIUM</span>
              <span class="text-gray-500">{{ stats.mediumCount }}</span>
            </div>
            <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-yellow-500 rounded-full transition-all duration-500"
                   [style.width.%]="getPercent(stats.mediumCount, stats.totalAlerts)">
              </div>
            </div>
          </div>

          <!-- Bara progres LOW -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-green-600 font-medium">🟢 LOW</span>
              <span class="text-gray-500">{{ stats.lowCount }}</span>
            </div>
            <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 rounded-full transition-all duration-500"
                   [style.width.%]="getPercent(stats.lowCount, stats.totalAlerts)">
              </div>
            </div>
          </div>

        </div>

        <!-- Info interval -->
        <div class="text-center text-sm text-gray-400">
          Date din ultimele {{ windowMinutes }} minute
          <span *ngIf="autoRefresh"> · Auto-refresh activ</span>
        </div>

      </ng-container>

      <!-- Loading -->
      <ng-template #loading>
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
  windowMinutes = 30;
  autoRefresh = true;

  private refreshSub?: Subscription;

  constructor(
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.toggleAutoRefresh();
  }

  loadStats(): void {
    this.alertService.getDashboardStats(this.windowMinutes)
      .subscribe(stats => this.stats = stats);
  }

  toggleAutoRefresh(): void {
    this.refreshSub?.unsubscribe();
    if (this.autoRefresh) {
      this.refreshSub = interval(30000)
        .pipe(switchMap(() =>
          this.alertService.getDashboardStats(this.windowMinutes)
        ))
        .subscribe(stats => this.stats = stats);
    }
  }

  getPercent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  goToFeed(riskLevel: string): void {
    this.router.navigate(['/live']);
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }
}