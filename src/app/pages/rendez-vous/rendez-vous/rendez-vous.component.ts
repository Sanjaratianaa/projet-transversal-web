import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { CalendarView, CalendarModule, CalendarEvent } from 'angular-calendar';
import { firstValueFrom, Subject } from 'rxjs';
import { isSameDay, isSameMonth } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { addMonths, subMonths } from 'date-fns';
import { SousServiceService } from 'src/app/services/services/sousService.service';
import { Voiture, VoitureService } from 'src/app/services/caracteristiques/voiture.sevice';
import { Router } from '@angular/router';
import { RendezVous, RendezVousService } from 'src/app/services/rendez-vous/rendez-vous.service';
import { RendezVousModalComponent } from '../add-rendez-vous-modal/rendez-vous-modal.component';

interface VoitureSelectItem {
    value: string;
    label: string;
}

@Component({
    selector: 'app-rendez-vous',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        FormsModule,
        CalendarModule,
    ],
    templateUrl: './rendez-vous.component.html',
    schemas: [NO_ERRORS_SCHEMA],
})
export class RendezVousComponent implements OnInit {
    view: CalendarView = CalendarView.Month;
    CalendarView = CalendarView;
    viewDate: Date = new Date();

    events: CalendarEvent[] = [];
    activeDayIsOpen: boolean = false;  // Initialize to false
    refresh = new Subject<void>();

    sousServices: any[] = [];
    sousServicesObject: any[] = [];
    voitures: VoitureSelectItem[] = [];
    rendezVous: any[] = [];
    isClient: boolean = false;
    idPersonne: string;

    newSousService: any = {
        voiture: null,
        id_sous_service: [],
        date: null,
    };
    selectedSousServices: any[] = [];

    legendItems = [
        { label: 'En attente', color: '#f7b801' },
        { label: 'Validé', color: '#8cb369' },
        { label: 'Rejeté', color: '#d90429' },
        { label: 'Annulé', color: '#6f1d1b' },
        { label: 'Terminé', color: '#8ac926' }
    ];

    constructor(
        private dialog: MatDialog,
        private sousServiceService: SousServiceService,
        private voitureService: VoitureService,
        private rendezVousService: RendezVousService,
        private router: Router,
    ) { }

