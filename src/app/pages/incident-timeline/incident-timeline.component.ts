import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertService } from '../../core/services/alert.service';
import { Incident, TimelineEvent } from '../../core/models/alert.model';

@Component({
  selector: 'app-incident-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button (click)="router.navigate(['/incidents'])"
                class="hover:text-indigo-600 transition-colors text-gray-500">
          ← Incidents
        </button>
        <span class="text-gray-300">/</span>
        <h1 class="text-2xl font-bold text-gray-800">
          Timeline Incident
        </h1>
        <span *ngIf="incident"
              class="px-3 py-1 rounded-full text-sm font-bold"
              [class]="getSeverityClass(incident.severity)">
          {{ incident.severity }}
        </span>
      </div>

      <!-- Loading -->
      <div *ngIf="loading"
           class="text-center py-20 text-gray-400">
        <div class="text-4xl mb-3">⏳</div>
        <p>Se încarcă timeline-ul...</p>
      </div>

      <div *ngIf="!loading && incident">

        <!-- Card sumar incident -->
        <div class="bg-white rounded-xl shadow p-6 mb-6 border-l-4"
             [class]="getSeverityBorder(incident.severity)">
          <div class="grid grid-cols-2 gap-6">

            <!-- Stânga — info principale -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">{{ getSeverityIcon(incident.severity) }}</span>
                <div>
                  <div class="text-xl font-bold text-gray-800">
                    {{ incident.entityId }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ incident.startTime | date:'dd/MM/yyyy HH:mm:ss' }}
                    → {{ incident.endTime | date:'HH:mm:ss' }}
                    ({{ incident.durationSec }}s)
                  </div>
                </div>
              </div>

              <!-- Pattern APT -->
              <div *ngIf="incident.aptPattern"
                   class="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="text-xs font-semibold text-red-600 mb-1">
                  ⚔️ Pattern APT detectat
                </div>
                <div class="text-sm font-bold text-red-800">
                  {{ incident.aptPattern }}
                </div>
              </div>

              <!-- Root Cause -->
              <div class="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div class="text-xs font-semibold text-orange-600 mb-1">
                  🎯 Root Cause (DFRWS Q4)
                </div>
                <div class="text-sm text-orange-800">
                  {{ incident.rootCause }}
                </div>
                <div class="text-xs text-orange-500 mt-1">
                  Confidence: {{ (incident.rootCauseConfidence * 100 | number:'1.0-0') }}%
                </div>
              </div>

              <!-- Tipuri atac -->
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let at of (incident.attackTypes || [])"
                      class="px-2 py-1 bg-red-100 text-red-700
                             rounded text-xs font-medium">
                  {{ at }}
                </span>
              </div>
            </div>

            <!-- Dreapta — statistici + confidence -->
            <div class="space-y-4">

              <!-- Statistici evenimente -->
              <div class="grid grid-cols-3 gap-3">
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-2xl font-bold text-gray-700">
                    {{ incident.totalEvents }}
                  </div>
                  <div class="text-xs text-gray-500">Total</div>
                </div>
                <div class="text-center p-3 bg-red-50 rounded-lg">
                  <div class="text-2xl font-bold text-red-600">
                    {{ incident.highEvents }}
                  </div>
                  <div class="text-xs text-red-500">HIGH</div>
                </div>
                <div class="text-center p-3 bg-yellow-50 rounded-lg">
                  <div class="text-2xl font-bold text-yellow-600">
                    {{ incident.mediumEvents }}
                  </div>
                  <div class="text-xs text-yellow-500">MEDIUM</div>
                </div>
              </div>

              <!-- Confidence (DFRWS Q3) -->
              <div class="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div class="text-xs font-semibold text-indigo-600 mb-2">
                  🔬 Confidence (DFRWS Q3 — Uncertainty)
                </div>
                <div class="space-y-2">
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-gray-600">Medie incident</span>
                      <span class="font-mono font-bold"
                            [class]="getConfidenceColor(incident.avgConfidence)">
                        {{ (incident.avgConfidence * 100 | number:'1.0-0') }}%
                      </span>
                    </div>
                    <div class="w-full h-2 bg-gray-200 rounded-full">
                      <div class="h-full rounded-full transition-all"
                           [class]="getConfidenceBarClass(incident.avgConfidence)"
                           [style.width.%]="incident.avgConfidence * 100">
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">
                      Incertitudine globală:
                    </span>
                    <span class="font-mono font-semibold text-orange-600">
                      {{ (incident.globalUncertainty * 100 | number:'1.0-0') }}%
                    </span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Peak score:</span>
                    <span class="font-mono font-semibold"
                          [class]="getRiskTextClass(incident.peakScore)">
                      {{ incident.peakScore | number:'1.3-3' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- MITRE Tactics -->
              <div>
                <div class="text-xs font-semibold text-gray-600 mb-2">
                  🛡️ MITRE ATT&CK
                </div>
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let tactic of (incident.mitreTactics || [])"
                        class="px-2 py-0.5 bg-gray-100 text-gray-600
                               rounded text-xs font-mono">
                    {{ tactic }}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Timeline vizual -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <h2 class="text-lg font-bold text-gray-800 mb-6">
            📅 Cronologie evenimente (DFRWS TER-Model Q2+Q3)
          </h2>

          <div class="relative">

            <!-- Linia verticală -->
            <div class="absolute left-8 top-0 bottom-0 w-0.5
                        bg-gray-200 z-0">
            </div>

            <div class="space-y-3">
              <div *ngFor="let ev of timeline; let i = index"
                   class="relative flex gap-4">

                <!-- Indicator pe linie -->
                <div class="relative z-10 flex-shrink-0">
                  <div class="w-16 h-16 rounded-full border-4 flex items-center
                              justify-center text-lg font-bold shadow-sm"
                       [class]="getEventCircleClass(ev)">
                    {{ ev.step }}
                  </div>
                  <!-- Badge confidence -->
                  <div class="absolute -bottom-1 -right-1 px-1.5 py-0.5
                              rounded text-xs font-bold shadow"
                       [class]="getConfidenceBadgeClass(ev.confidenceLabel)">
                    {{ ev.confidenceLabel }}
                  </div>
                </div>

                <!-- Conținut eveniment -->
                <div class="flex-1 pb-4">

                  <!-- Indicator tranziție -->
                  <div *ngIf="ev.transition"
                       class="mb-1 text-xs font-bold"
                       [class]="getTransitionClass(ev.transition)">
                    {{ getTransitionLabel(ev.transition) }}
                  </div>

                  <div class="p-3 rounded-lg border-l-4 shadow-sm"
                       [class]="getEventCardClass(ev)">

                    <!-- Header eveniment -->
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold"
                              [class]="getRiskTextClass(ev.finalRisk)">
                          {{ ev.riskLevel }}
                        </span>
                        <span class="px-2 py-0.5 bg-blue-100 text-blue-700
                                     rounded text-xs">
                          {{ ev.logCategory }}
                        </span>
                        <span *ngIf="ev.ruleShortcut"
                              class="px-2 py-0.5 bg-red-100 text-red-700
                                     rounded text-xs font-bold">
                          ⚡ SHORTCUT
                        </span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="font-mono text-xs text-gray-400">
                          {{ ev.timestampIso | date:'HH:mm:ss' }}
                        </span>
                        <span class="font-mono text-sm font-bold"
                              [class]="getRiskTextClass(ev.finalRisk)">
                          {{ ev.finalRisk | number:'1.3-3' }}
                        </span>
                      </div>
                    </div>

                    <!-- Cauza nota -->
                    <div *ngIf="ev.causeNote"
                         class="mb-2 text-sm font-semibold text-gray-700">
                      {{ ev.causeNote }}
                    </div>

                    <!-- Log raw -->
                    <div class="font-mono text-xs text-gray-500 bg-gray-50
                                rounded p-2 mb-2 break-all">
                      {{ ev.rawLog }}
                    </div>

                    <!-- Reguli + Scoruri ML -->
                    <div class="flex items-center justify-between">
                      <div class="flex flex-wrap gap-1">
                        <span *ngFor="let rule of ev.rulesFired"
                              class="px-2 py-0.5 bg-indigo-50 text-indigo-700
                                     rounded text-xs">
                          {{ rule }}
                        </span>
                        <span *ngIf="!ev.rulesFired.length"
                              class="text-xs text-gray-400">
                          🤖 ML Detection
                        </span>
                      </div>
                      <div class="flex gap-3 text-xs font-mono text-gray-500">
                        <span *ngIf="ev.rfScore !== null && ev.rfScore !== undefined">
                          RF={{ (ev.rfScore * 100 | number:'1.0-0') }}%
                        </span>
                        <span *ngIf="ev.lstmScore !== null && ev.lstmScore !== undefined">
                          LSTM={{ (ev.lstmScore * 100 | number:'1.0-0') }}%
                        </span>
                        <span *ngIf="ev.scoreDelta > 0.1"
                              class="text-red-500">
                          ↑{{ ev.scoreDelta | number:'1.2-2' }}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- No data -->
      <div *ngIf="!loading && !incident"
           class="text-center py-20 text-gray-400">
        <div class="text-4xl mb-3">🔍</div>
        <p>Incidentul nu a fost găsit</p>
      </div>

    </div>
  `
})
export class IncidentTimelineComponent implements OnInit, OnDestroy {

  incident:  Incident | null = null;
  timeline:  TimelineEvent[] = [];
  loading  = true;
  private subs: Subscription[] = [];

  constructor(
    private route:        ActivatedRoute,
    public  router:       Router,
    private alertService: AlertService,
    private cdr:          ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const incidentId = this.route.snapshot.paramMap.get('incidentId');
    if (incidentId) {
      this.loadIncident(incidentId);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadIncident(incidentId: string): void {
    const sub = this.alertService.getIncident(incidentId).subscribe({
      next: incident => {
        this.incident = incident;
        this.timeline = this.parseTimeline(incident.timelineJson);
        this.loading  = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Eroare la încărcarea incidentului:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    this.subs.push(sub);
  }
private parseTimeline(timelineJson: string): TimelineEvent[] {
  if (!timelineJson) return [];
  try {
    const events = JSON.parse(timelineJson) as any[];
    return events.map((ev: any, index: number) => ({
      step:            ev.step            ?? (index + 1),
      eventId:         ev.event_id        || ev.eventId        || '',
      timestamp:       ev.timestamp       || 0,
      timestampIso:    ev.timestamp_iso   || ev.timestampIso   || '',
      riskLevel:       ev.risk_level      || ev.riskLevel      || 'LOW',
      finalRisk:       ev.final_risk      ?? ev.finalRisk      ?? 0,
      logCategory:     ev.log_category    || ev.logCategory    || '',
      rawLog:          ev.raw_log         || ev.rawLog         || '',
      rulesFired:      ev.rules_fired     || ev.rulesFired     || [],
      ruleShortcut:    ev.rule_shortcut   ?? ev.ruleShortcut   ?? false,
      ruleTriggered:   ev.rule_triggered  ?? ev.ruleTriggered  ?? false,
      entityContext:   ev.entity_context  || ev.entityContext  || {
        failedAuth: 0, sudoCount: 0, uploads: 0, lsass: 0
      },
      transition:      ev.transition      || null,
      causeNote:       ev.cause_note      || ev.causeNote      || null,
      scoreDelta:      ev.score_delta     ?? ev.scoreDelta     ?? 0,
      statScore:       ev.stat_score      ?? ev.statScore      ?? null,
      behaviorScore:   ev.behavior_score  ?? ev.behaviorScore  ?? null,
      catScore:        ev.cat_score       ?? ev.catScore       ?? null,
      rfScore:         ev.rf_score        ?? ev.rfScore        ?? null,
      lstmScore:       ev.lstm_score      ?? ev.lstmScore      ?? null,
      confidence:      ev.confidence      ?? 0,
      confidenceLabel: ev.confidence_label || ev.confidenceLabel || 'UNCERTAIN',
    } as TimelineEvent));
  } catch {
    return [];
  }
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

  getEventCircleClass(ev: TimelineEvent): string {
    if (ev.ruleShortcut)
      return 'bg-red-100 border-red-500 text-red-700';
    if (ev.riskLevel === 'HIGH')
      return 'bg-orange-100 border-orange-400 text-orange-700';
    if (ev.riskLevel === 'MEDIUM')
      return 'bg-yellow-100 border-yellow-400 text-yellow-700';
    return 'bg-green-100 border-green-400 text-green-700';
  }

  getEventCardClass(ev: TimelineEvent): string {
    if (ev.ruleShortcut)
      return 'border-red-500 bg-red-50';
    if (ev.riskLevel === 'HIGH')
      return 'border-orange-400 bg-orange-50';
    if (ev.riskLevel === 'MEDIUM')
      return 'border-yellow-400 bg-yellow-50';
    return 'border-green-400 bg-green-50';
  }

  getTransitionLabel(transition: string): string {
    const labels: Record<string, string> = {
      'escalation_low_medium':  '⬆️ Escaladare LOW → MEDIUM',
      'escalation_low_high':    '⬆️⬆️ Escaladare bruscă LOW → HIGH',
      'escalation_medium_high': '⬆️ Escaladare MEDIUM → HIGH',
      'score_jump':             '📈 Salt semnificativ de scor'
    };
    return labels[transition] || transition;
  }

  getTransitionClass(transition: string): string {
    if (transition.includes('high'))   return 'text-red-600';
    if (transition.includes('medium')) return 'text-yellow-600';
    return 'text-blue-600';
  }

  getConfidenceBadgeClass(label: string): string {
    const classes: Record<string, string> = {
      'CERT':      'bg-green-500 text-white',
      'HIGH':      'bg-blue-500 text-white',
      'MEDIUM':    'bg-yellow-500 text-white',
      'LOW':       'bg-orange-400 text-white',
      'UNCERTAIN': 'bg-gray-400 text-white'
    };
    return classes[label] || 'bg-gray-300 text-gray-700';
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  }

  getConfidenceBarClass(confidence: number): string {
    if (confidence >= 0.7) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getRiskTextClass(value: number): string {
    if (value >= 0.8) return 'text-red-600';
    if (value >= 0.5) return 'text-yellow-600';
    return 'text-green-600';
  }
}