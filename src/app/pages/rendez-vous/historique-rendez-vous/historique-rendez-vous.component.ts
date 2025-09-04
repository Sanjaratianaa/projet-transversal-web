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
import { RendezVous, RendezVousService } from 'src/app/services/rendez-vous/rendez-vous.service';
import { DeleteConfirmationModalComponent } from 'src/app/components/modal-generique/confirm-modal/delete-confirmation-modal.component';
import { DetailRendezVousComponent } from '../detail-rendez-vous/detail-rendez-vous.component';
import { ActivatedRoute } from '@angular/router';
import { SpecialiteService } from 'src/app/services/personne/specialite.service';
import { SousServiceService } from 'src/app/services/services/sousService.service';
import { VoitureService, Voiture } from 'src/app/services/caracteristiques/voiture.sevice';
import { RendezVousModalComponent } from '../add-rendez-vous-modal/rendez-vous-modal.component';
import { AnnulationConfirmationModalComponent } from 'src/app/components/modal-generique/confirm-annulation-modal/confirm-annulation-modal.component';

interface VoitureSelectItem {
    value: string;
    label: string;
}

@Component({
    selector: 'app-rendez-vous',
    standalone: true,
    templateUrl: './historique-rendez-vous.component.html',
    imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class HistoriqueRendezVousComponent {
    sousServices: any[] = [];
    sousServicesObject: any[] = [];
    voitures: VoitureSelectItem[] = [];

    displayedColumns: string[] = [];
    listeRendezVous: RendezVous[];
    status: string | null = null;
    titre: string = '';
    isValidable: boolean = false;
    isAdmin: boolean = false;
    isClient: boolean = false;
    etats: string[] = ['en attente', 'validé', 'rejeté', 'annulé', 'terminé'];

    paginatedRendezVous: RendezVous[] = [];

    // Nouveau employé à ajouter
    newRendezVous: string = "";

    // Paramètres de pagination
    pageSize = 5;
    currentPage = 0;
    pageSizeOptions = [5, 10, 20];

    constructor(
        private dialog: MatDialog,
        private rendezVousService: RendezVousService,
        private route: ActivatedRoute,
        private specialiteService: SpecialiteService,
        private sousServiceService: SousServiceService,
        private voitureService: VoitureService,
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const status = params.get('status'); // Récupération de la variable
            if (status)
                this.status = status;
            console.log('Status:', this.status);
        });

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role.libelle;
        if (role === "manager")
            this.isAdmin = true;
        else if (role === "client") {
            this.isClient = true;
            this.getAllVoitures();
            this.getAllSousServicesActives();
        }

        // Initialisez la pagination au chargement du composant
        if (this.status == "en-attente") {
            this.getAllRendezVousEnAttente();
            this.isValidable = true;
        }
        else
            this.getAllRendezVous();

        this.displayedColumns = this.isAdmin ? ['Date et heure demande', "Client", "Date du rendez-vous", "N° Matriculation", "Validateur", "Remarque", "Statut", 'actions']
            : ['Date et heure demande', "Date du rendez-vous", "N° Matriculation", "Validateur", "Remarque", "StatutClient", 'actions'];

    }

    getAllSousServicesActives() {
        this.sousServiceService.getSousServicesActives().subscribe({
            next: (sousServices) => {
                this.sousServicesObject = sousServices;
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

    getAllVoitures() {
        this.voitureService.getVoituresByClient().subscribe({
            next: (voitures: Voiture[]) => {
                this.voitures = voitures.map((voiture: Voiture) => ({
                    value: voiture._id,
                    label: voiture.numeroImmatriculation

                }));
            },
            error: (error) => {
                console.error('Erreur lors du chargement des voitures:', error.message);
                alert('Impossible de charger les voitures. Veuillez réessayer plus tard.');
            }
        });
    }

    getAllRendezVous() {
        this.rendezVousService.getRendezVous().subscribe({
            next: (listeRendezVous) => {
                this.listeRendezVous = listeRendezVous;
                this.updatePagination();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des listeRendezVous:', error.message);
                alert('Impossible de charger les listeRendezVous. Veuillez réessayer plus tard.');
            }
        });
    }

    getAllRendezVousEnAttente() {
        this.rendezVousService.getRendezVousByEtat("en attente").subscribe({
            next: (listeRendezVous) => {
                this.listeRendezVous = listeRendezVous;
                this.updatePagination();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des listeRendezVous:', error.message);
                alert('Impossible de charger les listeRendezVous. Veuillez réessayer plus tard.');
            }
        });
    }

    updatePagination() {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedRendezVous = this.listeRendezVous.slice(startIndex, endIndex);
    }

    // Ouvrir la modale de confirmation avant de supprimer un employé
    openDeleteConfirmation(service: RendezVous): void {
        const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
            width: '400px',
            data: {
                title: 'Confirmer la suppression',
                message: `Êtes-vous sûr de vouloir rejeter cette demande ? Cette action est irréversible.`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // this.deleteRendezVous(service._id); // Si l'utilisateur confirme, supprimer l'employé
            } else {
                console.log('Suppression annulée');
            }
        });
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

    getStatusClass(etat: string): string {
        switch (etat) {
            case 'en attente':
                return 'status-pending'; // Orange
            case 'validé':
                return 'status-approved'; // Vert
            case 'rejeté':
                return 'status-rejected'; // Rouge
            case 'annulé':
                return 'status-cancelled'; // Gris
            default:
                return 'status-default';
        }
    }

    updateStatus(rendezVous: any, newStatus: string) {
        rendezVous.etat = newStatus;
    }

    async openDetailsModal(rendezVous: RendezVous) {
        console.log(rendezVous);
        this.dialog.open(DetailRendezVousComponent, {
            width: '700px',
            data: { rendezVous: rendezVous, isValidable: false, errorMessage: '' },
        });
    }

    async openAnswerDetailsModal(rendezVous: RendezVous, errorMessage: string = '') {
        console.log(rendezVous);
        try {
            for (const service of rendezVous.services) {
                console.log(service.sousSpecialite);
                const specialites = await firstValueFrom(this.specialiteService.getSpecialitesActivesBySousService(service.sousSpecialite._id));
                const mecaniciens: any[] = [];
                for (const specialite of specialites) {
                    mecaniciens.push(specialite.mecanicien);
                }
                console.log(mecaniciens);
                service.mecaniciensDisponibles = mecaniciens;
            }

            const dialogRef = this.dialog.open(DetailRendezVousComponent, {
                width: '800px',
                data: { rendezVous: rendezVous, isValidable: true, errorMessage: errorMessage }
            });

            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                console.log('Rendez-vous repondu', result);
                const updateRendezVous = await firstValueFrom(this.rendezVousService.answerRendezVous(rendezVous._id, result.action, result.commentaire, result.services, ''));
                console.log(updateRendezVous);
                // Mettre à jour la liste locale
                const index = this.listeRendezVous.findIndex(mq => mq._id === rendezVous._id);
                if (index !== -1) {
                    console.log('Listes demandes Rendez-vous updateee');
                    this.listeRendezVous[index] = updateRendezVous[0];
                    this.updatePagination(); // Rafraîchir la liste affichée
                }
            } else {
                console.log('Modal fermé sans action');
            }
        } catch (error: any) {
            await this.openAnswerDetailsModal(rendezVous, error.message);
        }
    }

    async openEditModal(rendezVous: RendezVous, errorMessage: string = '') {
        const data = {
            title: 'Modifier un rendez-vous',
            rendezVous: rendezVous,
            fields: [
                {
                    name: 'voiture', label: 'Voiture', type: 'select', required: true,
                    options: this.voitures
                },
                {
                    name: "date",
                    label: "Date souhaité pour le rendez-vous",
                    type: "date",
                    required: true
                },
                {
                    name: 'id_sous_service', label: 'Sous-service', type: 'select', required: true,
                    options: this.sousServices
                },
            ],
            submitText: 'Modifier',
            errorMessage: errorMessage
        };

        const dialogRef = this.dialog.open(RendezVousModalComponent, {
            width: '600px',
            data: data,
        });

        const result = await firstValueFrom(dialogRef.afterClosed());

        try {
            if (result) {
                console.log('Données du formulaire:', result);
                const servicesArray = result.sousServicesArray.map((sousServiceItem: any) => {
                    const sousServiceId = sousServiceItem.id;
                    const sousServiceObject = this.sousServicesObject.find(ss => ss._id === sousServiceId);

                    if (sousServiceObject) {
                        return {
                            sousSpecialite: sousServiceId,
                            raison: sousServiceItem.raison, // from form
                            quantiteEstimee: sousServiceItem.quantite, // from form
                            prixUnitaire: sousServiceObject.prixUnitaire ? sousServiceObject.prixUnitaire : 0,
                            status: "en attente"
                        };
                    } else {
                        return null;
                    }
                }).filter((item: any) => item !== null);


                delete result.sousServicesArray;
                delete result.id_sous_service;

                const _updateRendezVous = {
                    ...result,
                    services: servicesArray,
                    dateRendezVous: result.date,
                    voiture: result.voiture,
                    _id: rendezVous._id
                };

                console.log("Data to send to backend:", _updateRendezVous);
                const updateRendezVous = await firstValueFrom(this.rendezVousService.updateRendezVous(_updateRendezVous));
                console.log(updateRendezVous);
                // Mettre à jour la liste locale
                const index = this.listeRendezVous.findIndex(mq => mq._id === rendezVous._id);
                if (index !== -1) {
                    console.log('Listes demandes Rendez-vous updateee');
                    this.listeRendezVous[index] = updateRendezVous;
                    this.updatePagination(); // Rafraîchir la liste affichée
                }
            }
        } catch (error: any) {
            console.error('Erreur lors de l’ajout:', error.message);
            await this.openEditModal(rendezVous, error.message.replace("Error: ", ""));
        }
    }

    async openCancelModal(rendezVous: RendezVous, errorMessage: string = '') {
        console.log(rendezVous);
        try {

            const dialogRef = this.dialog.open(AnnulationConfirmationModalComponent, {
                width: '800px',
                data: {
                    errorMessage: errorMessage,
                    title: "Confirmation d'annulation de demande de rendez-vous",
                    message: "Êtes-vous sûr de vouloir annuler votre demande de rendez-vous ? Cette action est irréversible."
                }
            });

            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                console.log('Annulation Rendez-vous repondu', result);
                if (result.confirmed) {
                    const updateRendezVous = await firstValueFrom(this.rendezVousService.answerRendezVous(rendezVous._id, 'annulé', result.raison, [], ''));
                    console.log(updateRendezVous);
                    // Mettre à jour la liste locale
                    const index = this.listeRendezVous.findIndex(mq => mq._id === rendezVous._id);
                    if (index !== -1) {
                        this.listeRendezVous[index] = updateRendezVous[0];
                        this.updatePagination(); // Rafraîchir la liste affichée
                    }
                }
            }
        } catch (error: any) {
            await this.openCancelModal(rendezVous, error.message);
        }
    }

}