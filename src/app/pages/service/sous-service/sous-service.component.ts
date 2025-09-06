import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { GenericModalComponent } from 'src/app/components/modal-generique/add-modal/modal.component';
import { DeleteConfirmationModalComponent } from 'src/app/components/modal-generique/confirm-modal/delete-confirmation-modal.component';
import { Service, ServiceService } from 'src/app/services/services/service.service';
import { SousService, SousServiceService } from 'src/app/services/services/sousService.service';

@Component({
    selector: 'app-sous-service',
    templateUrl: './sous-service.component.html',
    // styleUrls: ['./sous-service.component.scss'],
    standalone: true,
    imports: [
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatCardModule,
        CommonModule,
        MatIconModule
    ],
})
export class SousServiceComponent {
    isAdmin: boolean = false;
    services: Service[];
    servicesActives: any[] = [];
    sousServices: SousService[];
    paginatedSousServices: SousService[] = [];

    selectedService: Service | null;
    filteredSousServices: SousService[];

    // Nouveau employé à ajouter
    newSousService: any = { libelle: '', id_service: 0, duree: 0 };

    // Paramètres de pagination
    pageSize = 5;
    currentPage = 0;
    pageSizeOptions = [5, 10, 20];

    colors: string[] = ['#FF5722', '#4CAF50', '#2196F3', '#FFEB3B'];
    columns = ['service', 'libelle', 'duree', 'Prix', 'remise', 'Manager', 'Date d\'enregistrement', 'Manager Suppression', 'Date Suppression', 'Statut', 'actions'];

    constructor(private dialog: MatDialog, private serviceService: ServiceService, private souServiceService: SousServiceService) { }

    ngOnInit() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role.libelle;
        if (role == "manager")
            this.isAdmin = true;
        else
            this.columns = ['service', 'libelle', 'duree', 'Prix', 'remise', 'Date d\'enregistrement'];

        // Initialisez la pagination au chargement du composant
        this.getAllServices();
        this.getAllServicesActives();
        this.getAllSousServices();
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

    updatePagination() {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedSousServices = this.filteredSousServices.slice(startIndex, endIndex);
    }

    getColorForService(index: number): string {
        return this.colors[index % this.colors.length]; // Répartit cycliquement les couleurs
    }

    getAllServices() {
        this.serviceService.getServices().subscribe({
            next: (services) => {
                this.services = services;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des services:', error.message);
                alert('Impossible de charger les services. Veuillez réessayer plus tard.');
            }
        });
    }

