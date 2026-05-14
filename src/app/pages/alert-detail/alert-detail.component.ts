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
    <div class="p-6 max-w-5xl mx-auto" *ngIf="alertData; else loading">

      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span>Alert Detail</span>
        <span>/</span>
        <span class="font-mono text-xs text-gray-400">
          {{ alertData.eventId }}
        </span>
      </div>

      <!-- Header principal -->
      <div class="rounded-xl p-5 mb-6"
           [class]="getHeaderClass(alertData.riskLevel)">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ getRiskIcon(alertData.riskLevel) }}</span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-bold">{{ alertData.riskLevel }}</span>
                <span class="text-xl text-gray-700">—</span>
                <span class="text-xl font-semibold text-gray-700">
                  {{ alertData.entityId }}
                </span>
              </div>
              <div class="flex gap-4 text-sm text-gray-500 mt-1">
                <span>📁 {{ alertData.logCategory | uppercase }}</span>
                <span>🕐 {{ alertData.timestampIso | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                <span class="font-mono text-xs">
                  score: {{ alertData.finalRisk | number:'1.3-3' }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2 items-end">
            <span *ngIf="alertData.ruleShortcut"
                  class="px-3 py-1 bg-red-100 text-red-700
                         rounded-full text-sm font-semibold">
              ⚡ RULE SHORTCUT
            </span>
            <span *ngIf="!alertData.ruleShortcut && alertData.ruleTriggered"
                  class="px-3 py-1 bg-orange-100 text-orange-700
                         rounded-full text-sm font-semibold">
              ⚠️ Rule Engine + ML
            </span>
            <span *ngIf="!alertData.ruleTriggered"
                  class="px-3 py-1 bg-purple-100 text-purple-700
                         rounded-full text-sm font-semibold">
              🤖 ML Detection
            </span>
          </div>
        </div>
      </div>

      <!-- Secțiunea evaluare/acțiune -->
      <div class="bg-white rounded-xl shadow p-5 mb-4 border-l-4"
           [class]="alertData.riskLevel === 'HIGH'
             ? 'border-red-400'
             : alertData.riskLevel === 'MEDIUM'
             ? 'border-yellow-400'
             : 'border-green-400'">

        <h3 class="font-bold text-gray-800 text-lg mb-3">
          🎯 {{ alertData.riskLevel === 'LOW' ? 'Evaluare' : 'Acțiune detectată' }}
        </h3>

        <!-- Cauza principală -->
        <div class="mb-4 p-3 rounded-lg"
             [class]="alertData.riskLevel === 'LOW' ? 'bg-green-50' : 'bg-gray-50'">
          <div class="text-sm font-semibold text-gray-600 mb-1">
            {{ alertData.riskLevel === 'LOW' ? 'Concluzie' : 'Cauza principală' }}
          </div>
          <div class="text-base font-medium"
               [class]="getRiskTextClass(alertData.riskLevel)">
            {{ getMainCause() }}
          </div>
        </div>

        <!-- LOW — afișează doar scorul și explicație simplă -->
        <div *ngIf="alertData.riskLevel === 'LOW'"
             class="p-3 bg-green-50 rounded-lg border border-green-200">
          <div class="text-sm text-green-700">
            <span class="font-semibold">
              Final Risk: {{ alertData.finalRisk | number:'1.3-3' }}
            </span>
            — sub pragul de alertare pentru categoria
            <span class="font-semibold">{{ alertData.logCategory }}</span>.
            Logul e salvat pentru audit dar nu necesită investigație.
          </div>
        </div>

        <!-- HIGH și MEDIUM — indicatori de risc -->
        <ng-container *ngIf="alertData.riskLevel !== 'LOW'">

          <div class="grid grid-cols-4 gap-3 mb-4">
            <div class="text-center p-3 rounded-lg border-2 transition-all"
                 [class]="alertData.entityContext.failedAuth >= 5
                   ? 'border-red-300 bg-red-50'
                   : 'border-gray-200 bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.failedAuth >= 5
                     ? 'text-red-600' : 'text-gray-500'">
                {{ alertData.entityContext.failedAuth }}
              </div>
              <div class="text-xs font-medium mt-1"
                   [class]="alertData.entityContext.failedAuth >= 5
                     ? 'text-red-500' : 'text-gray-400'">
                Failed Auth
              </div>
              <div class="text-xs mt-1"
                   *ngIf="alertData.entityContext.failedAuth >= 5">
                🚨 Brute force
              </div>
            </div>

            <div class="text-center p-3 rounded-lg border-2 transition-all"
                 [class]="alertData.entityContext.sudoCount >= 6
                   ? 'border-red-300 bg-red-50'
                   : 'border-gray-200 bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.sudoCount >= 6
                     ? 'text-red-600' : 'text-gray-500'">
                {{ alertData.entityContext.sudoCount }}
              </div>
              <div class="text-xs font-medium mt-1"
                   [class]="alertData.entityContext.sudoCount >= 6
                     ? 'text-red-500' : 'text-gray-400'">
                Sudo Count
              </div>
              <div class="text-xs mt-1"
                   *ngIf="alertData.entityContext.sudoCount >= 6">
                🚨 Escaladare
              </div>
            </div>

            <div class="text-center p-3 rounded-lg border-2 transition-all"
                 [class]="alertData.entityContext.uploads >= 2
                   ? 'border-orange-300 bg-orange-50'
                   : 'border-gray-200 bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.uploads >= 2
                     ? 'text-orange-600' : 'text-gray-500'">
                {{ alertData.entityContext.uploads }}
              </div>
              <div class="text-xs font-medium mt-1"
                   [class]="alertData.entityContext.uploads >= 2
                     ? 'text-orange-500' : 'text-gray-400'">
                Uploads
              </div>
              <div class="text-xs mt-1"
                   *ngIf="alertData.entityContext.uploads >= 2">
                ⚠️ Exfiltrare
              </div>
            </div>

            <div class="text-center p-3 rounded-lg border-2 transition-all"
                 [class]="alertData.entityContext.lsass >= 1
                   ? 'border-red-300 bg-red-50'
                   : 'border-gray-200 bg-gray-50'">
              <div class="text-2xl font-bold"
                   [class]="alertData.entityContext.lsass >= 1
                     ? 'text-red-600' : 'text-gray-500'">
                {{ alertData.entityContext.lsass }}
              </div>
              <div class="text-xs font-medium mt-1"
                   [class]="alertData.entityContext.lsass >= 1
                     ? 'text-red-500' : 'text-gray-400'">
                LSASS
              </div>
              <div class="text-xs mt-1"
                   *ngIf="alertData.entityContext.lsass >= 1">
                🚨 Credential dump
              </div>
            </div>
          </div>

          <!-- Reguli declanșate -->
          <div *ngIf="(alertData.rulesFired || []).length > 0"
               class="mb-3">
            <div class="text-sm font-semibold text-gray-600 mb-2">
              ⚡ Reguli de securitate declanșate
            </div>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let rule of alertData.rulesFired"
                    class="px-3 py-1 bg-indigo-50 text-indigo-700
                           rounded-full text-xs font-medium
                           border border-indigo-200">
                {{ rule }}
              </span>
            </div>
          </div>

          <!-- Explicație ML -->
          <div *ngIf="!alertData.ruleTriggered"
               class="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div class="text-sm font-semibold text-purple-700 mb-1">
              🤖 Detectat de ML — fără reguli explicite
            </div>
            <div class="text-xs text-purple-600">
              Sistemul ML a detectat un comportament anomal bazat pe
              combinația scorurilor IF + RF + LSTM față de baseline-ul entității.
            </div>
          </div>

        </ng-container>
      </div>

      <div class="grid grid-cols-2 gap-4">

        <!-- Raw Log -->
        <div class="col-span-2 bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">📄 Log original</h3>
          <div class="font-mono text-sm bg-gray-900 text-green-400
                      p-3 rounded-lg break-all">
            {{ alertData.rawLog }}
          </div>
          <button (click)="copyLog()"
                  class="mt-2 px-3 py-1 text-sm border border-gray-300
                         rounded hover:bg-gray-100 transition-colors">
            📋 Copiază
          </button>
        </div>

        <!-- Score Breakdown -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">
            📊 Score Breakdown
          </h3>
          <div class="space-y-3">
            <div *ngFor="let item of getScoreItems()">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">{{ item.label }}</span>
                <span class="font-mono text-xs font-semibold">
                  {{ item.value !== null
                     ? (item.value | number:'1.3-3')
                     : 'N/A (antrenare)' }}
                </span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                     [class]="item.colorClass"
                     [style.width.%]="(item.value || 0) * 100">
                </div>
              </div>
            </div>

            <div class="border-t pt-3 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Template Rarity</span>
                <span class="font-mono text-xs">
                  {{ alertData.rarity | number:'1.3-3' }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Burst Score</span>
                <span class="font-mono text-xs">
                  {{ alertData.burst | number:'1.3-3' }}
                </span>
              </div>
            </div>

            <div class="border-t pt-3">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-bold text-gray-700">Final Risk</span>
                <span class="font-mono font-bold text-lg"
                      [class]="getRiskTextClass(alertData.riskLevel)">
                  {{ alertData.finalRisk | number:'1.3-3' }}
                </span>
              </div>
              <div class="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500
                            flex items-center justify-end pr-2"
                     [class]="getScoreBarClass(alertData.riskLevel)"
                     [style.width.%]="alertData.finalRisk * 100">
                  <span class="text-white text-xs font-bold"
                        *ngIf="alertData.finalRisk > 0.2">
                    {{ (alertData.finalRisk * 100) | number:'1.0-0' }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- IF Scores detaliat -->
        <div class="bg-white rounded-xl shadow p-5">
          <h3 class="font-semibold text-gray-700 mb-3">
            🔬 Isolation Forest
          </h3>
          <div class="space-y-3">

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">Stat Score</span>
                <span class="font-mono text-xs">
                  {{ alertData.statScore !== null
                     ? (alertData.statScore | number:'1.3-3')
                     : 'N/A' }}
                </span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-400 rounded-full"
                     [style.width.%]="(alertData.statScore || 0) * 100">
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">
                Anomalie în frecvență/intensitate
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">Behavior Score</span>
                <span class="font-mono text-xs">
                  {{ alertData.behaviorScore !== null
                     ? (alertData.behaviorScore | number:'1.3-3')
                     : 'N/A' }}
                </span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-400 rounded-full"
                     [style.width.%]="(alertData.behaviorScore || 0) * 100">
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">
                Deviație față de profilul entității
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">Category Score</span>
                <span class="font-mono text-xs">
                  {{ alertData.catScore !== null
                     ? (alertData.catScore | number:'1.3-3')
                     : 'N/A' }}
                </span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-violet-400 rounded-full"
                     [style.width.%]="(alertData.catScore || 0) * 100">
                </div>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">
                Anomalie față de categoria {{ alertData.logCategory }}
              </div>
            </div>

          </div>

          <button (click)="goToTimeline()"
                  class="mt-4 w-full px-4 py-2 border border-indigo-300
                         text-indigo-600 rounded-lg hover:bg-indigo-50
                         transition-colors text-sm font-medium">
            📈 Vezi Entity Timeline pentru {{ alertData.entityId }}
          </button>
        </div>

        <!-- Rule Engine detaliat — doar dacă triggered -->
        <div class="col-span-2 bg-white rounded-xl shadow p-5"
             *ngIf="alertData.ruleTriggered">
          <h3 class="font-semibold text-gray-700 mb-3">
            ⚡ Rule Engine — Detalii
          </h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">Rule Score</div>
              <div class="text-2xl font-bold"
                   [class]="alertData.ruleScore >= 0.7
                     ? 'text-red-600' : 'text-orange-500'">
                {{ alertData.ruleScore | number:'1.3-3' }}
              </div>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">Clasificare</div>
              <div class="text-sm font-bold">
                <span *ngIf="alertData.ruleShortcut">
                  ⚡ Shortcut — clasificat imediat fără ML
                </span>
                <span *ngIf="!alertData.ruleShortcut">
                  🤖 Rule Engine + ML — scorurile ML au contribuit la decizie
                </span>
              </div>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">Reguli declanșate</div>
              <div class="text-2xl font-bold text-indigo-600">
                {{ (alertData.rulesFired || []).length }}
              </div>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <span *ngFor="let rule of (alertData.rulesFired || [])"
                  class="px-3 py-1.5 bg-indigo-50 text-indigo-700
                         rounded-lg text-sm font-medium border border-indigo-200">
              {{ rule }}
            </span>
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
    if (eventId) {
      this.alertService.getAlert(eventId).subscribe({
        next: alert => {
          this.alertData = alert;
          this.cdr.detectChanges();
        },
        error: err => console.error('Eroare:', err)
      });
    }
  }

getMainCause(): string {
  if (!this.alertData) return '';

  const ctx   = this.alertData.entityContext;
  const rules = this.alertData.rulesFired || [];
  const level = this.alertData.riskLevel;
  const log   = this.alertData.rawLog?.toLowerCase() || '';
  const rf    = this.alertData.scoreBreakdown?.randomForest || 0;
  const lstm  = this.alertData.scoreBreakdown?.lstm || 0;
  const statScore  = this.alertData.statScore || 0;
  const behavScore = this.alertData.behaviorScore || 0;

  // ── LOW — activitate normală ──────────────────────────────────
  if (level === 'LOW') {
    return '✅ Activitate normală — nicio acțiune malițioasă detectată';
  }

  // ── Shortcut — cert malițios ──────────────────────────────────
  if (this.alertData.ruleShortcut) {
    if (rules.some(r => r.includes('lsass')))
      return '🔑 Credential dump — LSASS accesat direct din memorie';
    if (rules.some(r => r.includes('lateral')))
      return '🔀 Lateral movement — mișcare laterală între sisteme';
    if (rules.some(r => r.includes('download_exec')))
      return '⬇️ Download și execuție cod malițios de pe rețea';
    if (rules.some(r => r.includes('lolbin')))
      return '🛠️ LOLBin — tool legitim de sistem folosit malițios';
    if (rules.some(r => r.includes('sudo_shell')))
      return '🐚 Sudo shell escape — escaladare directă la root';
    if (rules.some(r => r.includes('reverse_shell')))
      return '🔌 Reverse shell — conexiune de control de la distanță';
    if (rules.some(r => r.includes('sensitive_path')))
      return '📁 Scriere în cale sensibilă — modificare fișier critic de sistem';
    if (rules.some(r => r.includes('triada')))
      return '⚔️ Triada completă — brute force + escaladare + exfiltrare';
    return '🚨 Regulă critică de securitate declanșată';
  }

  // ── Rule Engine + ML — explicație detaliată per regulă ───────
  if (rules.length > 0) {
    const rule = rules[0];

    // Grupul A — Execuție
    if (rule.includes('A1') || rule.includes('reverse_shell'))
      return '🔌 Reverse shell detectat — atacatorul încearcă control de la distanță';
    if (rule.includes('A2') || rule.includes('download_exec'))
      return '⬇️ Download + execuție — script malițios descărcat și rulat';
    if (rule.includes('A3') || rule.includes('lolbin'))
      return '🛠️ LOLBin detectat — ' + (
        log.includes('mimikatz')  ? 'Mimikatz (extragere credențiale)' :
        log.includes('certutil')  ? 'Certutil (download malițios)' :
        log.includes('rundll32')  ? 'Rundll32 (execuție cod arbitrar)' :
        log.includes('wmic')      ? 'WMIC (execuție laterală)' :
        'tool legitim folosit malițios');
    if (rule.includes('A5') || rule.includes('sudo_shell'))
      return '🐚 Sudo shell escape — escaladare privilegii prin shell interactiv';

    // Grupul B — Credențiale
    if (rule.includes('B1'))
      return '🔑 Acces LSASS — extragere credențiale din memorie Windows (' +
             ctx.lsass + 'x în ultimele 20s)';
    if (rule.includes('B2'))
      return '🔑 Campanie credential dump — LSASS accesat repetat (' +
             ctx.lsass + 'x) + brute force (' + ctx.failedAuth + ' încercări)';
    if (rule.includes('B3'))
      return '🔀 Lateral movement — ' + (
        log.includes('psexec')          ? 'PsExec' :
        log.includes('pass-the-hash')   ? 'Pass-the-Hash' :
        log.includes('wmi')             ? 'WMI' :
        log.includes('rdp')             ? 'RDP' : 'SMB') +
        ' folosit pentru mișcare laterală';
    if (rule.includes('B4'))
      return '🔐 Brute force SSH/RDP — ' + ctx.failedAuth +
             ' autentificări eșuate în 20 secunde';

    // Grupul C — Fișiere
    if (rule.includes('C1'))
      return '📤 Upload fișier malițios — fișier executabil sau script încărcat pe server';
    if (rule.includes('C2'))
      return '📁 Scriere în cale sensibilă — ' + (
        log.includes('authorized_keys') ? 'cheie SSH adăugată în /root/.ssh/' :
        log.includes('passwd')          ? 'modificare /etc/passwd' :
        log.includes('shadow')          ? 'modificare /etc/shadow' :
        log.includes('sudoers')         ? 'modificare /etc/sudoers' :
        log.includes('cron')            ? 'persistență prin crontab' :
        'fișier critic de sistem modificat');

    // Grupul D — Web
    if (rule.includes('D1'))
      return '💉 SQL Injection — injecție SQL detectată în request';
    if (rule.includes('D2'))
      return '🖥️ XSS — cross-site scripting detectat în request';
    if (rule.includes('D3'))
      return '📂 Path traversal — încercare acces fișiere din afara web root';
    if (rule.includes('D4'))
      return '🔍 Acces endpoint debug — endpoint sensibil accesat (/admin, /actuator, /.env)';
    if (rule.includes('D5'))
      return '🗑️ Metodă HTTP distructivă — DELETE/PUT pe resurse critice';

    // Grupul E — Rețea
    if (rule.includes('E1'))
      return '🌐 DNS suspect — query către domeniu C2 sau TLD malițios (' +
             (log.match(/query:\s+(\S+)/)?.[1] || 'domeniu suspect') + ')';
    if (rule.includes('E3'))
      return '🛡️ Firewall block extern — trafic blocat de la IP extern suspect';

    // Grupul F — Alerte externe
    if (rule.includes('F1'))
      return '🦠 AV Alert — ' + (
        log.includes('ransomware') ? 'ransomware detectat' :
        log.includes('trojan')     ? 'trojan detectat' :
        log.includes('worm')       ? 'worm detectat' :
        log.includes('spyware')    ? 'spyware detectat' :
        'malware detectat și carantinat');
    if (rule.includes('F2'))
      return '🚨 IDS Alert — Suricata a detectat trafic malițios în rețea';
    if (rule.includes('F3'))
      return '📤 DLP Alert — exfiltrare date blocată: ' +
             (log.match(/channel="([^"]+)"/)?.[1] || 'canal necunoscut') +
             ' → ' + (log.match(/data_type="([^"]+)"/)?.[1] || 'date sensibile') +
             ' (user: ' + this.alertData.entityId + ')';
    if (rule.includes('F4'))
      return '🔗 SIEM Alert — corelație reguli: ' +
             (log.match(/rule="([^"]+)"/)?.[1] || 'regulă de corelație');
    if (rule.includes('F5'))
      return '🛡️ EDR Alert — ' + (
        log.includes('lateral')    ? 'lateral movement detectat' :
        log.includes('credential') ? 'acces credențiale detectat' :
        log.includes('lsass')      ? 'dump LSASS detectat' :
        'activitate malițioasă detectată de EDR');

    // Grupul G — Compuse
    if (rule.includes('G2'))
      return '⚔️ Brute force urmat de escaladare — ' + ctx.failedAuth +
             ' eșecuri auth + ' + ctx.sudoCount + ' sudo în 20s';
    if (rule.includes('G3'))
      return '📁 Upload + scriere sensibilă — posibilă instalare webshell';
    if (rule.includes('G5'))
      return '🔀 Lateral movement + credential dump — atac avansat în desfășurare';

    // Grupul H — Context masiv
    if (rule.includes('H1'))
      return '🔑 LSASS + brute force — campanie extragere credențiale (' +
             ctx.lsass + 'x LSASS + ' + ctx.failedAuth + ' eșecuri)';
    if (rule.includes('H2'))
      return '⚔️ Brute force masiv + escaladare — ' + ctx.failedAuth +
             ' eșecuri + ' + ctx.sudoCount + ' sudo';
    if (rule.includes('H3'))
      return '🔐 Brute force extrem — ' + ctx.failedAuth +
             ' autentificări eșuate în 20 secunde';
    if (rule.includes('H4'))
      return '📤 Escaladare + exfiltrare — ' + ctx.sudoCount +
             ' sudo + ' + ctx.uploads + ' upload-uri';
    if (rule.includes('H5'))
      return '⚔️ Triada completă — brute force (' + ctx.failedAuth +
             ') + escaladare (' + ctx.sudoCount +
             ') + exfiltrare (' + ctx.uploads + ')';
  }

  // ── ML pur — fără reguli ──────────────────────────────────────

  // Cazul 1 — Context entitate sugestiv
  if (ctx.failedAuth >= 5 && ctx.sudoCount >= 3)
    return '⚔️ Pattern brute force + escaladare detectat de ML — ' +
           ctx.failedAuth + ' autentificări eșuate + ' + ctx.sudoCount +
           ' sudo fără prag de regulă atins';

  if (ctx.failedAuth >= 5)
    return '🔐 Brute force detectat de ML — ' + ctx.failedAuth +
           ' autentificări eșuate în 20s, sub pragul regulii B4 dar anomal față de baseline';

  if (ctx.sudoCount >= 4)
    return '⬆️ Escaladare privilegii detectată de ML — ' + ctx.sudoCount +
           ' comenzi sudo în 20s, deviere față de profilul normal al entității';

  if (ctx.lsass >= 1)
    return '🔑 Acces LSASS detectat de ML — extragere credențiale suspectă (' +
           ctx.lsass + 'x în 20s)';

  // Cazul 2 — Log specific
  if (log.includes('remote connection') || log.includes('lateral'))
    return '🔀 Conexiune laterală detectată de ML — ' +
           (log.match(/src_host=(\S+)/)?.[1] || 'host sursă') +
           ' → ' + (log.match(/dst_host=(\S+)/)?.[1] || 'host destinație') +
           ' (RF=' + (rf * 100 | 0) + '%, LSTM=' + (lstm * 100 | 0) + '%)';

  if (log.includes('broken authentication') || log.includes('authentication attempt'))
    return '🔐 Tentativă autentificare suspectă detectată de ML — ' +
           'pattern similar cu brute force (IF Stat=' + (statScore * 100 | 0) + '%)';

  if (log.includes('failed') &&
      (log.includes('password') || log.includes('keyboard') || log.includes('publickey')))
    return '🔐 Eșec autentificare SSH detectat de ML — ' +
           'deviere față de profilul entității (IF Behavior=' +
           (behavScore * 100 | 0) + '%)';

  if (log.includes('edr info') || log.includes('process execution'))
    return '⚙️ Execuție proces suspectă detectată de ML — ' +
           (log.match(/process=(\S+)/)?.[1] || 'proces necunoscut') +
           ' (RF=' + (rf * 100 | 0) + '%, LSTM=' + (lstm * 100 | 0) + '%)';

  if (log.includes('accepted') && log.includes('from'))
    return '🔑 Autentificare reușită suspectă — IP sursă sau moment neobișnuit ' +
           'față de baseline (IF=' + (statScore * 100 | 0) + '%)';

  if (log.includes('dlp') || log.includes('exfiltration'))
    return '📤 Pattern exfiltrare detectat de ML — ' +
           (log.match(/channel="([^"]+)"/)?.[1] || 'canal necunoscut');

  if (log.includes('firewall'))
    return '🛡️ Trafic rețea anomal detectat de ML — pattern neobișnuit față de baseline ' +
           '(IF Stat=' + (statScore * 100 | 0) + '%)';

  if (log.includes('malware') || log.includes('av alert') || log.includes('virus'))
    return '🦠 Activitate malware detectată de ML — ' +
           'pattern confirmat de IF + RF (RF=' + (rf * 100 | 0) + '%)';

  if (log.includes('siem') || log.includes('correlation'))
    return '🔗 Corelație SIEM detectată de ML — ' +
           (log.match(/rule="([^"]+)"/)?.[1] || 'regulă de corelație suspectă');

  // Cazul 3 — Scoruri ML specifice
  if (rf > 0.8 && lstm > 0.7)
    return '🤖 RF (' + (rf * 100 | 0) + '%) + LSTM (' + (lstm * 100 | 0) +
           '%) — secvență de evenimente similară cu atacuri cunoscute din antrenare';

  if (rf > 0.8)
    return '🤖 Random Forest HIGH (' + (rf * 100 | 0) +
           '%) — pattern similar cu atacuri cunoscute din antrenare';

  if (lstm > 0.8)
    return '🤖 LSTM HIGH (' + (lstm * 100 | 0) +
           '%) — secvență temporală a entității similară cu pattern de atac';

  if (this.alertData.rarity > 0.95)
    return '🔍 Template extrem de rar (rarity=' +
           this.alertData.rarity.toFixed(3) +
           ') — tip de log aproape niciodată văzut, IF Category=' +
           (this.alertData.catScore
             ? (this.alertData.catScore * 100 | 0) + '%'
             : 'N/A');

  if (this.alertData.burst > 0.7)
    return '💥 Burst de evenimente (burst=' +
           this.alertData.burst.toFixed(3) +
           ') — frecvență anormal de mare pentru acest template';

  return '🤖 Comportament anomal detectat de ML — combinație neobișnuită ' +
         'IF(' + (statScore * 100 | 0) + '%) + ' +
         'RF(' + (rf * 100 | 0) + '%) + ' +
         'LSTM(' + (lstm * 100 | 0) + '%)';
}

  getScoreItems() {
    if (!this.alertData?.scoreBreakdown) return [];
    return [
      {
        label:      'Rule Engine',
        value:      this.alertData.scoreBreakdown.ruleEngine,
        colorClass: 'bg-red-400'
      },
      {
        label:      'Isolation Forest',
        value:      this.alertData.scoreBreakdown.isolationForest,
        colorClass: 'bg-orange-400'
      },
      {
        label:      'Random Forest',
        value:      this.alertData.scoreBreakdown.randomForest,
        colorClass: 'bg-blue-400'
      },
      {
        label:      'LSTM',
        value:      this.alertData.scoreBreakdown.lstm,
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