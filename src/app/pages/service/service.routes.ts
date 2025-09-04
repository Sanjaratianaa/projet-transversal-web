import { Routes } from '@angular/router';
import { PrixSousServiceComponent } from './prix-sous-service/prixSousService.component';
import { ServiceComponent } from './service/service.component';
import { SousServiceComponent } from './sous-service/sous-service.component';
// pages

export const ServiceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ServiceComponent,
      },
      {
        path: 'sous-service',
        component: SousServiceComponent,
      },
      {
        path: 'prix-sous-service',
        component: PrixSousServiceComponent,
      },      
    ],
  },
];