    getAllServicesActives() {
        this.serviceService.getServicesActives().subscribe({
            next: (services) => {
                this.servicesActives = services.map(service => ({
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

    getAllSousServices() {
        const observable = this.isAdmin
            ? this.souServiceService.getSousServices()
            : this.souServiceService.getSousServicesActives();
        observable.subscribe({
            next: (sousServices) => {
                console.log(sousServices);
                this.sousServices = sousServices;
                this.filteredSousServices = [...this.sousServices];
                console.log(this.filteredSousServices);
                this.updatePagination();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des sous services:', error.message);
                alert('Impossible de charger les sous services. Veuillez réessayer plus tard.');
            }
        });
    }

    selectService(service: Service | null) {
        if (service === null) {
            // Si service est null, on retourne tous les sous-services
            this.filteredSousServices = this.sousServices;
        } else {
            // Si un service est sélectionné, on filtre les sous-services associés à ce service
            this.filteredSousServices = this.sousServices.filter(s => s.service._id === service._id);
        }
        this.updatePagination();
        this.selectedService = service;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.filteredSousServices = this.sousServices
            .filter(s => (!this.selectedService || s.service._id === this.selectedService._id))
            .filter(s => s.libelle.toLowerCase().includes(filterValue));
        this.updatePagination();
    }

    async openModal(errorMessage: string = '') {
        console.log("servicesActives: " + this.servicesActives);
        const data = {
            title: 'Ajouter un nouveau sous service',
            fields: [
                {
                    name: 'id_service', label: 'Service', type: 'select', required: true, defaultValue: this.newSousService.id_service,
                    options: this.servicesActives
                },
                { name: 'libelle', label: 'Sous service', type: 'text', required: true, defaultValue: this.newSousService.libelle },
                { name: 'duree', label: 'Durée en mn', type: 'number', required: true, defaultValue: this.newSousService.duree }
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
                    this.newSousService = result;
                    await this.addNewSousServiceAsync();
                } catch (error: any) {
                    console.error('Erreur lors de l’ajout:', error.message);
                    await this.openModal(error.message.replace("Error: ", ""));
                }
            }
        });
    }

    async addNewSousServiceAsync(): Promise<Service | undefined> {
        if (this.newSousService) {
            try {
                const sousService = await firstValueFrom(this.souServiceService.addSousService(this.newSousService.libelle.trim(), this.newSousService.duree, this.newSousService.id_service));
                console.log('Sous service ajoutée avec succès:', sousService);
                this.sousServices.push(sousService);

                // Calculer le nombre total d'éléments dans la page actuelle
                const startIndex = this.currentPage * this.pageSize;
                const endIndex = startIndex + this.pageSize;

                // Vérifier si la page actuelle a encore de la place
                if (this.sousServices.length > startIndex && this.sousServices.length <= endIndex) {
                    // La page actuelle a encore de la place, on reste dessus
                } else {
                    // Aller à la dernière page si la page actuelle est pleine
                    this.currentPage = Math.floor((this.sousServices.length - 1) / this.pageSize);
                }
                this.selectService(null);
                this.newSousService = { libelle: '', id_service: 0, duree: 0 };
                return sousService;
            } catch (error: any) {
                console.error('Erreur lors de l’ajout de la service:', error);
                const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
                throw new Error(errorMessage);
            }
        }
        return undefined;
    }

    // Méthode appelée lorsqu'on clique sur "Modifier"
    async editSousService(sousService: SousService) {
        await this.openEditModal(sousService);
    }

    async openEditModal(sousService: SousService, errorMessage: string = ''): Promise<void> {
        const data = {
            title: 'Modifier un sous service',
            fields: [
                {
                    name: 'id_service', label: 'Service', type: 'select', required: true, defaultValue: sousService.service._id,
                    options: this.servicesActives
                },
                { name: 'libelle', label: 'Sous service', type: 'text', required: true, defaultValue: sousService.libelle },
                { name: 'duree', label: 'Durée en mn', type: 'number', required: true, defaultValue: sousService.duree }
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

                // Fusionner les données existantes de la service avec les modifications
                const updatedData = { ...sousService, libelle: result.libelle.trim(), duree: result.duree, service: result.id_service };

                console.log(updatedData);

                // Attendre la mise à jour via le service
                const updatedService = await firstValueFrom(this.souServiceService.updateSousService(updatedData));

                // Mettre à jour la liste locale
                const index = this.sousServices.findIndex(mq => mq._id === sousService._id);
                if (index !== -1) {
                    this.sousServices[index] = updatedService;
                    this.filteredSousServices = this.sousServices;
                    this.updatePagination(); // Rafraîchir la liste affichée
                }
            }
        } catch (error: any) {
            console.error('Erreur lors de la modification:', error.message);
            alert('Erreur lors de la modification: ' + error.message);
            // Réouvrir la modale en passant le message d'erreur
            await this.openEditModal(sousService, error.message);
        }
    }

    // Ouvrir la modale de confirmation avant de supprimer un employé
    openDeleteConfirmation(sousService: SousService): void {
        const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
            width: '400px',
            data: {
                title: 'Confirmer la suppression',
                message: `Êtes-vous sûr de vouloir supprimer le sous service "${sousService.libelle}" dans le service "${sousService.service.libelle}" ? 
                Cette action est irréversible.`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log("hamafa eoo")
                this.deleteSousService(sousService._id); // Si l'utilisateur confirme, supprimer l'employé
            } else {
                console.log('Suppression annulée');
            }
        });
    }

    // Fonction de suppression d'un employé
    async deleteSousService(sousServiceId: string) {

        try {
            // Appel API pour supprimer la service
            const deletedSousService = await lastValueFrom(this.souServiceService.deleteSousService(sousServiceId));
            console.log(deletedSousService);

            // Vérification si la suppression a bien été effectuée
            if (deletedSousService && deletedSousService.dateSuppression) {
                // Mise à jour locale en modifiant l'état au lieu de supprimer
                const index = this.sousServices.findIndex(mq => mq._id === sousServiceId);
                if (index !== -1) {
                    this.sousServices[index] = deletedSousService; // Mettre à jour l'objet avec la version renvoyée
                    this.filteredSousServices = this.sousServices;
                    console.log(this.filteredSousServices);
                    this.updatePagination(); // Rafraîchir la liste affichée
                }
            }

        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);
            const errorMessage = error.error?.message || 'Erreur inconnue lors de la suppression.';
            alert(errorMessage); // Affiche l'erreur à l'utilisateur
        }
    }

}
