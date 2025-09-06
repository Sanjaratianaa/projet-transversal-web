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
import { MarqueService } from 'src/app/services/caracteristiques/marque.service';
import { Marque } from 'src/app/services/caracteristiques/marque.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-marque',
  standalone: true,
  templateUrl: './marque.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class MarqueComponent {
  displayedColumns: string[] = ['Libelle', "Date d'enregistrement", "Manager", "Date Suppression", "Manager Suppression", "Statut", 'actions'];
  marques: Marque[];
  isAdmin: boolean = false;

  paginatedMarques: Marque[] = [];

  // Nouveau employé à ajouter
  newMarque: string = "";

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog, private marqueService: MarqueService) { }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role != "manager") {
      this.displayedColumns = ['Libelle'];
      this.getAllMarquesActives();
    }
    else {
      this.isAdmin = true;
      this.getAllMarques();
    }
  }

  getAllMarques() {
    this.marqueService.getMarques().subscribe({
      next: (marques) => {
        this.marques = marques;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des marques:', error.message);
        alert('Impossible de charger les marques. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllMarquesActives() {
    this.marqueService.getMarquesActives().subscribe({
      next: (marques) => {
        this.marques = marques;
        this.updatePagination();
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
    this.paginatedMarques = this.marques.slice(startIndex, endIndex);
  }


  async addNewMarqueAsync(): Promise<Marque | undefined> {
    if (this.newMarque) {
      console.log(this.newMarque);
      try {
        const marque = await firstValueFrom(this.marqueService.addMarque(this.newMarque.trim()));
        console.log('Marque ajoutée avec succès:', marque);
        this.marques.push(marque);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.marques.length > startIndex && this.marques.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.marques.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newMarque = "";
        return marque;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la marque:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter un nouveau Marque',
      fields: [
        { name: 'libelle', label: 'Marque', type: 'text', required: true, defaultValue: this.newMarque },
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
          this.newMarque = result.libelle;
          await this.addNewMarqueAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(marque: Marque, errorMessage: string = ''): Promise<void> {
    const data = {
      title: 'Modifier un marque',
      fields: [
        { name: 'libelle', label: 'Marque', type: 'text', required: true, defaultValue: marque.libelle }
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
        
        // Fusionner les données existantes de la marque avec les modifications
        const updatedData = { ...marque, libelle: result.libelle.trim() };
        console.log(updatedData);

        // Attendre la mise à jour via le service
        const updatedMarque = await firstValueFrom(this.marqueService.updateMarque(updatedData));

        // Mettre à jour la liste locale
        const index = this.marques.findIndex(mq => mq._id === marque._id);
        if (index !== -1) {
          this.marques[index] = updatedMarque;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(marque, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editMarque(marque: Marque) {
    await this.openEditModal(marque);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(marque: Marque): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer "${ marque.libelle }" comme marque ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteMarque(marque._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteMarque(marqueId: string) {
  
    try {
      // Appel API pour supprimer la marque
      const deletedMarque = await lastValueFrom(this.marqueService.deleteMarque(marqueId));

      // Vérification si la suppression a bien été effectuée
      if (deletedMarque && deletedMarque.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.marques.findIndex(mq => mq._id === marqueId);
        if (index !== -1) {
          this.marques[index] = deletedMarque; // Mettre à jour l'objet avec la version renvoyée
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