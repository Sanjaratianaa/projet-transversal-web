import { Routes } from '@angular/router';
import { PersonneComponent } from './personne.component';
// pages

export const PersonneRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PersonneComponent,
      },
    ],
  },
];
