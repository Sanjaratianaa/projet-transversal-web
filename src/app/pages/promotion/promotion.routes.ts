import { Routes } from '@angular/router';
import { PromotionComponent } from './gestion-promotion/promotion.component';
// pages

export const PromotionRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'gestion-promotion',
        component: PromotionComponent,
      },    
    ],
  },
];
