import { Routes } from '@angular/router';
import { RendezVousDetailComponent } from './rendez-vous-detail/rendez-vous-detail.component';
import { RendezVousInterventionComponent } from './intervention/rendez-vous-intervention.component';
import { RendezVousInterventionDetailsComponent } from './intervention/details/rendez-vous-intervention-details.component';
import { HistoriqueRendezVousComponent } from './historique-rendez-vous/historique-rendez-vous.component';
import { RendezVousComponent } from './rendez-vous/rendez-vous.component';
// pages

export const RendezVousRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'historique-demande',
        component: HistoriqueRendezVousComponent,
      },
      {
        path: 'interventions',
        component: RendezVousInterventionComponent,
      },
      {
        path: 'interventions-details/:id',
        component: RendezVousInterventionDetailsComponent,
      },
      {
        path: 'details/:id',
        component: RendezVousDetailComponent,
      },
      {
        path: ':status', // Cette route dynamique doit être après les autres routes fixes
        component: HistoriqueRendezVousComponent,
      },
      {
        path: '', // La route par défaut doit être en dernier
        component: RendezVousComponent,
      },
    ],
  }, 
];
