import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';  // Assurez-vous que FormsModule est bien importé ici
import { MatButtonModule } from '@angular/material/button';
import { GestionStockService } from 'src/app/services/caracteristiques/gestionStock.service';


@Component({
  selector: 'app-stock',
  standalone: true,
  templateUrl: './stock.component.html',
  imports: [MatListModule, MatCardModule, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class StockComponent {
  displayedColumns: string[] = ['piece', "marquePiece", "marqueVoiture", "modeleVoiture", "typeTransmission", "entree", "sortie", "reste", "prixUnitaire"];
  stocks: any[];
  isAdmin: boolean = false;

  paginatedStocks: any[] = [];

  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private gestionStockService: GestionStockService,
  ) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role != "manager")
      this.displayedColumns = ['piece', "marquePiece", "marqueVoiture", "modeleVoiture", "typeTransmission", "reste", "prixUnitaire"];
    else
    this.isAdmin = true;
    // Initialisez la pagination au chargement du composant
    this.getStocks();
  }

  getStocks() {
    this.gestionStockService.getStocks().subscribe({
      next: (stocks: any) => {
        console.log("reste en stock");
        console.log(stocks);
        this.stocks = stocks;
        this.updatePagination();
      },
      error: (error: Error) => {
        console.error('Erreur lors du chargement des stocks:', error.message);
        alert('Impossible de charger les stocks. Veuillez réessayer plus tard.');
      }
    });
  }


  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedStocks = this.stocks.slice(startIndex, endIndex);
  }

  // Fonction pour gérer la pagination
  onPaginateChange(event: PageEvent) {
    const { pageIndex, pageSize } = event;
    this.currentPage = pageIndex;
    this.pageSize = pageSize;

    this.updatePagination();

    // Vous pouvez ajouter ici une logique de récupération des données paginées depuis un serveur si nécessaire
    console.log('Pagination changed: ', event);
  }

}