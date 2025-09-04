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
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MarqueService } from 'src/app/services/caracteristiques/marque.service';
import { ModeleService } from 'src/app/services/caracteristiques/modele.service';
import { TypeTransmissionService } from 'src/app/services/caracteristiques/typeTransmission.service';
import { CategorieService } from 'src/app/services/caracteristiques/categorie.service';
import { DeleteConfirmationModalComponent } from 'src/app/components/modal-generique/confirm-modal/delete-confirmation-modal.component';
import { Voiture, VoitureService } from 'src/app/services/caracteristiques/voiture.sevice';


@Component({
  selector: 'app-voiture',
  standalone: true,
  templateUrl: './voiture.component.html',
  imports: [MatListModule, MatCardModule, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class VoitureComponent {
  displayedColumns: string[] = ["client", "marque", "modele", "categorie", "typeTransmission", "annee", "numeroImmatriculation", "kilometrage", 
    "puissanceMoteur", "cylindree", "capaciteReservoir", "pressionPneusRecommande", "Date d'enregistrement"
  ];
  voitures: Voiture[];
  client: boolean = false;

  marques: any[];
  modeles: any[];
  categories: any[];
  typeTransmissions: any[];

  paginatedVoitures: Voiture[] = [];

  // Nouveau stock à ajouter
  newVoiture: any = { id_marque: '', id_modele: '', id_categorie: '', id_type_transmission: '', annee: '', numeroImmatriculation: '', kilometrage: 0, 
    puissanceMoteur: 0, cylindree: 0, capaciteReservoir: 0, pressionPneusRecommande: '' 
  };

  // Paramètres de pagination
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];

  constructor(
    private dialog: MatDialog, 
    private voitureService: VoitureService,
    private marqueService: MarqueService,
    private modeleService: ModeleService,
    private typeTransmissionService: TypeTransmissionService,
    private categorieService: CategorieService
  ) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role == "client") {
      this.client = true;
      this.displayedColumns = ["marque", "modele", "categorie", "typeTransmission", "annee", "numeroImmatriculation", "kilometrage", 
        "puissanceMoteur", "cylindree", "capaciteReservoir", "pressionPneusRecommande", "Date d'enregistrement", "Date Suppression", "Statut", "actions"
      ];
    }

    // Initialisez la pagination au chargement du composant
    this.getAllVoitures();
    this.getAllCategorieActives();
    this.getAllMarqueActives();
    this.getAllModeleActives();
    this.getAllTypeTransmissionActives();
  }

  getAllVoitures() {
    this.voitureService.getVoituresByClient().subscribe({
      next: (voitures) => {
        console.log(voitures);
        this.voitures = voitures;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des voitures:', error.message);
        alert('Impossible de charger les voitures. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllCategorieActives() {
    this.categorieService.getCategoriesActives().subscribe({
      next: (categories) => {
        this.categories = categories.map(categorie => ({
          value: categorie._id,
          label: categorie.libelle
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des categories:', error.message);
        alert('Impossible de charger les categories. Veuillez réessayer plus tard.');
      }
    });
  }

  getAllMarqueActives() {
    this.marqueService.getMarquesActives().subscribe({
      next: (marques) => {
        this.marques = marques.map(marque => ({
          value: marque._id,
          label: marque.libelle
        }));
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
        this.modeles = modeles.map(modele => ({
          value: modele._id,
          label: modele.libelle
        }))
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
        this.typeTransmissions = typeTransmissions.map(typeTransmission => ({
          value: typeTransmission._id,
          label: typeTransmission.libelle
        }));
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
    this.paginatedVoitures = this.voitures.slice(startIndex, endIndex);
  }


  async addNewVoitureAsync(): Promise<Voiture | undefined> {
    if (this.newVoiture) {
      console.log(this.newVoiture);
      try {
        const voiture = await firstValueFrom(this.voitureService.addVoiture(this.newVoiture.id_marque, this.newVoiture.id_modele, this.newVoiture.id_categorie,
          this.newVoiture.id_type_transmission, this.newVoiture.annee, this.newVoiture.numeroImmatriculation, this.newVoiture.kilometrage, this.newVoiture.puissanceMoteur,
          this.newVoiture.cylindree, this.newVoiture.capaciteReservoir, this.newVoiture.pressionPneusRecommande));
        console.log('Voiture ajoutée avec succès:', voiture);
        this.voitures.push(voiture);

        // Calculer le nombre total d'éléments dans la page actuelle
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // Vérifier si la page actuelle a encore de la place
        if (this.voitures.length > startIndex && this.voitures.length <= endIndex) {
          // La page actuelle a encore de la place, on reste dessus
        } else {
          // Aller à la dernière page si la page actuelle est pleine
          this.currentPage = Math.floor((this.voitures.length - 1) / this.pageSize);
        }

        this.updatePagination();
        this.newVoiture = { id_marque: '', id_modele: '', id_categoie: '', id_type_transmission: '', annee: '', numeroImmatriculation: '', kilometrage: 0, puissanceMoteur: 0, cylindree: 0, capaciteReservoir: 0, pressionPneusRecommande: '' };
        return voiture;
      } catch (error: any) {
        console.error('Erreur lors de l’ajout du nouveau voir:', error);
        const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
        throw new Error(errorMessage);
      }
    }
    return undefined;
  }

  async openModal(errorMessage: string = '') {
    const data = {
      title: 'Ajouter un voiture',
      fields: [
        {
          name: 'id_marque', label: 'Marque', type: 'select', required: true, defaultValue: this.newVoiture.id_marque,
          options: this.marques
        },
        {
          name: 'id_modele', label: 'Modele', type: 'select', required: true, defaultValue: this.newVoiture.id_modele,
          options: this.modeles
        },
        {
          name: 'id_categorie', label: 'Categorie', type: 'select', required: true, defaultValue: this.newVoiture.id_categorie,
          options: this.categories
        },
        {
          name: 'id_type_transmission', label: 'Type Transmission', type: 'select', required: true, defaultValue: this.newVoiture.id_type_transmission,
          options: this.typeTransmissions
        },
        { name: 'annee', label: 'Année voiture', type: 'number', required: true, defaultValue: this.newVoiture.annee },
        { name: 'numeroImmatriculation', label: 'Numéro matriculation', type: 'text', required: true, defaultValue: this.newVoiture.numeroImmatriculation },
        { name: 'kilometrage', label: 'Kilometrage en Km', type: 'number', required: true, defaultValue: this.newVoiture.kilometrage },
        { name: 'puissanceMoteur', label: 'Puissance Moteur en W', type: 'number', required: true, defaultValue: this.newVoiture.puissanceMoteur },
        { name: 'cylindree', label: 'Cylindree', type: 'number', required: true, defaultValue: this.newVoiture.cylindree },
        { name: 'capaciteReservoir', label: 'Capacite Reservoir en L', type: 'number', required: true, defaultValue: this.newVoiture.capaciteReservoir },
        { name: 'pressionPneusRecommande', label: 'Pression Pneus Recommande', type: 'string', required: true, defaultValue: this.newVoiture.pressionPneusRecommande },
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
          this.newVoiture = result;
          await this.addNewVoitureAsync();
        } catch (error: any) {
          console.error('Erreur lors de l’ajout:', error.message);
          await this.openModal(error.message.replace("Error: ", ""));
        }
      }
    });
  }

  // Méthode pour ouvrir le modal en mode édition
  async openEditModal(voiture: Voiture, errorMessage: string = ''): Promise<void> {

    console.log(voiture);
    const data = {
      title: 'Modifier un voiture',
      fields: [
        {
          name: 'id_marque', label: 'Marque', type: 'select', required: true, defaultValue: voiture.marque._id,
          options: this.marques
        },
        {
          name: 'id_modele', label: 'Modele', type: 'select', required: true, defaultValue: voiture.modele._id,
          options: this.modeles
        },
        {
          name: 'id_categorie', label: 'Categorie', type: 'select', required: true, defaultValue: voiture.categorie._id,
          options: this.categories
        },
        {
          name: 'id_type_transmission', label: 'Type Transmission', type: 'select', required: true, defaultValue: voiture.typeTransmission._id,
          options: this.typeTransmissions
        },
        { name: 'annee', label: 'Année voiture', type: 'number', required: true, defaultValue: voiture.annee },
        { name: 'numeroImmatriculation', label: 'Numéro matriculation', type: 'text', required: true, defaultValue: voiture.numeroImmatriculation },
        { name: 'kilometrage', label: 'Kilometrage en Km', type: 'number', required: true, defaultValue: voiture.kilometrage },
        { name: 'puissanceMoteur', label: 'Puissance Moteur en W', type: 'number', required: true, defaultValue: voiture.puissanceMoteur },
        { name: 'cylindree', label: 'Cylindree', type: 'number', required: true, defaultValue: voiture.cylindree },
        { name: 'capaciteReservoir', label: 'Capacite Reservoir en L', type: 'number', required: true, defaultValue: voiture.capaciteReservoir },
        { name: 'pressionPneusRecommande', label: 'Pression Pneus Recommande', type: 'string', required: true, defaultValue: voiture.pressionPneusRecommande },
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

        // Fusionner les données existantes de la voiture avec les modifications
        const updatedData = {
          ...voiture, marque: result.id_marque, modele: result.id_modele, categorie: result.id_categorie, typeTransmission: result.id_type_transmission,
          annee: result.annee, numeroImmatriculation: result.numeroImmatriculation, kilometrage: result.kilometrage, puissanceMoteur: result.puissanceMoteur,
          cylindree: result.cylindree, capaciteReservoir: result.capaciteReservoir, pressionPneusRecommande: result.pressionPneusRecommande
        };
        console.log(updatedData);

        // Attendre la mise à jour via le prixSousService
        const updatedVoiture = await firstValueFrom(this.voitureService.updateVoiture(updatedData));

        // Mettre à jour la liste locale
        const index = this.voitures.findIndex(mq => mq._id === voiture._id);
        if (index !== -1) {
          this.voitures[index] = updatedVoiture;
          this.updatePagination(); // Rafraîchir la liste affichée
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error.message);
      alert('Erreur lors de la modification: ' + error.message);
      // Réouvrir la modale en passant le message d'erreur
      await this.openEditModal(voiture, error.message);
    }
  }


  // Méthode appelée lorsqu'on clique sur "Modifier"
  async editVoiture(voiture: Voiture) {
    await this.openEditModal(voiture);
  }

  // Ouvrir la modale de confirmation avant de supprimer un employé
  openDeleteConfirmation(voiture: Voiture): void {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer votre voiture avec numero matriculation "${voiture.numeroImmatriculation}" comme voiture ? Cette action est irréversible.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteVoiture(voiture._id); // Si l'utilisateur confirme, supprimer l'employé
      } else {
        console.log('Suppression annulée');
      }
    });
  }

  // Fonction de suppression d'un employé
  async deleteVoiture(voitureId: string) {

    try {
      // Appel API pour supprimer la voiture
      const deletedVoiture = await lastValueFrom(this.voitureService.deleteVoiture(voitureId));

      // Vérification si la suppression a bien été effectuée
      if (deletedVoiture && deletedVoiture.dateSuppression) {
        // Mise à jour locale en modifiant l'état au lieu de supprimer
        const index = this.voitures.findIndex(mq => mq._id === voitureId);
        if (index !== -1) {
          this.voitures[index] = deletedVoiture; // Mettre à jour l'objet avec la version renvoyée
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