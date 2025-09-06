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
import { ServiceService } from 'src/app/services/services/service.service';
import { Service } from 'src/app/services/services/service.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-service',
  standalone: true,
  templateUrl: './service.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class ServiceComponent {
  displayedColumns: string[] = ['Libelle', "Date d'enregistrement", "Manager", "Date Suppression", "Manager Suppression", "Statut", 'actions'];
  services: Service[];
  isAdmin: boolean = false;

  paginatedServices: Service[] = [];

  // Nouveau employé à ajouter
  newService: string = "";

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(private dialog: MatDialog, private serviceService: ServiceService) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role == "manager")
      this.isAdmin = true;
    else
      this.displayedColumns = ['Libelle'];
    // Initialisez la pagination au chargement du composant
    this.getAllServices();
  }

  getAllServices() {
    const observable = this.isAdmin
      ? this.serviceService.getServices()
      : this.serviceService.getServicesActives();
    observable.subscribe({
      next: (services) => {
        this.services = services;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des services:', error.message);
        alert('Impossible de charger les services. Veuillez réessayer plus tard.');
      }
    });
  }

  updatePagination() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedServices = this.services.slice(startIndex, endIndex);
  }


  async addNewServiceAsync(): Promise<Service | undefined> {
    if (this.newService) {
      console.log(this.newService);
      try {
        const service = await firstValueFrom(this.serviceService.addService(this.newService.trim()));
        console.log('Service ajoutée avec succès:', service);
        this.services.push(service);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.services.length > startIndex && this.services.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.services.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newService = "";
        return service;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la service:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter un nouveau Service',
      fields: [
        { name: 'libelle', label: 'Service', type: 'text', required: true, defaultValue: this.newService },
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
          this.newService = result.libelle;
          await this.addNewServiceAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(service: Service, errorMessage: string = ''): Promise<void> {
    const data = {
      title: 'Modifier un service',
      fields: [
        { name: 'libelle', label: 'Service', type: 'text', required: true, defaultValue: service.libelle }
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

        // Fusionner les données existantes de la service avec les modifications
        const updatedData = { ...service, libelle: result.libelle.trim() };
        console.log(updatedData);

        // Attendre la mise à jour via le service
        const updatedService = await firstValueFrom(this.serviceService.updateService(updatedData));

        // Mettre à jour la liste locale
        const index = this.services.findIndex(mq => mq._id === service._id);
        if (index !== -1) {
          this.services[index] = updatedService;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(service, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editService(service: Service) {
    await this.openEditModal(service);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(service: Service): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer "${service.libelle}" comme service ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteService(service._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteService(serviceId: string) {

    try {
      // Appel API pour supprimer la service
      const deletedService = await lastValueFrom(this.serviceService.deleteService(serviceId));

      // Vérification si la suppression a bien été effectuée
      if (deletedService && deletedService.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.services.findIndex(mq => mq._id === serviceId);
        if (index !== -1) {
          this.services[index] = deletedService; // Mettre à jour l'objet avec la version renvoyée
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