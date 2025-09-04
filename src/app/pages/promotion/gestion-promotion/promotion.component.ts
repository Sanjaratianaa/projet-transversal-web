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
import { Promotion, PromotionService } from 'src/app/services/promotion/promotion.service';
import { PromotionModalComponent } from '../add-promotion-modal/promotion-modal.component';


@Component({
  selector: 'app-promotion',
  standalone: true,
  templateUrl: './promotion.component.html',
  imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class PromotionComponent {
  columns: string[] = ['service', 'sous service', 'dateDebut', 'dateFin', 'remise', 'Manager', 'Date d\'enregistrement', 'actions'];

  promotions: Promotion[];
  services: any[] = [];
  sousServices: any[] = [];

  paginatedPromotions: Promotion[] = [];

  newPromotion: any = {id_sous_service: '', dateDebut: null, dateFin: null, remise: 0};

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private dialog: MatDialog, 
    private promotionService: PromotionService,
    private serviceService: ServiceService, 
    private sousServiceService: SousServiceService
  ) { }

  ngOnInit() {
    // Initialisez la pagination au chargement du composant
    this.getAllServicesActives();
    this.getAllSousServicesActives();
    this.getAllPromotion();
  }

  getAllPromotion() {
    this.promotionService.getPromotions().subscribe({
      next: (promotions) => {
        console.log(promotions);
        this.promotions = promotions;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des promotions des sous services:', error.message);
        alert('Impossible de charger les promotions sous services. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllServicesActives() {
    this.serviceService.getServicesActives().subscribe({
        next: (services) => {
          console.log(services);
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
          console.log(sousServices);
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
    this.paginatedPromotions = this.promotions.slice(startIndex, endIndex);
  }


  async addNewPromotionAsync() {
    if (this.newPromotion) {
      console.log(this.newPromotion);
      try {
        const prix = await firstValueFrom(this.promotionService.addPromotion(this.newPromotion.id_sous_service, this.newPromotion.dateDebut, this.newPromotion.dateFin, this.newPromotion.remise));
        console.log('prix ajoutée avec succès:', prix);
        this.promotions.push(prix);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.promotions.length > startIndex && this.promotions.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.promotions.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newPromotion = {id_sous_service: '', date: null, prix: 0};
      } catch (error: any) {
        console.error('Erreur lors de l’ajout de la service:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
  }

  async openModal(errorMessage: string = '') {
    console.log("eoo ejj");
    const data = {
      title: 'Ajouter une promotion',
      fields: [
        {
          name: 'id_service', label: 'Service', type: 'select', required: true,
          options: this.services, defaultValue: this.newPromotion.id_service
        },
        {
          name: 'id_sous_service', label: 'Sous-service', type: 'select', required: true,
          options: this.sousServices, defaultValue: this.newPromotion.id_sous_service
        },
        {
          name: "remise",
          label: "Remise en %",
          type: "number",
          required: true,
          defaultValue: this.newPromotion.remise  // Valeur par défaut pour le champ remise
        },
        {
          name: "dateDebut",
          label: "Date debut",
          type: "date",
          required: true,
          defaultValue: this.newPromotion.dateDebut  // Valeur par défaut pour le champ date
        },
        {
          name: "dateFin",
          label: "Date fin",
          type: "date",
          required: true,
          defaultValue: this.newPromotion.dateFin  // Valeur par défaut pour le champ date
        }
      ],
      submitText: 'Ajouter',
      errorMessage: errorMessage
    };

    const dialogRef = this.dialog.open(PromotionModalComponent, {
      width: '400px',
      data: data,
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          console.log('Données du formulaire:', result);
          this.newPromotion = result;
          await this.addNewPromotionAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(promotion: Promotion, errorMessage: string = ''): Promise<void> {
    console.log("editttttttttttttt");
    console.log(promotion);
    const data = {
      title: 'Modifier une promotion',
      fields: [
        {
          name: 'id_service', label: 'Service', type: 'select', required: true,
          options: this.services, defaultValue: promotion.sousService.service._id 
        },
        {
          name: 'id_sous_service', label: 'Sous-service', type: 'select', required: true,
          options: this.sousServices, defaultValue: promotion.sousService._id 
        },
        {
          name: "remise",
          label: "Remise en %",
          type: "number",
          required: true,
          defaultValue: promotion.remise  // Valeur par défaut pour le champ remise
        },
        {
          name: "dateDebut",
          label: "Date debut",
          type: "date",
          required: true,
          defaultValue: promotion.dateDebut ? new Date(promotion.dateDebut).toISOString().split('T')[0] : ""  // Valeur par défaut pour le champ date
        },
        {
          name: "dateFin",
          label: "Date fin",
          type: "date",
          required: true,
          defaultValue: promotion.dateFin ? new Date(promotion.dateFin).toISOString().split('T')[0] : ""  // Valeur par défaut pour le champ date
        }
      ],
      submitText: 'Modifier',
      errorMessage: errorMessage
    };

    const dialogRef = this.dialog.open(PromotionModalComponent, {
      width: '400px',
      data: data,
    });

    try {
      // Attendre la fermeture de la modale et récupérer les données saisies
      const result = await firstValueFrom(dialogRef.afterClosed());
      
      if (result) {
        console.log('Modification enregistrée:', result);
        // Fusionner les données existantes de la promotion avec les modifications
        const updatedData = { ...promotion, sousService: result.id_sous_service, 
          remise: result.remise, dateDebut: result.dateDebut, dateFin: result.dateFin};
        console.log(updatedData);


        // Attendre la mise à jour via le promotion
        const updatedService = await firstValueFrom(this.promotionService.updatePromotion(updatedData));

        // Mettre à jour la liste locale
        const index = this.promotions.findIndex(mq => mq._id === promotion._id);
        if (index !== -1) {
          this.promotions[index] = updatedService;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(promotion, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editPomotion(promotion: Promotion) {
    await this.openEditModal(promotion);
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