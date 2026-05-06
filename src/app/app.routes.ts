import { Routes } from '@angular/router';

export const routes: Routes = [
 {
  path: '',
  loadComponent: () =>
    import('./pages/home/home.component')
      .then(m => m.HomeComponent)
},
  {
    path: 'live',
    loadComponent: () =>
      import('./pages/live-feed/live-feed.component')
        .then(m => m.LiveFeedComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'alert/:eventId',
    loadComponent: () =>
      import('./pages/alert-detail/alert-detail.component')
        .then(m => m.AlertDetailComponent)
  },
  {
    path: 'entity/:entityId',
    loadComponent: () =>
      import('./pages/entity-timeline/entity-timeline.component')
        .then(m => m.EntityTimelineComponent)
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.component')
        .then(m => m.HistoryComponent)
  },
   {
    path: 'incidents',
    loadComponent: () =>
      import('./pages/incidents/incidents.component')
        .then(m => m.IncidentsComponent)
  },
  {
    path: 'incident/:incidentId',
    loadComponent: () =>
      import('./pages/incident-timeline/incident-timeline.component')
        .then(m => m.IncidentTimelineComponent)
  },
  {
    path: '**',
    redirectTo: 'live'
  }
];