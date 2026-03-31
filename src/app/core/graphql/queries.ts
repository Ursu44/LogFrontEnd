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