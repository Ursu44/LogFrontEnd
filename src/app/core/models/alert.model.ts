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