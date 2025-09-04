import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { GenericModalComponent } from '../../components/modal-generique/add-modal/modal.component';
import { DeleteConfirmationModalComponent } from '../../components/modal-generique/confirm-modal/delete-confirmation-modal.component';
import { PersonneService, Utilisateur } from 'src/app/services/personne/personne.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-mecanicien',
  standalone: true,
  templateUrl: './personne.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class PersonneComponent {
  displayedColumns: string[] = ['Nom', "Prenoms", "Email", "Date Naissance", "Lieu Naissance", "Date Embauche", "Matricule", "Date Suppression", "Statut", 'actions'];
  utilisateurs: Utilisateur[];
  isAdmin: boolean = false;

  paginatedUtilisateurs: Utilisateur[] = [];

  // Nouveau employé à ajouter
  newPersonne: any = {};

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog, private personneService: PersonneService) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role == "manager")
      this.isAdmin = true;
    else
      this.displayedColumns = ['Nom', "Prenoms", "Email", "Date Naissance", "Lieu Naissance", "Date Embauche", "Matricule"];

    // Initialisez la pagination au chargement du composant
    this.getAllEmployés();
  }

  getAllEmployés() {
    const observable = this.isAdmin
      ? this.personneService.getAllByRole('mécanicien')
      : this.personneService.getActiveByRole('mécanicien');

    observable.subscribe({
      next: (utilisateurs) => {
        console.log(utilisateurs);
        this.utilisateurs = utilisateurs;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error.message);
        alert('Impossible de charger les utilisateurs. Veuillez réessayer plus tard.');
      }
    });

  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUtilisateurs = this.utilisateurs.slice(startIndex, endIndex);
  }


  async addNewPersonneAsync() {
    if (this.newPersonne) {
      console.log(this.newPersonne);
      try {
        const personne = await firstValueFrom(this.personneService.addPersonne(this.newPersonne));
        console.log('Personne ajoutée avec succès:', personne);
        this.utilisateurs.push(personne);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.utilisateurs.length > startIndex && this.utilisateurs.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.utilisateurs.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newPersonne = "";
        return personne;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la personne:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {

    console.log(this.newPersonne);

    const data = {
      title: 'Ajouter un nouveau Personne',
      fields: [
        { name: 'nom', label: 'Nom', type: 'text', required: true, defaultValue: this.newPersonne.nom },
        { name: 'prenom', label: 'Prenoms', type: 'text', required: true, defaultValue: this.newPersonne.prenom },
        { name: 'email', label: 'Email', type: 'email', required: true, defaultValue: this.newPersonne.email },
        { name: 'numeroTelephone', label: 'Numero de téléphone', type: 'text', required: true, defaultValue: this.newPersonne.numeroTelephone },
        { name: 'dateDeNaissance', label: 'Date de naissance', type: 'date', required: true, defaultValue: this.newPersonne.dateDeNaissance },
        { name: 'lieuDeNaissance', label: 'Lieu de naissance', type: 'text', required: true, defaultValue: this.newPersonne.lieuDeNaissance },
        { name: 'dateEmbauche', label: "Date d'embauche", type: 'date', required: true, defaultValue: this.newPersonne.dateEmbauche },
        {
          name: 'genre', label: 'Genre', type: 'select', required: true,
          options: [
            { value: "Homme", label: "Homme" },
            { value: "Femme", label: "Femme" }
          ]
        },
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
          this.newPersonne = {
            nom: result.nom,
            prenom: result.prenom,
            dateDeNaissance: result.dateDeNaissance,
            lieuDeNaissance: result.lieuDeNaissance,
            genre: result.genre,
            etat: "Active",
            numeroTelephone: result.numeroTelephone,
            email: result.email,
            motDePasse: "",
            idRole: "Mécanicien",
            dateEmbauche: result.dateEmbauche
          };

          await this.addNewPersonneAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(utilisateur: Utilisateur, errorMessage: string = ''): Promise<void> {
    const data = {
      title: 'Modifier une personne',
      fields: [
        { name: 'nom', label: 'Nom', type: 'text', required: true, defaultValue: utilisateur.personne.nom },
        { name: 'prenom', label: 'Prenoms', type: 'text', required: true, defaultValue: utilisateur.personne.prenom },
        { name: 'email', label: 'Email', type: 'email', required: true, defaultValue: utilisateur.personne.email },
        { name: 'numeroTelephone', label: 'Numero de téléphone', type: 'text', required: true, defaultValue: utilisateur.personne.numeroTelephone },
        { name: 'dateDeNaissance', label: 'Date de naissance', type: 'date', required: true, defaultValue: utilisateur.personne.dateDeNaissance ? new Date(utilisateur.personne.dateDeNaissance).toISOString().split('T')[0] : "" },
        { name: 'lieuDeNaissance', label: 'Lieu de naissance', type: 'text', required: true, defaultValue: utilisateur.personne.lieuDeNaissance },
        { name: 'dateEmbauche', label: "Date d'embauche", type: 'date', required: true, defaultValue: utilisateur.dateEmbauche ? new Date(utilisateur.dateEmbauche).toISOString().split('T')[0] : "" },
        {
          name: 'genre', label: 'Genre', type: 'select', required: true, defaultValue: utilisateur.personne.genre,
          options: [
            { value: "Homme", label: "Homme" },
            { value: "Femme", label: "Femme" }
          ]
        },
      ],
      submitText: 'Modifier',
      errorMessage: errorMessage
    };

    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '600px',
      data: data,
    });

    try {
      // Attendre la fermeture de la modale et récupérer les données saisies
      const result = await firstValueFrom(dialogRef.afterClosed());

      if (result) {
        console.log('Modification enregistrée:', result);

        // Fusionner les données existantes de la personne avec les modifications
        const updatedData = {
          ...utilisateur, personne: {
            ...utilisateur.personne, nom: result.nom, prenom: result.prenom, dateDeNaissance: result.dateDeNaissance,
            lieuDeNaissance: result.lieuDeNaissance, genre: result.genre, numeroTelephone: result.numeroTelephone,
            email: result.email
          }, dateEmbauche: result.dateEmbauche
        };

        // Attendre la mise à jour via le service
        const updatedPersonne = await firstValueFrom(this.personneService.updatePersonne(updatedData));
        console.log(updatedPersonne);

        // Mettre à jour la liste locale
        const index = this.utilisateurs.findIndex(mq => mq._id === utilisateur._id);
        if (index !== -1) {
          this.utilisateurs[index] = updatedPersonne;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(utilisateur, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editUtilisateur(utilisateur: Utilisateur) {
    await this.openEditModal(utilisateur);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(utilisateur: Utilisateur): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer "${utilisateur.personne.nom}" comme mécanicien ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUtilisateur(utilisateur._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteUtilisateur(utilisateurId: string) {

    try {
      // Appel API pour supprimer la personne
      const deletedUtilisateur = await lastValueFrom(this.personneService.deletePersonne(utilisateurId));

      // Vérification si la suppression a bien été effectuée
      if (deletedUtilisateur && deletedUtilisateur?.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.utilisateurs.findIndex(mq => mq._id === utilisateurId);
        if (index !== -1) {
          this.utilisateurs[index] = deletedUtilisateur; // Mettre à jour l'objet avec la version renvoyée
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