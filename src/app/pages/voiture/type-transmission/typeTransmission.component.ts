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
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { TypeTransmission, TypeTransmissionService } from 'src/app/services/caracteristiques/typeTransmission.service';


@Component({
  selector: 'app-type-transmission',
  standalone: true,
  templateUrl: './typeTransmission.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class TypeTransmissionComponent {
  displayedColumns: string[] = ['Libelle', "Date d'enregistrement", "Manager", "Date Suppression", "Manager Suppression", "Statut", 'actions'];
  typeTransmissions: TypeTransmission[];
  isAdmin: boolean = false;

  paginatedTypeTransmissions: TypeTransmission[] = [];

  // Nouveau employé à ajouter
  newTypeTransmission: string = "";

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog, private typeTransmissionService: TypeTransmissionService) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role != "manager")
      this.displayedColumns = ['Libelle'];
    else
    this.isAdmin = true;
    // Initialisez la pagination au chargement du composant
    this.getAllTypeTransmissions();
  }

  getAllTypeTransmissions() {
    const observable = this.isAdmin
      ? this.typeTransmissionService.getTypeTransmissions()
      : this.typeTransmissionService.getTypeTransmissionsActives();
    observable.subscribe({
      next: (typeTransmissions) => {
        this.typeTransmissions = typeTransmissions;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des typeTransmissions:', error.message);
        alert('Impossible de charger les typeTransmissions. Veuillez réessayer plus tard.');
      }
    });

  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTypeTransmissions = this.typeTransmissions.slice(startIndex, endIndex);
  }


  async addNewTypeTransmissionAsync(): Promise<TypeTransmission | undefined> {
    if (this.newTypeTransmission) {
      console.log(this.newTypeTransmission);
      try {
        const typeTransmission = await firstValueFrom(this.typeTransmissionService.addTypeTransmission(this.newTypeTransmission.trim()));
        console.log('TypeTransmission ajoutée avec succès:', typeTransmission);
        this.typeTransmissions.push(typeTransmission);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.typeTransmissions.length > startIndex && this.typeTransmissions.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.typeTransmissions.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newTypeTransmission = "";
        return typeTransmission;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la typeTransmission:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter un nouveau Type de Transmission',
      fields: [
        { name: 'libelle', label: 'Type Transmission', type: 'text', required: true, defaultValue: this.newTypeTransmission },
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
          this.newTypeTransmission = result.libelle;
          await this.addNewTypeTransmissionAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(typeTransmission: TypeTransmission, errorMessage: string = ''): Promise<void> {
    const data = {
      title: 'Modifier un type de transmission',
      fields: [
        { name: 'libelle', label: 'Type transmission', type: 'text', required: true, defaultValue: typeTransmission.libelle }
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

        // Fusionner les données existantes de la typeTransmission avec les modifications
        const updatedData = { ...typeTransmission, libelle: result.libelle.trim() };
        console.log(updatedData);

        // Attendre la mise à jour via le service
        const updatedTypeTransmission = await firstValueFrom(this.typeTransmissionService.updateTypeTransmission(updatedData));

        // Mettre à jour la liste locale
        const index = this.typeTransmissions.findIndex(mq => mq._id === typeTransmission._id);
        if (index !== -1) {
          this.typeTransmissions[index] = updatedTypeTransmission;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(typeTransmission, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editTypeTransmission(typeTransmission: TypeTransmission) {
    await this.openEditModal(typeTransmission);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(typeTransmission: TypeTransmission): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer "${typeTransmission.libelle}" comme typeTransmission ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTypeTransmission(typeTransmission._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteTypeTransmission(typeTransmissionId: string) {

    try {
      // Appel API pour supprimer la typeTransmission
      const deletedTypeTransmission = await lastValueFrom(this.typeTransmissionService.deleteTypeTransmission(typeTransmissionId));

      // Vérification si la suppression a bien été effectuée
      if (deletedTypeTransmission && deletedTypeTransmission.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.typeTransmissions.findIndex(mq => mq._id === typeTransmissionId);
        if (index !== -1) {
          this.typeTransmissions[index] = deletedTypeTransmission; // Mettre à jour l'objet avec la version renvoyée
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