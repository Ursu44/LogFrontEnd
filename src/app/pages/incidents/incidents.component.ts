import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from '../../core/services/alert.service';
import { Incident } from '../../core/models/alert.model';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          🔗 Incidente Corelate
        </h1>
        <div class="flex gap-2">
          <select [(ngModel)]="filterSeverity"
                  (ngModelChange)="applyFilter()"
                  class="px-3 py-2 border border-gray-300 rounded-lg
                         text-sm focus:outline-none focus:border-indigo-500">
            <option value="">Toate severitățile</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>
          <button (click)="loadIncidents()"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg
                         text-sm hover:bg-indigo-700 transition-colors">
            🔄 Reîncarcă
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading"
           class="w-full h-1 bg-indigo-200 rounded mb-4 overflow-hidden">
        <div class="h-full bg-indigo-600 animate-pulse w-full"></div>
      </div>

      <!-- Lista incidente -->
      <div class="space-y-4" *ngIf="!loading">
        <div *ngFor="let incident of filteredIncidents"
             (click)="openIncident(incident)"
             class="bg-white rounded-xl shadow p-5 border-l-4 cursor-pointer
                    hover:shadow-md transition-all"
             [class]="getSeverityBorder(incident.severity)">

          <div class="flex items-start justify-between">

            <!-- Stânga -->
            <div class="flex items-center gap-3">
              <span class="text-2xl">
                {{ getSeverityIcon(incident.severity) }}
              </span>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-gray-800 text-lg">
                    {{ incident.entityId }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-xs font-bold"
                        [class]="getSeverityClass(incident.severity)">
                    {{ incident.severity }}
                  </span>
                  <span *ngIf="incident.multiStage"
                        class="px-2 py-0.5 bg-purple-100 text-purple-700
                               rounded text-xs font-bold">
                    🔗 Multi-stage
                  </span>
                </div>

                <!-- Pattern APT -->
                <div *ngIf="incident.aptPattern"
                     class="text-sm font-semibold text-red-700 mb-1">
                  ⚔️ {{ incident.aptPattern }}
                </div>

                <!-- Tipuri atac -->
                <div class="flex flex-wrap gap-1 mb-2">
                  <span *ngFor="let at of incident.attackTypes.slice(0, 3)"
                        class="px-2 py-0.5 bg-red-50 text-red-700
                               rounded text-xs">
                    {{ at }}
                  </span>
                  <span *ngIf="incident.attackTypes.length > 3"
                        class="px-2 py-0.5 bg-gray-100 text-gray-500
                               rounded text-xs">
                    +{{ incident.attackTypes.length - 3 }}
                  </span>
                </div>

                <!-- Root cause scurt -->
                <div class="text-xs text-gray-500 max-w-xl">
                  🎯 {{ incident.rootCause | slice:0:120 }}...
                </div>
              </div>
            </div>

            <!-- Dreapta — statistici -->
            <div class="text-right space-y-1 flex-shrink-0">
              <div class="text-xs text-gray-400 font-mono">
                {{ incident.createdAt | date:'dd/MM/yy HH:mm' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ incident.totalEvents }} evenimente
                ({{ incident.durationSec }}s)
              </div>
              <div class="text-xs font-mono font-bold"
                   [class]="getPeakColor(incident.peakScore)">
                Peak: {{ incident.peakScore | number:'1.3-3' }}
              </div>
              <div class="text-xs">
                <span class="text-gray-400">Confidence: </span>
                <span class="font-semibold"
                      [class]="getConfidenceColor(incident.avgConfidence)">
                  {{ (incident.avgConfidence * 100 | number:'1.0-0') }}%
                </span>
              </div>
              <div class="text-xs text-gray-400">
                → {{ incident.incidentId.slice(0, 8) }}
              </div>
            </div>

          </div>

        </div>

        <div *ngIf="filteredIncidents.length === 0"
             class="text-center py-16 text-gray-400 bg-white rounded-xl shadow">
          <div class="text-4xl mb-3">🔍</div>
          <p>Niciun incident găsit</p>
        </div>
      </div>

    </div>
  `
})
export class IncidentsComponent implements OnInit, OnDestroy {

  incidents:         Incident[] = [];
  filteredIncidents: Incident[] = [];
  filterSeverity   = '';
  loading          = true;
  private subs:      Subscription[] = [];

  constructor(
    public  router:       Router,
    private alertService: AlertService,
    private cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadIncidents();
    this.subscribeToNewIncidents();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadIncidents(): void {
    this.loading = true;
    const sub = this.alertService.getRecentIncidents().subscribe({
      next: incidents => {
        this.incidents         = incidents;
        this.filteredIncidents = incidents;
        this.loading           = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    this.subs.push(sub);
  }

  private subscribeToNewIncidents(): void {
    const sub = this.alertService.subscribeToIncidents().subscribe({
      next: incident => {
        this.incidents = [incident, ...this.incidents].slice(0, 50);
        this.applyFilter();
        this.cdr.detectChanges();
      }
    });
    this.subs.push(sub);
  }

  applyFilter(): void {
    if (!this.filterSeverity) {
      this.filteredIncidents = this.incidents;
    } else {
      this.filteredIncidents = this.incidents.filter(
        i => i.severity === this.filterSeverity
      );
    }
  }

  openIncident(incident: Incident): void {
    window.open(`/incident/${incident.incidentId}`, '_blank');
  }

  getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      'CRITICAL': '🔴', 'HIGH': '🟠',
      'MEDIUM':   '🟡', 'LOW':  '🟢'
    };
    return icons[severity] || '⚪';
  }

  getSeverityClass(severity: string): string {
    const classes: Record<string, string> = {
      'CRITICAL': 'bg-red-100 text-red-800',
      'HIGH':     'bg-orange-100 text-orange-800',
      'MEDIUM':   'bg-yellow-100 text-yellow-800',
      'LOW':      'bg-green-100 text-green-800'
    };
    return classes[severity] || 'bg-gray-100 text-gray-800';
  }

  getSeverityBorder(severity: string): string {
    const classes: Record<string, string> = {
      'CRITICAL': 'border-red-500',
      'HIGH':     'border-orange-500',
      'MEDIUM':   'border-yellow-500',
      'LOW':      'border-green-500'
    };
    return classes[severity] || 'border-gray-300';
  }

  getPeakColor(score: number): string {
    if (score >= 0.9) return 'text-red-600';
    if (score >= 0.7) return 'text-orange-600';
    return 'text-yellow-600';
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  }
}