import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/authentication/client-login',
    pathMatch: 'full'
  },

  {
    path: '',
    component: FullComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'voiture',
        loadChildren: () =>
          import('./pages/voiture/voiture.routes').then((m) => m.VoitureRoutes),
      },
      {
        path: 'service',
        loadChildren: () =>
          import('./pages/service/service.routes').then((m) => m.ServiceRoutes),
      },
      {
        path: 'personne',
        loadChildren: () =>
          import('./pages/personne/personne.routes').then((m) => m.PersonneRoutes),
      },
      {
        path: 'rendez-vous',
        loadChildren: () =>
          import('./pages/rendez-vous/rendez-vous.routes').then((m) => m.RendezVousRoutes),
      },
      {
        path: 'specialite',
        loadChildren: () =>
          import('./pages/specialite/specialite.routes').then((m) => m.SpecialiteRoutes),
      },
      {
        path: 'service/promotion',
        loadChildren: () =>
          import('./pages/promotion/promotion.routes').then((m) => m.PromotionRoutes),
      },
      {
        path: 'conges',
        loadChildren: () =>
          import('./pages/conge/conge.routes').then((m) => m.CongeRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];