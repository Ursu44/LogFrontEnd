import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Alert, DashboardStats, AlertFilters,
         Incident, IncidentFilters } from '../models/alert.model';
import {
  GET_RECENT_ALERTS, GET_ALERTS, GET_ALERT,
  GET_DASHBOARD_STATS, GET_ENTITY_HISTORY,
  NEW_ALERT_SUBSCRIPTION, NEW_HIGH_ALERT_SUBSCRIPTION,
  GET_RECENT_INCIDENTS, GET_INCIDENT,
  GET_INCIDENTS_BY_ENTITY, GET_INCIDENTS_BY_SEVERITY,
  NEW_INCIDENT_SUBSCRIPTION, NEW_CRITICAL_INCIDENT_SUBSCRIPTION
} from '../graphql/queries';

@Injectable({ providedIn: 'root' })
export class AlertService {

  constructor(private apollo: Apollo) {}

  // ── Alert methods ─────────────────────────────────────────────

  getRecentAlerts(): Observable<Alert[]> {
    return this.apollo.query<{ recentAlerts: Alert[] }>({
      query: GET_RECENT_ALERTS,
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.recentAlerts));
  }

  getAlerts(filters: AlertFilters = {}): Observable<Alert[]> {
    return this.apollo.query<{ alerts: Alert[] }>({
      query: GET_ALERTS,
      variables: {
        riskLevel:     filters.riskLevel     || null,
        category:      filters.category      || null,
        entityId:      filters.entityId      || null,
        windowMinutes: filters.windowMinutes || null,
        limit:         filters.limit         || 100,
      },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.alerts));
  }

  getAlert(eventId: string): Observable<Alert> {
    return this.apollo.query<{ alert: Alert }>({
      query: GET_ALERT,
      variables: { eventId },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.alert));
  }

  getDashboardStats(windowMinutes: number = 30): Observable<DashboardStats> {
    return this.apollo.query<{ dashboardStats: DashboardStats }>({
      query: GET_DASHBOARD_STATS,
      variables: { windowMinutes },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.dashboardStats));
  }

  getEntityHistory(entityId: string,
                   windowMinutes: number = 30): Observable<Alert[]> {
    return this.apollo.query<{ entityHistory: Alert[] }>({
      query: GET_ENTITY_HISTORY,
      variables: { entityId, windowMinutes: Number(windowMinutes) },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.entityHistory));
  }

  subscribeToAlerts(): Observable<Alert> {
    return this.apollo.subscribe<{ newAlert: Alert }>({
      query: NEW_ALERT_SUBSCRIPTION
    }).pipe(map(result => result.data!.newAlert));
  }

  subscribeToHighAlerts(): Observable<Alert> {
    return this.apollo.subscribe<{ newHighAlert: Alert }>({
      query: NEW_HIGH_ALERT_SUBSCRIPTION
    }).pipe(map(result => result.data!.newHighAlert));
  }

  // ── Incident methods ──────────────────────────────────────────

  getRecentIncidents(): Observable<Incident[]> {
    return this.apollo.query<{ recentIncidents: Incident[] }>({
      query: GET_RECENT_INCIDENTS,
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.recentIncidents));
  }

  getIncident(incidentId: string): Observable<Incident> {
    return this.apollo.query<{ incident: Incident }>({
      query: GET_INCIDENT,
      variables: { incidentId },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.incident));
  }

  getIncidentsByEntity(entityId: string): Observable<Incident[]> {
    return this.apollo.query<{ incidentsByEntity: Incident[] }>({
      query: GET_INCIDENTS_BY_ENTITY,
      variables: { entityId },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.incidentsByEntity));
  }

  getIncidentsBySeverity(severity: string): Observable<Incident[]> {
    return this.apollo.query<{ incidentsBySeverity: Incident[] }>({
      query: GET_INCIDENTS_BY_SEVERITY,
      variables: { severity },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data!.incidentsBySeverity));
  }

  subscribeToIncidents(): Observable<Incident> {
    return this.apollo.subscribe<{ newIncident: Incident }>({
      query: NEW_INCIDENT_SUBSCRIPTION
    }).pipe(map(result => result.data!.newIncident));
  }

  subscribeToCriticalIncidents(): Observable<Incident> {
    return this.apollo.subscribe<{ newCriticalIncident: Incident }>({
      query: NEW_CRITICAL_INCIDENT_SUBSCRIPTION
    }).pipe(map(result => result.data!.newCriticalIncident));
  }
}