import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';  // Assurez-vous que FormsModule est bien importé ici
import { GenericModalComponent } from '../../../components/modal-generique/add-modal/modal.component';
import { DeleteConfirmationModalComponent } from '../../../components/modal-generique/confirm-modal/delete-confirmation-modal.component';
import { PieceService } from 'src/app/services/caracteristiques/piece.service';
import { Piece } from 'src/app/services/caracteristiques/piece.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-piece',
  standalone: true,
  templateUrl: './piece.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class PieceComponent {
  displayedColumns: string[] = ['Libelle', "Date d'enregistrement", "Manager", "Date Suppression", "Manager Suppression", "Statut", 'actions'];
  pieces: Piece[];
  isAdmin: boolean = false;

  paginatedPieces: Piece[] = [];

  // Nouveau employé à ajouter
  newPiece: string = "";

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog, private pieceService: PieceService) { }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role != "manager")
      this.displayedColumns = ['Libelle'];
    else
    this.isAdmin = true;
    this.getAllPieces();
  }

  getAllPieces() {
    const observable = this.isAdmin
      ? this.pieceService.getPieces()
      : this.pieceService.getPiecesActives();
    observable.subscribe({
      next: (pieces) => {
        console.log(pieces);
        this.pieces = pieces;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des pieces:', error.message);
        alert('Impossible de charger les pieces. Veuillez réessayer plus tard.');
      }
    });

  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPieces = this.pieces.slice(startIndex, endIndex);
  }


  async addNewPieceAsync(): Promise<Piece | undefined> {
    if (this.newPiece) {
      console.log(this.newPiece);
      try {
        const piece = await firstValueFrom(this.pieceService.addPiece(this.newPiece.trim()));
        console.log('Piece ajoutée avec succès:', piece);
        this.pieces.push(piece);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.pieces.length > startIndex && this.pieces.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.pieces.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newPiece = "";
        return piece;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la piece:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter une nouvelle Piece',
      fields: [
        { name: 'libelle', label: 'Piece', type: 'text', required: true, defaultValue: this.newPiece },
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
          this.newPiece = result.libelle;
          await this.addNewPieceAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(piece: Piece, errorMessage: string = ''): Promise<void> {
    const data = {
      title: 'Modifier une piece',
      fields: [
        { name: 'libelle', label: 'Piece', type: 'text', required: true, defaultValue: piece.libelle }
      ],
      submitText: 'Modifier',
      errorMessage: errorMessage
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

        // Fusionner les données existantes de la piece avec les modifications
        const updatedData = { ...piece, libelle: result.libelle.trim() };
        console.log(updatedData);

        // Attendre la mise à jour via le service
        const updatedPiece = await firstValueFrom(this.pieceService.updatePiece(updatedData));

        // Mettre à jour la liste locale
        const index = this.pieces.findIndex(mq => mq._id === piece._id);
        if (index !== -1) {
          this.pieces[index] = updatedPiece;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(piece, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editPiece(piece: Piece) {
    await this.openEditModal(piece);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(piece: Piece): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer "${piece.libelle}" comme piece ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletePiece(piece._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deletePiece(pieceId: string) {

    try {
      // Appel API pour supprimer la piece
      const deletedPiece = await lastValueFrom(this.pieceService.deletePiece(pieceId));

      // Vérification si la suppression a bien été effectuée
      if (deletedPiece && deletedPiece.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.pieces.findIndex(mq => mq._id === pieceId);
        if (index !== -1) {
          this.pieces[index] = deletedPiece; // Mettre à jour l'objet avec la version renvoyée
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }

    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      const errorMessage = error.error?.message || 'Erreur inconnue lors de la suppression.';
      alert(errorMessage); // Affiche l'erreur à l'utilisateur
    }
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

@Component({
  selector: 'app-modal',
  template: `
  `,
})
export class ModalComponent {
  constructor(public dialog: MatDialog) { }

  close() {
    this.dialog.closeAll(); // Ferme la modale
  }
}