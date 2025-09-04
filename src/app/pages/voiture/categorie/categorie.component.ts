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
import { CategorieService } from 'src/app/services/caracteristiques/categorie.service';
import { Categorie } from 'src/app/services/caracteristiques/categorie.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-categorie',
  standalone: true,
  templateUrl: './categorie.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class CategorieComponent {
  displayedColumns: string[] = ['Libelle', "Date d'enregistrement", "Manager", "Date Suppression", "Manager Suppression", "Statut", 'actions'];
  categories: Categorie[];
  isAdmin: boolean = false;

  paginatedCategories: Categorie[] = [];

  // Nouveau employé à ajouter
  newCategorie: string = "";

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog, private categorieService: CategorieService) { }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role != "manager") {
      this.displayedColumns = ['Libelle'];
      this.getAllCategoriesActives()
    }
    else {
      this.isAdmin = true;
      this.getAllCategories();
    }
  }

  getAllCategories() {
    this.categorieService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des categories:', error.message);
        alert('Impossible de charger les categories. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllCategoriesActives() {
    this.categorieService.getCategoriesActives().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des categories:', error.message);
        alert('Impossible de charger les categories. Veuillez réessayer plus tard.');
      }
    });
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCategories = this.categories.slice(startIndex, endIndex);
  }


  async addNewCategorieAsync(): Promise<Categorie | undefined> {
    if (this.newCategorie) {
      console.log(this.newCategorie);
      try {
        const categorie = await firstValueFrom(this.categorieService.addCategorie(this.newCategorie.trim()));
        console.log('Categorie ajoutée avec succès:', categorie);
        this.categories.push(categorie);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.categories.length > startIndex && this.categories.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.categories.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newCategorie = "";
        return categorie;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la categorie:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter un nouveau Categorie',
      fields: [
        { name: 'libelle', label: 'Categorie', type: 'text', required: true, defaultValue: this.newCategorie },
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
          this.newCategorie = result.libelle;
          await this.addNewCategorieAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(categorie: Categorie, errorMessage: string = ''): Promise<void> {
    const data = {
      title: 'Modifier un categorie',
      fields: [
        { name: 'libelle', label: 'Categorie', type: 'text', required: true, defaultValue: categorie.libelle }
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

        // Fusionner les données existantes de la categorie avec les modifications
        const updatedData = { ...categorie, libelle: result.libelle.trim() };
        console.log(updatedData);

        // Attendre la mise à jour via le service
        const updatedCategorie = await firstValueFrom(this.categorieService.updateCategorie(updatedData));

        // Mettre à jour la liste locale
        const index = this.categories.findIndex(mq => mq._id === categorie._id);
        if (index !== -1) {
          this.categories[index] = updatedCategorie;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(categorie, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editCategorie(categorie: Categorie) {
    await this.openEditModal(categorie);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(categorie: Categorie): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer "${categorie.libelle}" comme categorie ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCategorie(categorie._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteCategorie(categorieId: string) {

    try {
      // Appel API pour supprimer la categorie
      const deletedCategorie = await lastValueFrom(this.categorieService.deleteCategorie(categorieId));

      // Vérification si la suppression a bien été effectuée
      if (deletedCategorie && deletedCategorie.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.categories.findIndex(mq => mq._id === categorieId);
        if (index !== -1) {
          this.categories[index] = deletedCategorie; // Mettre à jour l'objet avec la version renvoyée
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