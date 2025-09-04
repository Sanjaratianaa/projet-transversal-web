import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PiecesAchetees, RendezVous, Service } from 'src/app/services/rendez-vous/rendez-vous.service';
import { firstValueFrom } from 'rxjs';
import { RendezVousService } from 'src/app/services/rendez-vous/rendez-vous.service';
import { MatDialog } from '@angular/material/dialog';
import { GenericModalComponent } from 'src/app/components/modal-generique/add-modal/modal.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PieceService } from 'src/app/services/caracteristiques/piece.service';
import { PrixPiece } from 'src/app/services/caracteristiques/prixStock.service';
import { MarqueService } from 'src/app/services/caracteristiques/marque.service';
import { ModeleService } from 'src/app/services/caracteristiques/modele.service';
import { TypeTransmissionService } from 'src/app/services/caracteristiques/typeTransmission.service';

@Component({
    selector: 'app-rendez-vous-intervention-details',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatTableModule,
        DatePipe,
    ],
    templateUrl: './rendez-vous-intervention-details.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RendezVousInterventionDetailsComponent implements OnInit {
    rendezVous: RendezVous | undefined;
    detailsForm: FormGroup;
    notesForm: FormGroup;
    isClient: boolean = false;

    displayedColumns: string[] = ['piece', "marquePiece", "marqueVoiture", "modeleVoiture", "typeTransmission", "Quantite", "Prix Unitaire", "Prix Total", "Commentaire"];
    piecesOrigines: any[] = [];
    marques: any[];
    modeles: any[];
    typeTransmissions: any[];

    pieces: PiecesAchetees[] = [];
    paginatedPieces: PiecesAchetees[] = [];

    newPieceAchete = { id_piece: '', marque_piece: '', id_marque: '', id_modele: '', id_type_transmission: '', quantite: 1, prixUnitaire: 0, prixTotal: 0, commentaire: '' };

    pageSize = 5;
    currentPage = 0;
    pageSizeOptions = [5, 10, 20];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private rendezVousService: RendezVousService,
        private dialog: MatDialog,
        private pieceService: PieceService,
        private marqueService: MarqueService,
        private modeleService: ModeleService,
        private typeTransmissionService: TypeTransmissionService
    ) {

        this.rendezVous = this.router.getCurrentNavigation()?.extras.state?.['rendezVous'];

        console.log(">> rendez: ", this.rendezVous);

        if (this.rendezVous?.services) {
            this.rendezVous.services = this.rendezVous.services.map((service: Service) => ({
                ...service,
                tempStatus: service.status
            }));
        }

        this.notesForm = this.fb.group({
            notes: ['']
        });
    }

    ngOnInit(): void {
        var idRendezVous = '';
        this.route.paramMap.subscribe(params => {
            const id = params.get('id'); // Récupération de la variable
            if (id)
                idRendezVous = id;
            console.log('idRendezVous:', idRendezVous);
        });

        console.log(">> rendez ng init: ", this.rendezVous);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role.libelle;
        if (role == "client")
            this.isClient = true;
        else {
            this.getAllPieceActives();
            this.getAllMarqueActives();
            this.getAllModeleActives();
            this.getAllTypeTransmissionActives();
        }

        if (this.rendezVous == null && idRendezVous != "") {
            this.getRendezVous(idRendezVous);
        } else
            this.pieces = this.rendezVous?.piecesAchetees || [];

        this.updatePagination();
    }


    goBack(): void {
        this.router.navigate(['/rendez-vous/interventions']);
    }

    formatDate(date: string | Date): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        const hours = ('0' + d.getHours()).slice(-2);
        const minutes = ('0' + d.getMinutes()).slice(-2);
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    isCurrentUser(service: Service): boolean {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                return !!(service.mecanicien && user.idPersonne === service.mecanicien._id);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return false;
    }

    saveDetails(): void {
        if (this.rendezVous) {
            // this.rendezVous.title = this.detailsForm.get('title')?.value;
            // this.intervention.description = this.detailsForm.get('description')?.value;
            // // ... other updates

            // console.log('Saving details:', this.detailsForm.value);
            console.log('Saving details:');
        }
    }

    calculatePrixTotal(service: Service): void {
        const quantite = Number(service.quantiteFinale) || 0;
        const prixUnitaire = Number(service.prixUnitaire) || 0;

        const total = quantite * prixUnitaire;
        service.prixTotal = parseFloat(total.toFixed(2));
    }

    async saveService(service: Service): Promise<void> {
        console.log('Saving service:', service);

        if (!this.rendezVous) {
            console.error("Erreur : Aucun rendez-vous sélectionné.");
            return;
        }

        service.status = service.tempStatus || '';

        const serviceUpdate = {
            _id: this.rendezVous._id,
            services: [service]
        };

        try {
            const updatedRendezVous = await firstValueFrom(
                this.rendezVousService.updateRendezVous(serviceUpdate)
            );
            console.log("Backend update successful:", updatedRendezVous);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du service :", error);
        }
    }


    getServiceStatusStyle(status: string): any {
        switch (status) {
            case 'en attente':
                return { 'background-color': '#f7b801' };
            case 'en cours':
                return { 'background-color': '#007bff' };
            case 'suspendue':
                return { 'background-color': '#dc3545' };
            case 'terminé':
                return { 'background-color': '#28a745' };
            default:
                return { 'background-color': '#6c757d' };
        }
    }

    saveAllServices() {
        if (this.rendezVous && this.rendezVous.services) {
            this.rendezVous.services.forEach(service => {
                // this.rendezVousService.updateRendezVousService(this.intervention._id, service._id, service)
                //   .subscribe({
                //     next: (response) => {
                //       console.log(`Service ${service.raison} updated successfully:`, response);
                //     },
                //     error: (error) => {
                //       console.error(`Error updating service ${service.raison}:`, error);
                //     }
                //   });
            });
        }
    }

    // PIECES

    getAllPieceActives() {
        this.pieceService.getPiecesActives().subscribe({
            next: (pieces) => {
                this.piecesOrigines = pieces.map(piece => ({
                    value: piece._id,
                    label: piece.libelle
                }));
            },
            error: (error) => {
                console.error('Erreur lors du chargement des marques:', error.message);
                alert('Impossible de charger les marques. Veuillez réessayer plus tard.');
            }
        });
    }

    getRendezVous(idRendezVous: string) {
        this.rendezVousService.getRendezVousById(idRendezVous).subscribe({
            next: (rendezVous) => {
                this.rendezVous = rendezVous;
                this.pieces = rendezVous?.piecesAchetees || [];
            },
            error: (error) => {
                console.error('Erreur lors du chargement des rendez-vous:', error.message);
                alert('Impossible de charger les rendez-vous. Veuillez réessayer plus tard.');
            }
        });
    }

    getAllMarqueActives() {
        this.marqueService.getMarquesActives().subscribe({
            next: (marques) => {
                this.marques = [
                    { value: '0', label: 'Tous' },  // Option "Tous" ajoutée au début
                    ...marques.map(marque => ({
                        value: marque._id,
                        label: marque.libelle
                    }))
                ];
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
                this.modeles = [
                    { value: '0', label: 'Tous' },  // Option "Tous" ajoutée au début
                    ...modeles.map(modele => ({
                        value: modele._id,
                        label: modele.libelle
                    }))
                ];
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
                this.typeTransmissions = [
                    { value: '0', label: 'Tous' },  // Option "Tous" ajoutée au début
                    ...typeTransmissions.map(typeTransmission => ({
                        value: typeTransmission._id,
                        label: typeTransmission.libelle
                    }))
                ];
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
        this.paginatedPieces = this.pieces.slice(startIndex, endIndex);
    }

    async addNewPieceAsync(pieceAchete: any) {
        if (pieceAchete) {
            try {
                if (this.rendezVous && this.rendezVous._id) {
                    const rendezVousUpdate = await firstValueFrom(this.rendezVousService.addNewPiece(this.rendezVous._id, pieceAchete.id_piece, pieceAchete.marque_piece,
                        pieceAchete.id_marque, pieceAchete.id_modele, pieceAchete.id_type_transmission, pieceAchete.quantite, pieceAchete.commentaire));

                    console.log('Pièce ajoutée avec succès:', rendezVousUpdate);
                    this.rendezVous.piecesAchetees = rendezVousUpdate.piecesAchetees;
                    this.pieces = rendezVousUpdate.piecesAchetees;
                    const startIndex = this.currentPage * this.pageSize;
                    const endIndex = startIndex + this.pageSize;

                    if (this.pieces.length > startIndex && this.pieces.length <= endIndex) {
                        // La page actuelle a encore de la place, on reste dessus
                    } else {
                        this.currentPage = Math.floor((this.pieces.length - 1) / this.pageSize);
                    }

                    this.updatePagination();
                }
            } catch (error: any) {
                console.error('Erreur lors de l’ajout de la marque:', error);
                const errorMessage = error.error && error.error.message ? error.error.message : error.toString();
                throw new Error(errorMessage);
            }
        }
    }

    async openModal(errorMessage: string = '') {
        const data = {
            title: 'Ajouter un achat de piece',
            fields: [
                {
                    name: 'id_piece', label: 'Piece', type: 'select', required: true,
                    options: this.piecesOrigines, defaultValue: this.newPieceAchete.id_piece
                },
                { name: 'marque_piece', label: 'Marque Piece', type: 'text', required: true, defaultValue: this.newPieceAchete.marque_piece },
                {
                    name: 'id_marque', label: 'Marque voiture', type: 'select', required: true, defaultValue: this.newPieceAchete.id_marque,
                    options: this.marques
                },
                {
                    name: 'id_modele', label: 'Modele', type: 'select', required: true, defaultValue: this.newPieceAchete.id_modele,
                    options: this.modeles
                },
                {
                    name: 'id_type_transmission', label: 'Type Transmission', type: 'select', required: true, defaultValue: this.newPieceAchete.id_type_transmission,
                    options: this.typeTransmissions
                },
                { name: 'quantite', label: 'Quantite', type: 'number', required: true, defaultValue: this.newPieceAchete.quantite },
                { name: 'commentaire', label: 'Commentaire', type: 'text', required: true, defaultValue: this.newPieceAchete.commentaire },
            ],
            submitText: 'Ajouter',
            errorMessage: errorMessage,
        };

        const dialogRef = this.dialog.open(GenericModalComponent, {
            width: '400px',
            data: data,
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                console.log('Données du formulaire pour pièce:', result);

                try {
                    this.newPieceAchete = result;

                    console.log('Données du formulaire pour newPieceAchete:', this.newPieceAchete);

                    // Uncomment the following line when you are ready to save
                    await this.addNewPieceAsync(this.newPieceAchete);

                } catch (error: any) {
                    console.error('Erreur lors de l’ajout:', error.message);
                    await this.openModal(error.message.replace("Error: ", ""));
                }
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

    async openAddAvisModal(idRendezVous: string, idSousService: string, errorMessage: string = '') {
        const data = {
            title: 'Ajouter un avis sur le service',
            fields: [
                { name: 'avis', label: 'Avis sur le service', type: 'text', required: true },
                { name: 'note', label: 'Note / 10', type: 'number', required: true },
            ],
            submitText: 'Ajouter',
            errorMessage: errorMessage,
        };

        const dialogRef = this.dialog.open(GenericModalComponent, {
            width: '400px',
            data: data,
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                console.log('Données du formulaire pour avis:', result);

                try {
                    if(this.rendezVous && this.rendezVous.services) {
                        const rendezVousCopy = structuredClone(this.rendezVous);
                        const services = rendezVousCopy.services;
                        for (const service of services) {
                            if(service._id == idSousService) {
                                service.avis = result.avis;
                                service.note = result.note;
                                break;
                            }
                        }
    
                        const rendezVousUpdate = await firstValueFrom(this.rendezVousService.updateRendezVous(rendezVousCopy));
                        this.rendezVous.services = rendezVousUpdate.services;
                    }

                } catch (error: any) {
                    console.error('Erreur lors de l’ajout:', error.message);
                    await this.openAddAvisModal(idRendezVous, idSousService, error.message.replace("Error: ", ""));
                }
            }
        });
    }

}

