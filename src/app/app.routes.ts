import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'live',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/live-feed/live-feed.component')
        .then(m => m.LiveFeedComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'alert/:eventId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/alert-detail/alert-detail.component')
        .then(m => m.AlertDetailComponent)
  },
  {
    path: 'entity/:entityId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/entity-timeline/entity-timeline.component')
        .then(m => m.EntityTimelineComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/history/history.component')
        .then(m => m.HistoryComponent)
  },
  {
    path: 'incidents',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/incidents/incidents.component')
        .then(m => m.IncidentsComponent)
  },
  {
    path: 'incident/:incidentId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/incident-timeline/incident-timeline.component')
        .then(m => m.IncidentTimelineComponent)
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];