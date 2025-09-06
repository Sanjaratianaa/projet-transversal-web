import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';  // Assurez-vous que FormsModule est bien importé ici
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ServiceService } from 'src/app/services/services/service.service';
import { SousServiceService } from 'src/app/services/services/sousService.service';
import { Specialite, SpecialiteService } from 'src/app/services/personne/specialite.service';
import { PersonneService } from 'src/app/services/personne/personne.service';
import { SpecialiteModalComponent } from './add-specialite/specialite-modal.component';
import { DeleteConfirmationModalComponent } from 'src/app/components/modal-generique/confirm-modal/delete-confirmation-modal.component';


@Component({
  selector: 'app-specialite',
  standalone: true,
  templateUrl: './specialite.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class SpecialiteComponent {
  columns: string[] = ['Service', 'Specialite', 'Mecanicien', 'Date d\'enregistrement', 'Manager', 'Date suppression', 'Manager Suppression', 'Statut', 'actions'];

  specialites: Specialite[];
  services: any[] = [];
  sousServices: any[] = [];
  mecaniciens: any[] = [];
  isAdmin: boolean = false;

  paginatedSpecialites: Specialite[] = [];

  newSpecialite: any = { id_sous_service: '', id_service: '', id_mecanicien: '' };

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private dialog: MatDialog,
    private specialiteService: SpecialiteService,
    private serviceService: ServiceService,
    private sousServiceService: SousServiceService,
    private mecanicienService: PersonneService
  ) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role == "manager") {
      this.isAdmin = true;
    }
    else
      this.columns = ['Service', 'Specialite', 'Mecanicien', 'Date d\'enregistrement', 'Manager'];
    // Initialisez la pagination au chargement du composant
    this.getAllMecaniciensActives();
    this.getAllSpecialite();
    this.getAllServicesActives();
    this.getAllSousServicesActives();
  }

  getAllMecaniciensActives() {
    this.mecanicienService.getActiveByRole("mécanicien").subscribe({
      next: (mecaniciens) => {

        console.log(mecaniciens);
        this.mecaniciens = mecaniciens.map(mecanicien => ({
          value: mecanicien._id,
          label: `${mecanicien.personne.prenom} ${mecanicien.personne.nom}`
        }));

        // this.mecaniciens = mecaniciens;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des mecaniciens:', error.message);
        alert('Impossible de charger les mecaniciens. Veuillez réessayer plus tard.');
      }
    });

  }

  getAllSpecialite() {
    const observable = this.isAdmin
      ? this.specialiteService.getSpecialites()
      : this.specialiteService.getSpecialitesActives();

    observable.subscribe({
      next: (specialites) => {
        console.log(specialites);
        this.specialites = specialites;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement du liste des specialites:', error.message);
        alert('Impossible de charger la liste des specialites. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllServicesActives() {
    this.serviceService.getServicesActives().subscribe({
      next: (services) => {
        this.services = services.map(service => ({
          value: service._id,
          label: service.libelle
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des services:', error.message);
        alert('Impossible de charger les services. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllSousServicesActives() {
    this.sousServiceService.getSousServicesActives().subscribe({
      next: (sousServices) => {
        this.sousServices = sousServices.map(sousService => ({
          value: sousService._id,
          label: sousService.libelle,
          serviceId: sousService.service._id
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des sous Services:', error.message);
        alert('Impossible de charger les sous Services. Veuillez réessayer plus tard.');
      }
    });
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSpecialites = this.specialites.slice(startIndex, endIndex);
  }


  async addNewSpecialiteAsync(): Promise<Specialite | undefined> {
    if (this.newSpecialite) {
      console.log(this.newSpecialite);
      try {
        const specialite = await firstValueFrom(this.specialiteService.addSpecialite(this.newSpecialite.id_sous_service, this.newSpecialite.id_mecanicien));
        console.log('specialite ajoutée avec succès:', specialite);

        this.specialites.push(specialite);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.specialites.length > startIndex && this.specialites.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.specialites.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newSpecialite = { id_sous_service: '', id_service: '', id_mecanicien: '' };
        return specialite;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la service:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    // this.newSpecialite = { id_sous_service: '', id_service: '', id_mecanicien: '' };
    const data = {
      title: 'Ajouter une spécialité à un mécanicien',
      fields: [
        {
          name: 'id_service', label: 'Service', type: 'select', required: true,
          options: this.services, defaultValue: this.newSpecialite.id_service
        },
        {
          name: 'id_sous_service', label: 'Sous-service', type: 'select', required: true,
          options: this.sousServices, defaultValue: this.newSpecialite.id_sous_service
        },
        {
          name: 'id_mecanicien', label: 'Mecanicien', type: 'select', required: true,
          options: this.mecaniciens, defaultValue: this.newSpecialite.id_mecanicien
        }
      ],
      submitText: 'Ajouter',
      errorMessage: errorMessage
    };

    const dialogRef = this.dialog.open(SpecialiteModalComponent, {
      width: '400px',
      data: data,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          console.log('Données du formulaire:', result);
          this.newSpecialite = result;
          await this.addNewSpecialiteAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(specialite: Specialite, errorMessage: string = ''): Promise<void> {

    console.log(specialite);
    const data = {
      title: 'Modifier une spécialité',
      fields: [
        {
          name: 'id_service', label: 'Service', type: 'select', required: true,
          options: this.services, defaultValue: specialite.sousService.service._id
        },
        {
          name: 'id_sous_service', label: 'Sous-service', type: 'select', required: true,
          options: this.sousServices, defaultValue: specialite.sousService._id
        },
        {
          name: 'id_mecanicien', label: 'Mecanicien', type: 'select', required: true,
          options: this.mecaniciens, defaultValue: specialite.mecanicien?._id
        }
      ],
      submitText: 'Modifier',
      errorMessage: errorMessage
    };

    const dialogRef = this.dialog.open(SpecialiteModalComponent, {
      width: '400px',
      data: data,
    });

    try {
      // Attendre la fermeture de la modale et récupérer les données saisies
      const result = await firstValueFrom(dialogRef.afterClosed());

      if (result) {
        console.log('Modification enregistrée:', result);
        // Fusionner les données existantes de la specialite avec les modifications
        const updatedData = {
          ...specialite, sousService: result.id_sous_service,
          mecanicien: result.id_mecanicien
        };
        console.log(updatedData);

        // Attendre la mise à jour via le specialite
        const updatedService = await firstValueFrom(this.specialiteService.updateSpecialite(updatedData));

        // Mettre à jour la liste locale
        const index = this.specialites.findIndex(mq => mq._id === specialite._id);
        if (index !== -1) {
          this.specialites[index] = updatedService;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(specialite, error.message);
    }
  }

  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editSpecialite(specialite: Specialite) {
    await this.openEditModal(specialite);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(specialite: Specialite): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer le specialité "${specialite.sousService.libelle}" comme specialité pour le "${specialite.mecanicien?.personne.prenom} ${specialite.mecanicien?.personne.nom}" ? 
            Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("hamafa eoo")
        this.deleteSpecialite(specialite._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteSpecialite(specialiteId: string) {

    try {
      // Appel API pour supprimer la service
      const deletedSpecialite = await lastValueFrom(this.specialiteService.deleteSpecialite(specialiteId));
      console.log(deletedSpecialite);

      // Vérification si la suppression a bien été effectuée
      if (deletedSpecialite && deletedSpecialite.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.specialites.findIndex(mq => mq._id === specialiteId);
        if (index !== -1) {
          this.specialites[index] = deletedSpecialite; // Mettre à jour l'objet avec la version renvoyée
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