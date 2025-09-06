import { Routes } from '@angular/router';
import { DemandeCongeComponent } from './demande-conge/demande-conge.component';
import { HistoriqueCongeComponent } from './historique-conge/historique-conge.component';
// pages

export const CongeRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DemandeCongeComponent,
      },
      {
        path: 'historique-demande',
        component: HistoriqueCongeComponent,
      },
      {
        path: ':status', // Cette route dynamique doit être après les autres routes fixes
        component: HistoriqueCongeComponent,
      },
    ],
  },
];
