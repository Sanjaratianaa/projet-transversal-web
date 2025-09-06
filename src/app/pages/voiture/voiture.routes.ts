import { Routes } from '@angular/router';
// pages
import { MarqueComponent } from "./marque/marque.component";
import { ModeleComponent } from './modele/modele.component';
import { CategorieComponent } from './categorie/categorie.component';
import { TypeTransmissionComponent } from './type-transmission/typeTransmission.component';
import { PieceComponent } from './piece/piece.component';
import { GestionStockComponent } from './stock-piece/gestion-stock.component';
import { StockComponent } from './stock-piece/stock.component';
import { PrixPieceComponent } from './prix-piece/prix-piece.component';
import { VoitureComponent } from './voiture/voiture.component';

export const VoitureRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'marque',
        component: MarqueComponent,
      },
      {
        path: 'modele',
        component: ModeleComponent,
      },
      {
        path: 'categorie',
        component: CategorieComponent,
      },
      {
        path: 'type-transmission',
        component: TypeTransmissionComponent,
      },
      {
        path: 'piece',
        component: PieceComponent,
      },
      {
        path: 'piece/gestion-stock',
        component: GestionStockComponent,
      },
      {
        path: 'piece/stock',
        component: StockComponent,
      },
      {
        path: 'piece/prix',
        component: PrixPieceComponent,
      },
      {
        path: '',
        component: VoitureComponent,
      },
    ],
  },
];
