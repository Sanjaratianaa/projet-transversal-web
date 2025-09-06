import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';  // Assurez-vous que FormsModule est bien importé ici
import { GenericModalComponent } from 'src/app/components/modal-generique/add-modal/modal.component';
import { GestionStockService } from 'src/app/services/caracteristiques/gestionStock.service';
import { GestionStock } from 'src/app/services/caracteristiques/gestionStock.service';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MarqueService } from 'src/app/services/caracteristiques/marque.service';
import { ModeleService } from 'src/app/services/caracteristiques/modele.service';
import { TypeTransmissionService } from 'src/app/services/caracteristiques/typeTransmission.service';
import { PieceService } from 'src/app/services/caracteristiques/piece.service';


@Component({
  selector: 'app-gestion-stock',
  standalone: true,
  templateUrl: './gestion-stock.component.html',
  imports: [MatListModule, MatCardModule, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class GestionStockComponent {
  displayedColumns: string[] = ['piece', "marquePiece", "marqueVoiture", "modeleVoiture", "typeTransmission", "entree", "sortie", "prixUnitaire", "Date et heure", "Manager"];
  stocks: GestionStock[];

  pieces: any[];
  marques: any[];
  modeles: any[];
  typeTransmissions: any[];

  paginatedStocks: GestionStock[] = [];

  // Nouveau stock à ajouter
  newStock: any = { id_piece: '', marque_piece: '', id_marque: '', id_modele: '', id_type_transmission: '', quantite: 0, type: '' };

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private dialog: MatDialog,
    private gestionStockService: GestionStockService,
    private marqueService: MarqueService,
    private modeleService: ModeleService,
    private typeTransmissionService: TypeTransmissionService,
    private pieceService: PieceService
  ) { }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    this.getAllGestionStocks();
    this.getAllPieceActives();
    this.getAllMarqueActives();
    this.getAllModeleActives();
    this.getAllTypeTransmissionActives();
  }

  getAllGestionStocks() {
    this.gestionStockService.getGestionStocks().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stocks:', error.message);
        alert('Impossible de charger les stocks. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllPieceActives() {
    this.pieceService.getPiecesActives().subscribe({
      next: (pieces) => {
        this.pieces = pieces.map(piece => ({
          value: piece._id,
          label: piece.libelle
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des marques:', error.message);
        alert('Impossible de charger les marques. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllMarqueActives() {
    this.marqueService.getMarquesActives().subscribe({
      next: (marques) => {
        this.marques = [
          { value: '0', label: 'Tous' },  // Option "Tous" ajoutée au début
          ...marques.map(marque => ({
            value: marque._id,
            label: marque.libelle
          }))
        ];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des marques:', error.message);
        alert('Impossible de charger les marques. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllModeleActives() {
    this.modeleService.getModelesActives().subscribe({
      next: (modeles) => {
        this.modeles = [
          { value: '0', label: 'Tous' },  // Option "Tous" ajoutée au début
          ...modeles.map(modele => ({
            value: modele._id,
            label: modele.libelle
          }))
        ];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des marques:', error.message);
        alert('Impossible de charger les marques. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllTypeTransmissionActives() {
    this.typeTransmissionService.getTypeTransmissionsActives().subscribe({
      next: (typeTransmissions) => {
        this.typeTransmissions = [
          { value: '0', label: 'Tous' },  // Option "Tous" ajoutée au début
          ...typeTransmissions.map(typeTransmission => ({
            value: typeTransmission._id,
            label: typeTransmission.libelle
          }))
        ];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des marques:', error.message);
        alert('Impossible de charger les marques. Veuillez réessayer plus tard.');
      }
    });
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedStocks = this.stocks.slice(startIndex, endIndex);
  }


  async addNewMouvementAsync(): Promise<GestionStock | undefined> {
    if (this.newStock) {
      console.log(this.newStock);
      try {
        var entree = 0;
        var sortie = 0;
        if(this.newStock.type == '0')
        sortie = this.newStock.quantite;
        else 
          entree = this.newStock.quantite;

        const gestionStock = await firstValueFrom(this.gestionStockService.addGestionStock(this.newStock.id_piece, this.newStock.marque_piece, this.newStock.id_marque, this.newStock.id_modele, this.newStock.id_type_transmission, entree, sortie, this.newStock.prixUnitaire));
        console.log('GestionStock ajoutée avec succès:', gestionStock);
        this.stocks.push(gestionStock);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.stocks.length > startIndex && this.stocks.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.stocks.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newStock = { id_piece: '', marque_piece: '', id_marque: '', id_modele: '', id_type_transmission: '', quantite: 0, type: '' };
        return gestionStock;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la gestionStock:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    console.log("type: " + this.newStock.type);
    const data = {
      title: 'Faire un mouvement de stock',
      fields: [
        {
          name: 'id_piece', label: 'Piece', type: 'select', required: true, defaultValue: this.newStock.id_piece,
          options: this.pieces
        },
        { name: 'marque_piece', label: 'Marque Piece', type: 'text', required: true, defaultValue: this.newStock.marque_piece },
        {
          name: 'id_marque', label: 'Marque voiture', type: 'select', required: true, defaultValue: this.newStock.id_marque,
          options: this.marques
        },
        {
          name: 'id_modele', label: 'Modele', type: 'select', required: true, defaultValue: this.newStock.id_modele,
          options: this.modeles
        },
        {
          name: 'id_type_transmission', label: 'Type Transmission', type: 'select', required: true, defaultValue: this.newStock.id_type_transmission,
          options: this.typeTransmissions
        },
        {
          name: 'type', label: 'Type', type: 'select', required: true, defaultValue: this.newStock.type,
          options: [
            {value: '1', label: "Entrée"},
            {value: '0', label: "Sortie"},
          ]
        },
        
        { name: 'quantite', label: 'Quantité(s)', type: 'number', required: true, defaultValue: this.newStock.quantite },
        { name: 'prixUnitaire', label: 'Prix unitaire', type: 'text', required: true, defaultValue: this.newStock.prixUnitaire },
      ],
      submitText: 'Ajouter',
      errorMessage: errorMessage,
    };

    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '400px',
      data: data,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          console.log('Données du formulaire:', result);
          this.newStock = result;
          await this.addNewMouvementAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
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