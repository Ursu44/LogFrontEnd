export interface EntityContext {
  failedAuth: number;
  sudoCount:  number;
  uploads:    number;
  lsass:      number;
}

export interface ScoreBreakdown {
  ruleEngine:      number | null;
  isolationForest: number | null;
  randomForest:    number | null;
  lstm:            number | null;
}

export interface Alert {
  eventId:        string;
  timestamp:      number;
  timestampIso:   string;
  rawLog:         string;
  templateId:     string;
  logCategory:    string;
  entityId:       string;
  ruleTriggered:  boolean;
  ruleScore:      number;
  ruleShortcut:   boolean;
  rulesFired:     string[] | undefined;
  statScore:      number | null;
  behaviorScore:  number | null;
  catScore:       number | null;
  rarity:         number;
  burst:          number;
  rfScore:        number | null;
  lstmScore:      number | null;
  entityContext:  EntityContext;
  scoreBreakdown: ScoreBreakdown;
  finalRisk:      number;
  riskLevel:      'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DashboardStats {
  totalAlerts:  number;
  highCount:    number;
  mediumCount:  number;
  lowCount:     number;
  oldestAlert:  string | null;
  newestAlert:  string | null;
}

export interface AlertFilters {
  riskLevel?:     string;
  category?:      string;
  entityId?:      string;
  windowMinutes?: number;
  limit?:         number;
}


export interface TimelineEvent {
  step:             number;
  eventId:          string;
  timestamp:        number;
  timestampIso:     string;
  riskLevel:        string;
  finalRisk:        number;
  logCategory:      string;
  rawLog:           string;
  rulesFired:       string[];
  ruleShortcut:     boolean;
  ruleTriggered:    boolean;
  entityContext:    EntityContext;
  transition:       string | null;
  causeNote:        string | null;
  scoreDelta:       number;
  statScore:        number | null;
  behaviorScore:    number | null;
  catScore:         number | null;
  rfScore:          number | null;
  lstmScore:        number | null;
  confidence:       number;
  confidenceLabel:  string;
}

export interface Incident {
  incidentId:           string;
  entityId:             string;
  createdAt:            string;
  startTime:            string;
  endTime:              string;
  durationSec:          number;
  attackTypes:          string[];
  mitreTactics:         string[];
  aptPattern:           string | null;
  severity:             string;
  multiStage:           boolean;
  rootCause:            string;
  rootCauseTs:          string;
  rootCauseRules:       string[];
  rootCauseConfidence:  number;
  totalEvents:          number;
  highEvents:           number;
  mediumEvents:         number;
  peakScore:            number;
  avgConfidence:        number;
  maxConfidence:        number;
  globalUncertainty:    number;
  timelineJson:         string;
  eventIds:             string[];
  timeline?:            TimelineEvent[];
}

export interface IncidentFilters {
  entityId?:    string;
  severity?:    string;
  attackType?:  string;
}