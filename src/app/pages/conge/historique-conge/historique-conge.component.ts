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
import { ActivatedRoute } from '@angular/router';
import { AnnulationConfirmationModalComponent } from '../../../components/modal-generique/confirm-annulation-modal/confirm-annulation-modal.component';
import { Conge, CongeService } from 'src/app/services/personne/conge.service';
import { GenericModalComponent } from 'src/app/components/modal-generique/add-modal/modal.component';
import { RepondreDemandeCongeComponent } from '../repondre-conge/repondre-conge.component';

@Component({
    selector: 'app-conge',
    standalone: true,
    templateUrl: './historique-conge.component.html',
    imports: [MatListModule, MatCardModule, DatePipe, MatIconModule, MaterialModule, FormsModule, CommonModule, MatButtonModule],

})
export class HistoriqueCongeComponent {
    displayedColumns: string[] = [];
    conges: Conge[];
    status: string | null = null;
    titre: string = '';
    isValidable: boolean = false;
    isAdmin: boolean = false;
    isMecanicien: boolean = false;
    etats: string[] = ['en attente', 'validé', 'rejeté', 'annulé', 'terminé'];

    paginatedConges: Conge[] = [];

    // Paramètres de pagination
    pageSize = 5;
    currentPage = 0;
    pageSizeOptions = [5, 10, 20];

    constructor(
        private dialog: MatDialog,
        private congeService: CongeService,
        private route: ActivatedRoute,
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
        else if (role === "mécanicien") {
            this.isMecanicien = true;
        }

        // Initialisez la pagination au chargement du composant
        if (this.status == "en-attente") {
            this.getAllCongeEnAttente();
            this.isValidable = true;
        }
        else
            this.getCongeByMecanicien();

        this.displayedColumns = this.isAdmin ? ['Date et heure demande', "mecanicien", "dateDebut", "dateFin", "Raison", "Validateur", "Remarque", "Statut"]
            : ['Date et heure demande', "dateDebut", "dateFin", "Raison", "Validateur", "Remarque", "StatutMecanicien", 'actions'];

    }

    getCongeByMecanicien() {
        this.congeService.getCongeByMecanicien().subscribe({
            next: (conges) => {
                this.conges = conges;
                this.updatePagination();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des conges:', error.message);
                alert('Impossible de charger les conges. Veuillez réessayer plus tard.');
            }
        });
    }

    getAllCongeEnAttente() {
        this.congeService.getCongeByEtat("en attente").subscribe({
            next: (conges) => {
                this.conges = conges;
                this.updatePagination();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des conges:', error.message);
                alert('Impossible de charger les conges. Veuillez réessayer plus tard.');
            }
        });
    }

    updatePagination() {
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedConges = this.conges.slice(startIndex, endIndex);
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

    updateStatus(conge: any, newStatus: string) {
        conge.etat = newStatus;
    }

    async openAnswerDetailsModal(conge: Conge, errorMessage: string = '') {
        console.log(conge);
        try {

            const dialogRef = this.dialog.open(RepondreDemandeCongeComponent, {
                width: '800px',
                data: { conge: conge, isValidable: true, errorMessage: errorMessage }
            });

            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                console.log('Conge repondu', result);
                const updateConge = await firstValueFrom(this.congeService.answerConge(conge._id, result.action, result.commentaire));
                console.log(updateConge);
                // Mettre à jour la liste locale
                const index = this.conges.findIndex(mq => mq._id === conge._id);
                if (index !== -1) {
                    console.log('Listes demandes Conge updateee');
                    this.conges[index] = updateConge[0];
                    this.updatePagination(); // Rafraîchir la liste affichée
                }
            }
        } catch (error: any) {
            await this.openAnswerDetailsModal(conge, error.message);
        }
    }

    async openEditModal(conge: Conge, errorMessage: string = '') {
        const data = {
            title: 'Modifier une demande de congés',
            fields: [
                { name: 'dateDebut', label: 'Date et heure du debut du congé', type: 'datetime-local', required: true, defaultValue: conge.dateHeureDebut },
                { name: 'dateFin', label: 'Date et heure du fin du congé', type: 'datetime-local', required: true, defaultValue: conge.dateHeureFin },
                { name: 'raison', label: 'Raison du congés', type: 'text', required: true, defaultValue: conge.raison },
            ],
            submitText: 'Ajouter',
            errorMessage: errorMessage,
        };

        const dialogRef = this.dialog.open(GenericModalComponent, {
            width: '600px',
            data: data,
        });

        const result = await firstValueFrom(dialogRef.afterClosed());

        try {
            if (result) {
                console.log('Données du formulaire:', result);
                const _updateConge = { ...conge, dateHeureDebut: result.dateDebut, dateHeureFin: result.dateFin, raison: result.raison };
                const updateConge = await firstValueFrom(this.congeService.updateConge(_updateConge));
                console.log(updateConge);
                // Mettre à jour la liste locale
                const index = this.conges.findIndex(mq => mq._id === conge._id);
                if (index !== -1) {
                    console.log('Listes demandes Conge updateee');
                    this.conges[index] = updateConge;
                    this.updatePagination(); // Rafraîchir la liste affichée
                }
            }
        } catch (error: any) {
            console.error('Erreur lors de l’ajout:', error.message);
            await this.openEditModal(conge, error.message.replace("Error: ", ""));
        }
    }

    async openCancelModal(conge: Conge, errorMessage: string = '') {
        console.log(conge);
        try {

            const dialogRef = this.dialog.open(AnnulationConfirmationModalComponent, {
                width: '800px',
                data: {
                    title: "Confirmation d'annulation de demande de congé",
                    message: "Êtes-vous certain(e) de vouloir annuler votre demande de congé ? Cette action est définitive et ne pourra pas être annulée.",
                    errorMessage: errorMessage
                }
            });

            const result = await firstValueFrom(dialogRef.afterClosed());
            if (result) {
                console.log('Annulation Conge repondu', result);
                if (result.confirmed) {
                    const updateConge = await firstValueFrom(this.congeService.answerConge(conge._id, 'annulé', result.raison));
                    console.log(updateConge);
                    // Mettre à jour la liste locale
                    const index = this.conges.findIndex(mq => mq._id === conge._id);
                    if (index !== -1) {
                        console.log('Listes demandes Conge updateee');
                        this.conges[index] = updateConge[0];
                        this.updatePagination(); // Rafraîchir la liste affichée
                    }
                }
            }
        } catch (error: any) {
            await this.openCancelModal(conge, error.message);
        }
    }

}