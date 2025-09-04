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
import { ModeleService } from 'src/app/services/caracteristiques/modele.service';
import { Modele } from 'src/app/services/caracteristiques/modele.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-modele',
  standalone: true,
  templateUrl: './modele.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class ModeleComponent {
  displayedColumns: string[] = ['Libelle', "Date d'enregistrement", "Manager", "Date Suppression", "Manager Suppression", "Statut", 'actions'];
  modeles: Modele[];
  isAdmin: boolean = false;

  paginatedModeles: Modele[] = [];

  // Nouveau employé à ajouter
  newModele: string = "";

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog, private modeleService: ModeleService) { }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role != "manager")
      this.displayedColumns = ['Libelle'];
    else
      this.isAdmin = true;
    this.getAllModeles();
  }

  getAllModeles() {
    const observable = this.isAdmin
      ? this.modeleService.getModeles()
      : this.modeleService.getModelesActives();
    observable.subscribe({
      next: (modeles) => {
        this.modeles = modeles;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des modeles:', error.message);
        alert('Impossible de charger les modeles. Veuillez réessayer plus tard.');
      }
    });
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedModeles = this.modeles.slice(startIndex, endIndex);
  }


  async addNewModeleAsync(): Promise<Modele | undefined> {
    if (this.newModele) {
      console.log(this.newModele);
      try {
        const modele = await firstValueFrom(this.modeleService.addModele(this.newModele.trim()));
        console.log('Modele ajoutée avec succès:', modele);
        this.modeles.push(modele);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.modeles.length > startIndex && this.modeles.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.modeles.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newModele = "";
        return modele;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la modele:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter un nouveau Modele',
      fields: [
        { name: 'libelle', label: 'Modele', type: 'text', required: true, defaultValue: this.newModele },
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
          this.newModele = result.libelle;
          await this.addNewModeleAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(modele: Modele, errorMessage: string = ''): Promise<void> {
    const data = {
      title: 'Modifier un modele',
      fields: [
        { name: 'libelle', label: 'Modele', type: 'text', required: true, defaultValue: modele.libelle }
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

        // Fusionner les données existantes de la modele avec les modifications
        const updatedData = { ...modele, libelle: result.libelle.trim() };
        console.log(updatedData);

        // Attendre la mise à jour via le service
        const updatedModele = await firstValueFrom(this.modeleService.updateModele(updatedData));

        // Mettre à jour la liste locale
        const index = this.modeles.findIndex(mq => mq._id === modele._id);
        if (index !== -1) {
          this.modeles[index] = updatedModele;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(modele, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editModele(modele: Modele) {
    await this.openEditModal(modele);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(modele: Modele): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer "${modele.libelle}" comme modele ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteModele(modele._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteModele(modeleId: string) {

    try {
      // Appel API pour supprimer la modele
      const deletedModele = await lastValueFrom(this.modeleService.deleteModele(modeleId));

      // Vérification si la suppression a bien été effectuée
      if (deletedModele && deletedModele.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.modeles.findIndex(mq => mq._id === modeleId);
        if (index !== -1) {
          this.modeles[index] = deletedModele; // Mettre à jour l'objet avec la version renvoyée
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