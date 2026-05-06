import { gql } from 'apollo-angular';

export const ALERT_FIELDS = gql`
  fragment AlertFields on Alert {
    eventId
    timestamp
    timestampIso
    rawLog
    templateId
    logCategory
    entityId
    ruleTriggered
    ruleScore
    ruleShortcut
    rulesFired
    statScore
    behaviorScore
    catScore
    rarity
    burst
    rfScore
    lstmScore
    entityContext {
      failedAuth
      sudoCount
      uploads
      lsass
    }
    scoreBreakdown {
      ruleEngine
      isolationForest
      randomForest
      lstm
    }
    finalRisk
    riskLevel
  }
`;

export const INCIDENT_FIELDS = gql`
  fragment IncidentFields on Incident {
    incidentId
    entityId
    createdAt
    startTime
    endTime
    durationSec
    attackTypes
    mitreTactics
    aptPattern
    severity
    multiStage
    rootCause
    rootCauseTs
    rootCauseRules
    rootCauseConfidence
    totalEvents
    highEvents
    mediumEvents
    peakScore
    avgConfidence
    maxConfidence
    globalUncertainty
    timelineJson
    eventIds
  }
`;

export const GET_RECENT_ALERTS = gql`
  ${ALERT_FIELDS}
  query GetRecentAlerts {
    recentAlerts {
      ...AlertFields
    }
  }
`;

export const GET_ALERTS = gql`
  ${ALERT_FIELDS}
  query GetAlerts(
    $riskLevel:     String
    $category:      String
    $entityId:      String
    $windowMinutes: Int
    $limit:         Int
  ) {
    alerts(
      riskLevel:     $riskLevel
      category:      $category
      entityId:      $entityId
      windowMinutes: $windowMinutes
      limit:         $limit
    ) {
      ...AlertFields
    }
  }
`;

export const GET_ALERT = gql`
  ${ALERT_FIELDS}
  query GetAlert($eventId: String!) {
    alert(eventId: $eventId) {
      ...AlertFields
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($windowMinutes: Int) {
    dashboardStats(windowMinutes: $windowMinutes) {
      totalAlerts
      highCount
      mediumCount
      lowCount
    }
  }
`;

export const GET_ENTITY_HISTORY = gql`
  ${ALERT_FIELDS}
  query GetEntityHistory(
    $entityId:      String!
    $windowMinutes: Int
  ) {
    entityHistory(
      entityId:      $entityId
      windowMinutes: $windowMinutes
    ) {
      ...AlertFields
    }
  }
`;

export const NEW_ALERT_SUBSCRIPTION = gql`
  ${ALERT_FIELDS}
  subscription NewAlert {
    newAlert {
      ...AlertFields
    }
  }
`;

export const NEW_HIGH_ALERT_SUBSCRIPTION = gql`
  ${ALERT_FIELDS}
  subscription NewHighAlert {
    newHighAlert {
      ...AlertFields
    }
  }
`;

// ── Query-uri noi pentru Incident ─────────────────────────────────

export const GET_RECENT_INCIDENTS = gql`
  ${INCIDENT_FIELDS}
  query GetRecentIncidents {
    recentIncidents {
      ...IncidentFields
    }
  }
`;

export const GET_INCIDENT = gql`
  ${INCIDENT_FIELDS}
  query GetIncident($incidentId: String!) {
    incident(incidentId: $incidentId) {
      ...IncidentFields
    }
  }
`;

export const GET_INCIDENTS_BY_ENTITY = gql`
  ${INCIDENT_FIELDS}
  query GetIncidentsByEntity($entityId: String!) {
    incidentsByEntity(entityId: $entityId) {
      ...IncidentFields
    }
  }
`;

export const GET_INCIDENTS_BY_SEVERITY = gql`
  ${INCIDENT_FIELDS}
  query GetIncidentsBySeverity($severity: String!) {
    incidentsBySeverity(severity: $severity) {
      ...IncidentFields
    }
  }
`;

export const NEW_INCIDENT_SUBSCRIPTION = gql`
  ${INCIDENT_FIELDS}
  subscription NewIncident {
    newIncident {
      ...IncidentFields
    }
  }
`;

export const NEW_CRITICAL_INCIDENT_SUBSCRIPTION = gql`
  ${INCIDENT_FIELDS}
  subscription NewCriticalIncident {
    newCriticalIncident {
      ...IncidentFields
    }
  }
`;