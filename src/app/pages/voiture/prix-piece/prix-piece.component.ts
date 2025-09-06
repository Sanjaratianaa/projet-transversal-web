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
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MarqueService } from 'src/app/services/caracteristiques/marque.service';
import { ModeleService } from 'src/app/services/caracteristiques/modele.service';
import { TypeTransmissionService } from 'src/app/services/caracteristiques/typeTransmission.service';
import { PieceService } from 'src/app/services/caracteristiques/piece.service';
import { PrixPiece, PrixPieceService } from 'src/app/services/caracteristiques/prixStock.service';


@Component({
  selector: 'app-prix-piece',
  standalone: true,
  templateUrl: './prix-piece.component.html',
  imports: [MatListModule, MatCardModule, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class PrixPieceComponent {
  displayedColumns: string[] = ['piece', "marquePiece", "marqueVoiture", "modeleVoiture", "typeTransmission", "prixUnitaire", "Date", "Manager", "Date d'enregistrement", "actions"];
  prixPieces: PrixPiece[];

  pieces: any[];
  marques: any[];
  modeles: any[];
  typeTransmissions: any[];

  paginatedPrixPieces: PrixPiece[] = [];

  // Nouveau stock à ajouter
  newPrixPiece: any = { id_piece: '', marque_piece: '', id_marque: '', id_modele: '', id_type_transmission: '', prixUnitaire: 0, date: '' };

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private dialog: MatDialog,
    private prixPieceService: PrixPieceService,
    private marqueService: MarqueService,
    private modeleService: ModeleService,
    private typeTransmissionService: TypeTransmissionService,
    private pieceService: PieceService
  ) { }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    this.getAllPrixPieces();
    this.getAllPieceActives();
    this.getAllMarqueActives();
    this.getAllModeleActives();
    this.getAllTypeTransmissionActives();
  }

  getAllPrixPieces() {
    this.prixPieceService.getPrixPieces().subscribe({
      next: (prixPieces) => {
        this.prixPieces = prixPieces;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des prixPieces:', error.message);
        alert('Impossible de charger les prixPieces. Veuillez réessayer plus tard.');
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
    this.paginatedPrixPieces = this.prixPieces.slice(startIndex, endIndex);
  }


  async addNewMouvementAsync(): Promise<PrixPiece | undefined> {
    if (this.newPrixPiece) {
      console.log(this.newPrixPiece);
      try {
        const prix = await firstValueFrom(this.prixPieceService.addPrixPiece(this.newPrixPiece.id_piece, this.newPrixPiece.marque_piece.trim(), this.newPrixPiece.id_marque, this.newPrixPiece.id_modele, this.newPrixPiece.id_type_transmission, this.newPrixPiece.prixUnitaire, this.newPrixPiece.date));
        console.log('PrixPiece ajoutée avec succès:', prix);
        this.prixPieces.push(prix);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.prixPieces.length > startIndex && this.prixPieces.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.prixPieces.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newPrixPiece = { id_piece: '', marque_piece: '', id_marque: '', id_modele: '', id_type_transmission: '', prixUnitaire: 0, date: '' };
        return prix;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la gestionStock:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    console.log("type: " + this.newPrixPiece.type);
    const data = {
      title: 'Ajouter un prix',
      fields: [
        {
          name: 'id_piece', label: 'Piece', type: 'select', required: true, defaultValue: this.newPrixPiece.id_piece,
          options: this.pieces
        },
        { name: 'marque_piece', label: 'Marque Piece', type: 'text', required: true, defaultValue: this.newPrixPiece.marque_piece },
        {
          name: 'id_marque', label: 'Marque voiture', type: 'select', required: true, defaultValue: this.newPrixPiece.id_marque,
          options: this.marques
        },
        {
          name: 'id_modele', label: 'Modele', type: 'select', required: true, defaultValue: this.newPrixPiece.id_modele,
          options: this.modeles
        },
        {
          name: 'id_type_transmission', label: 'Type Transmission', type: 'select', required: true, defaultValue: this.newPrixPiece.id_type_transmission,
          options: this.typeTransmissions
        },
        { name: 'prixUnitaire', label: 'Prix unitaire', type: 'text', required: true, defaultValue: this.newPrixPiece.prixUnitaire },
        { name: 'date', label: 'Date applicatif', type: 'date', required: true, defaultValue: this.newPrixPiece.date },
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
          this.newPrixPiece = result;
          await this.addNewMouvementAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(prixPiece: PrixPiece, errorMessage: string = ''): Promise<void> {

    console.log(prixPiece);
    const data = {
      title: 'Modifier un prix de piece',
      fields: [
        {
          name: 'id_piece', label: 'Piece', type: 'select', required: true, defaultValue: prixPiece.piece._id,
          options: this.pieces
        },
        { name: 'marque_piece', label: 'Marque Piece', type: 'text', required: true, defaultValue: prixPiece.marquePiece },
        {
          name: 'id_marque', label: 'Marque voiture', type: 'select', required: true, defaultValue: prixPiece?.marqueVoiture?._id ? prixPiece.marqueVoiture._id : '0',
          options: this.marques
        },
        {
          name: 'id_modele', label: 'Modele', type: 'select', required: true, defaultValue: prixPiece?.modeleVoiture?._id ? prixPiece.modeleVoiture._id : '0',
          options: this.modeles
        },
        {
          name: 'id_type_transmission', label: 'Type Transmission', type: 'select', required: true, defaultValue: prixPiece?.typeTransmission?._id ? prixPiece.typeTransmission._id : '0',
          options: this.typeTransmissions
        },
        { name: 'prixUnitaire', label: 'Prix unitaire', type: 'text', required: true, defaultValue: prixPiece.prixUnitaire },
        { name: 'date', label: 'Date applicatif', type: 'date', required: true, defaultValue: prixPiece.date ? new Date(prixPiece.date).toISOString().split('T')[0] : "" },
      ],
      submitText: 'Modifier',
      errorMessage: errorMessage,
    };

    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '400px',
      data: data,
    });

    try {
      // Attendre la fermeture de la modale et récupérer les données saisies
      const result = await firstValueFrom(dialogRef.afterClosed());
      
      if (result) {
        console.log('Modification enregistrée:', result);

        // Fusionner les données existantes de la prixPiece avec les modifications
        const updatedData = { ...prixPiece, piece: result.id_piece, marquePiece: result.marque_piece.trim(), marqueVoiture: result.id_marque,
        prixUnitaire: result.prixUnitaire, date: result.date, modeleVoiture: result.id_modele, typeTransmission: result.id_type_transmission};
        console.log(updatedData);

        // Attendre la mise à jour via le prixSousService
        const updatedPrixPiece = await firstValueFrom(this.prixPieceService.updatePrixPiece(updatedData));

        // Mettre à jour la liste locale
        const index = this.prixPieces.findIndex(mq => mq._id === prixPiece._id);
        if (index !== -1) {
          this.prixPieces[index] = updatedPrixPiece;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(prixPiece, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editPrix(prixPiece: PrixPiece) {
    await this.openEditModal(prixPiece);
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