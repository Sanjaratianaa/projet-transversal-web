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
import { Router } from '@angular/router';
import { Conge, CongeService } from 'src/app/services/personne/conge.service';
import { format } from 'date-fns';
import { GenericModalComponent } from 'src/app/components/modal-generique/add-modal/modal.component';



@Component({
    selector: 'app-demande-conge',
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
    templateUrl: './demande-conge.component.html',
    schemas: [NO_ERRORS_SCHEMA],
})
export class DemandeCongeComponent implements OnInit {
    view: CalendarView = CalendarView.Month;
    CalendarView = CalendarView;
    viewDate: Date = new Date();

    events: CalendarEvent[] = [];
    activeDayIsOpen: boolean = false;  // Initialize to false
    refresh = new Subject<void>();

    conges: Conge[] = [];
    isMecanicien: boolean = false;
    idPersonne: string;

    newConge: any = {
        dateDebut: '',
        dateFin: '',
        raison: ''
    };
    selectedSousServices: any[] = [];

    legendItems = [
        { label: 'En attente', color: '#f7b801' },
        { label: 'Validé', color: '#8cb369' },
        { label: 'Rejeté', color: '#d90429' },
        { label: 'Annulé', color: '#6f1d1b' }
    ];

    constructor(
        private dialog: MatDialog,
        private congeService: CongeService,
        private router: Router,
    ) { }

    ngOnInit() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role.libelle;
        if (role === "mécanicien") {
            this.idPersonne = user.idPersonne;
            this.isMecanicien = true;
        }
        this.getAllConges();
    }

    setView(view: CalendarView) {
        this.view = view;
    }

    getAllConges() {
        this.congeService.getAllConges().subscribe({
            next: (conges: Conge[]) => {
                this.conges = conges;

                console.log(this.conges);

                this.events = conges.map(conge => {
                    const eventColor = this.getEventColor(conge.etat);

                    const dateDebut = conge.dateHeureDebut ? new Date(conge.dateHeureDebut) : new Date();
                    const dateFin = conge.dateHeureFin ? new Date(conge.dateHeureFin) : new Date();

                    const heureDebut = format(dateDebut, "HH:mm");
                    const heureFin = format(dateFin, "HH:mm");

                    return {
                        start: dateDebut,
                        end: dateFin,
                        title: this.isMecanicien && this.idPersonne === conge.mecanicien._id
                            ? `Congé prévu de ${heureDebut} à ${heureFin} - ${conge.raison}`
                            : `Rendez-vous pour: ${conge.mecanicien.nom} ${conge.mecanicien.prenom} prévu de ${heureDebut} à ${heureFin} - ${conge.raison}`,
                        allDay: false,
                        meta: {
                            conge: conge
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
                state: { rendezVous: rendezVousData }
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
            title: 'Faire une demande de congés',
            fields: [
                { name: 'dateDebut', label: 'Date et heure du debut du congé', type: 'datetime-local', required: true, defaultValue: this.newConge.dateDebut },
                { name: 'dateFin', label: 'Date et heure du fin du congé', type: 'datetime-local', required: true, defaultValue: this.newConge.dateFin },
                { name: 'raison', label: 'Raison du congés', type: 'text', required: true, defaultValue: this.newConge.raison },
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
                this.newConge = result;
                const conge = await firstValueFrom(this.congeService.addConge(this.newConge.dateDebut, this.newConge.dateFin, this.newConge.raison));

                this.conges.push(conge);

                // Mettre à jour les événements pour inclure le nouveau rendez-vous
                const eventColor = this.getEventColor(conge.etat);

                const dateDebut = conge.dateHeureDebut ? new Date(conge.dateHeureDebut) : new Date();
                const dateFin = conge.dateHeureFin ? new Date(conge.dateHeureFin) : new Date();

                const heureDebut = format(dateDebut, "HH:mm");
                const heureFin = format(dateFin, "HH:mm");

                const newEvent = {
                    start: dateDebut,
                    end: dateFin,
                    title: this.isMecanicien && this.idPersonne === conge.mecanicien._id
                        ? `Congé prévu de ${heureDebut} à ${heureFin} - ${conge.raison}`
                        : `Rendez-vous pour: ${conge.mecanicien.nom} ${conge.mecanicien.prenom} prévu de ${heureDebut} à ${heureFin} - ${conge.raison}`,
                    allDay: false,
                    meta: {
                        conge: conge
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