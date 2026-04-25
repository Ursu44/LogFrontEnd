import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Alert } from '../../core/models/alert.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto" *ngIf="alertData; else loading">

      <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button (click)="goBack()"
                class="hover:text-indigo-600 transition-colors">
          ← Înapoi
        </button>
        <span>/</span>
        <span>Alert Detail</span>
        <span>/</span>
        <span class="font-mono text-xs text-gray-400">
          {{ alertData.eventId }}
        </span>
      </div>

      <!-- Header -->
      <div class="rounded-xl p-5 mb-6"
           [class]="getHeaderClass(alertData.riskLevel)">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">{{ getRiskIcon(alertData.riskLevel) }}</span>
          <span class="text-xl font-bold">{{ alertData.riskLevel }}</span>
          <span class="text-xl text-gray-700">{{ alertData.entityId }}</span>
          <span *ngIf="alertData.ruleShortcut"
                class="ml-auto px-3 py-1 bg-orange-100 text-orange-700
                       rounded-full text-sm font-semibold">
            ⚡ RULE SHORTCUT
          </span>
        </div>
        <div class="flex gap-4 text-sm text-gray-600">
          <span>📁 {{ alertData.logCategory }}</span>
          <span>🕐 {{ alertData.timestampIso | date:'dd/MM/yyyy HH:mm:ss' }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">

        <!-- Raw Log -->
        <div class="col-span-2 bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">Raw Log</h3>
          <div class="font-mono text-sm bg-gray-50 p-3 rounded-lg
                      break-all text-gray-700">
            {{ alertData.rawLog }}
          </div>
          <button (click)="copyLog()"
                  class="mt-2 px-3 py-1 text-sm border border-gray-300
                         rounded hover:bg-gray-100 transition-colors">
            📋 Copy
          </button>
        </div>

        <!-- Rule Engine -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">Rule Engine</h3>
          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">Score</span>
              <span class="font-mono font-semibold">
                {{ alertData.ruleScore | number:'1.3-3' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Triggered</span>
              <span>{{ alertData.ruleTriggered ? '✅' : '❌' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Shortcut</span>
              <span>{{ alertData.ruleShortcut ? '⚡ Da' : 'Nu' }}</span>
            </div>
          </div>
          <div class="border-t pt-3">
            <p class="text-xs text-gray-500 mb-2">Reguli active:</p>
            <div class="flex flex-wrap gap-1">
              <span *ngFor="let rule of (alertData.rulesFired || [])"
                    class="px-2 py-1 bg-indigo-50 text-indigo-700
                           rounded text-xs">
                {{ rule }}
              </span>
              <span *ngIf="!(alertData.rulesFired || []).length"
                    class="text-xs text-gray-400 italic">
                Nicio regulă activată
              </span>
            </div>
          </div>
        </div>

        <!-- Score Breakdown -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">Score Breakdown</h3>
          <div class="space-y-3">
            <div *ngFor="let item of getScoreItems()">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">{{ item.label }}</span>
                <span class="font-mono text-xs">
                  {{ item.value !== null
                     ? (item.value | number:'1.3-3')
                     : 'N/A' }}
                </span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all"
                     [class]="item.colorClass"
                     [style.width.%]="(item.value || 0) * 100">
                </div>
              </div>
            </div>
            <div class="border-t pt-3">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-semibold">Final Risk</span>
                <span class="font-mono font-bold"
                      [class]="getRiskTextClass(alertData.riskLevel)">
                  {{ alertData.finalRisk | number:'1.3-3' }}
                </span>
              </div>
              <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full"
                     [class]="getScoreBarClass(alertData.riskLevel)"
                     [style.width.%]="alertData.finalRisk * 100">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Entity Context -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">
            Context Entitate (5 min)
          </h3>
          <div class="grid grid-cols-2 gap-3"
               *ngIf="alertData.entityContext">
            <div class="text-center p-3 rounded-lg"
                 [class]="alertData.entityContext.failedAuth >= 5
                   ? 'bg-red-50' : 'bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.failedAuth >= 5
                     ? 'text-red-600' : 'text-gray-700'">
                {{ alertData.entityContext.failedAuth }}
              </div>
              <div class="text-xs text-gray-500">Failed Auth</div>
            </div>
            <div class="text-center p-3 rounded-lg"
                 [class]="alertData.entityContext.sudoCount >= 6
                   ? 'bg-red-50' : 'bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.sudoCount >= 6
                     ? 'text-red-600' : 'text-gray-700'">
                {{ alertData.entityContext.sudoCount }}
              </div>
              <div class="text-xs text-gray-500">Sudo</div>
            </div>
            <div class="text-center p-3 rounded-lg"
                 [class]="alertData.entityContext.uploads >= 2
                   ? 'bg-red-50' : 'bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.uploads >= 2
                     ? 'text-red-600' : 'text-gray-700'">
                {{ alertData.entityContext.uploads }}
              </div>
              <div class="text-xs text-gray-500">Uploads</div>
            </div>
            <div class="text-center p-3 rounded-lg"
                 [class]="alertData.entityContext.lsass >= 1
                   ? 'bg-red-50' : 'bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.lsass >= 1
                     ? 'text-red-600' : 'text-gray-700'">
                {{ alertData.entityContext.lsass }}
              </div>
              <div class="text-xs text-gray-500">Lsass</div>
            </div>
          </div>
          <button (click)="goToTimeline()"
                  class="mt-4 w-full px-4 py-2 border border-indigo-300
                         text-indigo-600 rounded-lg hover:bg-indigo-50
                         transition-colors text-sm">
            📈 Vezi Entity Timeline
          </button>
        </div>

        <!-- IF Scores -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">
            Isolation Forest Scores
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Stat Score</span>
              <span class="font-mono">
                {{ alertData.statScore !== null
                   ? (alertData.statScore | number:'1.3-3')
                   : 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Behavior Score</span>
              <span class="font-mono">
                {{ alertData.behaviorScore !== null
                   ? (alertData.behaviorScore | number:'1.3-3')
                   : 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Category Score</span>
              <span class="font-mono">
                {{ alertData.catScore !== null
                   ? (alertData.catScore | number:'1.3-3')
                   : 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Rarity</span>
              <span class="font-mono">
                {{ alertData.rarity | number:'1.3-3' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Burst</span>
              <span class="font-mono">
                {{ alertData.burst | number:'1.3-3' }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <ng-template #loading>
      <div class="text-center py-20 text-gray-400">
        <div class="text-4xl mb-3">⏳</div>
        <p>Se încarcă detaliile alertei...</p>
      </div>
    </ng-template>
  `
})
export class AlertDetailComponent implements OnInit {

  alertData: Alert | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    console.log('eventId:', eventId);
    if (eventId) {
      this.alertService.getAlert(eventId).subscribe({
        next: alert => {
          console.log('Alert primit:', alert);
          this.alertData = alert;
          this.cdr.detectChanges();
        },
        error: err => console.error('Eroare:', err)
      });
    }
  }

  getScoreItems() {
    if (!this.alertData?.scoreBreakdown) return [];
    return [
      {
        label: 'Rule Engine',
        value: this.alertData.scoreBreakdown.ruleEngine,
        colorClass: 'bg-red-400'
      },
      {
        label: 'Isolation Forest',
        value: this.alertData.scoreBreakdown.isolationForest,
        colorClass: 'bg-orange-400'
      },
      {
        label: 'Random Forest',
        value: this.alertData.scoreBreakdown.randomForest,
        colorClass: 'bg-blue-400'
      },
      {
        label: 'LSTM',
        value: this.alertData.scoreBreakdown.lstm,
        colorClass: 'bg-purple-400'
      },
    ];
  }

  getRiskIcon(level: string): string {
    return level === 'HIGH' ? '🔴' : level === 'MEDIUM' ? '🟡' : '🟢';
  }

  getHeaderClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-50 border-l-4 border-red-400';
    if (level === 'MEDIUM') return 'bg-yellow-50 border-l-4 border-yellow-400';
    return 'bg-green-50 border-l-4 border-green-400';
  }

  getRiskTextClass(level: string): string {
    if (level === 'HIGH')   return 'text-red-600';
    if (level === 'MEDIUM') return 'text-yellow-600';
    return 'text-green-600';
  }

  getScoreBarClass(level: string): string {
    if (level === 'HIGH')   return 'bg-red-500';
    if (level === 'MEDIUM') return 'bg-yellow-500';
    return 'bg-green-500';
  }

  copyLog(): void {
    navigator.clipboard.writeText(this.alertData?.rawLog || '');
  }

  goToTimeline(): void {
    this.router.navigate(['/entity', this.alertData?.entityId]);
  }

  goBack(): void {
    this.router.navigate(['/live']);
  }
}