    ngOnInit() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role.libelle;
        if (role === "client") {
            this.idPersonne = user.idPersonne;
            this.isClient = true;
            this.getAllVoitures();
            this.getAllSousServicesActives();
        } else if(role === "mécanicien") {
            this.legendItems = [
                { label: 'En attente', color: '#f7b801' },
                { label: 'Validé', color: '#8cb369' }
            ];
        }
        this.getAllRendezVous();
    }

    setView(view: CalendarView) {
        this.view = view;
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
        this.rendezVousService.getAllRendezVous().subscribe({
            next: (rendezVous: RendezVous[]) => {
                this.rendezVous = rendezVous;

                console.log(this.rendezVous);

                this.events = rendezVous.map(rv => {

                    const serviceDescriptions = rv.services.map(service => service.sousSpecialite?.libelle);
                    const eventColor = this.getEventColor(rv.etat);

                    return {
                        start: rv.dateRendezVous ? new Date(rv.dateRendezVous) : new Date(),
                        end: rv?.heureFin ? new Date(rv.heureFin) : undefined,
                        title: this.isClient && this.idPersonne === rv.client._id ? `Rendez-vous pour: ${rv.voiture?.numeroImmatriculation || 'N/A'} - ${serviceDescriptions.join(', ')}` : `Rendez-vous pour: ${ rv.client.nom } ${ rv.client.prenom } - ${rv.voiture?.numeroImmatriculation || 'N/A'} - ${serviceDescriptions.join(', ')}`,
                        allDay: false,
                        meta: {
                            rendezVousData: rv
                        },
                        color: eventColor,
                    };
                });
                this.refresh.next();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des rendez-vous:', error.message);
                alert('Impossible de charger les rendez-vous. Veuillez réessayer plus tard.');
            }
        });
    }

    private getEventColor(etat: string): { primary: string; secondary: string } {
        switch (etat) {
            case 'en attente':
                return { primary: '#f7b801', secondary: '#f7b80133' };
            case 'validé':
                return { primary: '#8cb369', secondary: '#8cb36933' };
            case 'rejeté':
                return { primary: '#d90429', secondary: '#d9042933' };
            case 'annulé':
                return { primary: '#6f1d1b', secondary: '#6f1d1b33' };
            case 'terminé':
                return { primary: '#8ac926', secondary: '#8ac92633' };
            default:
                return { primary: '#cccccc', secondary: '#dddddd' };
        }
    }

    dayClicked(event: { day: any; sourceEvent: MouseEvent | KeyboardEvent }): void {
        if (isSameMonth(event.day.date, this.viewDate)) {
            if (
                (isSameDay(this.viewDate, event.day.date) && this.activeDayIsOpen === true) ||
                event.day.events.length === 0
            ) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
            }
            this.viewDate = event.day.date;
        }
    }

    handleEvent(action: string, event: CalendarEvent): void {
        // Here, you can access the 'event' object (which is a CalendarEvent)
        // and the 'action' (which will be 'Clicked' in this case).

        console.log('Event', event);
        console.log('Action', action);

        if (event.meta && event.meta.rendezVousData) {
            const rendezVousData = event.meta.rendezVousData;
            console.log('RendezVous Data', rendezVousData);
            this.router.navigate(['/rendez-vous/details/', rendezVousData._id], {
                state: { rendezVous: rendezVousData}
            });


            // Implement your logic to display event details here (e.g., open a modal).
        }
    }

    // Navigation functions
    previousMonth(): void {
        this.viewDate = subMonths(this.viewDate, 1);
    }

    today(): void {
        this.viewDate = new Date();
    }

    nextMonth(): void {
        this.viewDate = addMonths(this.viewDate, 1);
    }

    async openModal(errorMessage: string = '') {
        const data = {
            title: 'Prendre un rendez-vous',
            fields: [
                {
                    name: 'voiture', label: 'Voiture', type: 'select', required: true,
                    options: this.voitures, defaultValue: this.newSousService.voiture
                },
                {
                    name: "date",
                    label: "Date souhaité pour le rendez-vous",
                    type: "date",
                    required: true,
                    defaultValue: this.newSousService.date
                },
                {
                    name: 'id_sous_service', label: 'Sous-service', type: 'select', required: true,
                    options: this.sousServices, defaultValue: this.newSousService.id_sous_service,
                },
            ],
            submitText: 'Ajouter',
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

                this.newSousService = {
                    ...result,
                    services: servicesArray,
                    dateRendezVous: result.date,
                    voiture: result.voiture
                };

                console.log("Data to send to backend:", this.newSousService);

                const rendezVous = await firstValueFrom(this.rendezVousService.addRendezVous(this.newSousService));
                console.log(rendezVous);

                // Ajouter le nouveau rendez-vous à la liste existante
                this.rendezVous.push(rendezVous);

                // Mettre à jour les événements pour inclure le nouveau rendez-vous
                const serviceDescriptions = rendezVous.services.map(service => service.sousSpecialite?.libelle);
                const eventColor = this.getEventColor(rendezVous.etat);

                const newEvent = {
                    start: rendezVous.dateRendezVous ? new Date(rendezVous.dateRendezVous) : new Date(),
                    end: rendezVous?.heureFin ? new Date(rendezVous.heureFin) : undefined,
                    title: `Rendez-vous pour: ${rendezVous.voiture?.numeroImmatriculation || 'N/A'} - ${serviceDescriptions.join(', ')}`,
                    allDay: false,
                    meta: {
                        rendezVousData: rendezVous
                    },
                    color: eventColor,
                };

                // Ajouter l'événement à la liste et rafraîchir l'affichage
                this.events.push(newEvent);
                this.refresh.next();
            }
        } catch (error: any) {
            console.error('Erreur lors de l’ajout:', error.message);
            await this.openModal(error.message.replace("Error: ", ""));
        }
    }
}