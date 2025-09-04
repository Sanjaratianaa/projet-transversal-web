import { Routes } from '@angular/router';
import { SpecialiteComponent } from './specialite.component';
// pages

export const SpecialiteRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SpecialiteComponent,
      },
    ],
  },
];
