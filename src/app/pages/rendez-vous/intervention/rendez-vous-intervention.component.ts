import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { GenericModalComponent } from 'src/app/components/modal-generique/add-modal/modal.component';
import { RendezVous, RendezVousService } from 'src/app/services/rendez-vous/rendez-vous.service'; // Assuming RendezVous interface is also here or imported separately
import { PaiementService } from 'src/app/services/paiement/paiement.service';

@Component({
  selector: 'app-intervention-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './rendez-vous-intervention.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RendezVousInterventionComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['description', 'client', 'status', 'date', 'debut', 'fin', 'action'];

  paginatedRendezVous: RendezVous[] = [];
  listeRendezVous: RendezVous[] = [];
  isClient: boolean = false;

  dataSource = new MatTableDataSource<RendezVous>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 5;
  currentPage = 0;
  pageSizeOptions = [5, 10, 20];
  totalInterventions = 0; // Initialize count

  selectedRendezVous: RendezVous | null = null;

  interventionsInProgress = 0;
  interventionsOpen = 0;
  interventionsClosed = 0;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private rendezVousService: RendezVousService,
    private paiementService: PaiementService,
  ) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role.libelle;
    if (role == "client") {
      this.isClient = true;
      this.displayedColumns = ['description', 'status', 'date', 'debut', 'fin', 'action'];
    } 
    this.getAllRendezVous();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    } else {
        console.warn("MatPaginator instance was not found. Pagination might not work.");
    }
  }

  getStatusClass(status: string): string {
    const lowerCaseStatus = status?.toLowerCase() || '';
    switch (lowerCaseStatus) {
      case 'validé':
      case 'valide':
      case 'en attente':
        return 'bg-light-warning';
      case 'open':
        return 'bg-light-success';
      case 'terminé':
      case 'termine':
      case 'closed':
        return 'bg-light-error';
      default:
        return 'bg-light';
    }
  }

  getDescription(rendezVous: RendezVous): string {
    if (!rendezVous.services || rendezVous.services.length === 0) {
      return 'Aucun service spécifié';
    }
    const serviceDescriptions = rendezVous.services
      .map(service => service.sousSpecialite?.libelle)
      .filter(libelle => !!libelle);
    return serviceDescriptions.join(', ') || 'Services non détaillés';
  }

  getImageUrl(rendezVous: RendezVous): string {
    if(rendezVous?.client?.genre === 'Femme') {
      return '/assets/images/profile/user-2.jpg';
    }
    return '/assets/images/profile/user-1.jpg';
  }

  onRowClick(rendezVous: RendezVous): void {
    this.selectedRendezVous = rendezVous;

    if (this.selectedRendezVous.etat !== "terminé" && !rendezVous.heureDebut || !rendezVous.heureFin) {
      this.openModal();
    }
  }

  onEditClick(rendezVous: RendezVous): void {
    this.selectedRendezVous = rendezVous;

    if(this.selectedRendezVous.etat !== "terminé") {
      if (!rendezVous.heureDebut) {
        this.openModal();
      } else {
        this.router.navigate(['/rendez-vous/interventions-details', rendezVous._id], {
          state: { rendezVous: rendezVous}
      });
      }
    }
  }

  async openModal(errorMessage: string = '') {
    if (!this.selectedRendezVous) {
        console.error("No rendez-vous selected for modal.");
        return;
    }

    const data = {
      title: 'Confirmation Intervention',
      fields: [
        { name: 'heureDebut', label: 'Heure de début', type: 'datetime-local', required: true, defaultValue: this.formatDate(this.selectedRendezVous.heureDebut || "") },
        { name: 'heureFin', label: 'Heure de fin', type: 'datetime-local', defaultValue: this.formatDate(this.selectedRendezVous.heureFin || "") },
      ],
      submitText: 'Confirmer Horaires',
      errorMessage: errorMessage,
    };

    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '400px',
      data: data,
    });

    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result && this.selectedRendezVous) {
      const rendezVousId = this.selectedRendezVous._id;
      try {
        console.log('Données du formulaire:', result);

        this.verifyBeforeSubmit(this.selectedRendezVous, result.heureDebut, result.heureFin);

        let rendezVousUpdatePayload: any = {
          _id: rendezVousId,
          heureDebut: result.heureDebut,
          heureFin: result.heureFin
        };

        if (result.heureFin !== null && result.heureFin !== undefined && result.heureFin !== "") {
          rendezVousUpdatePayload = {
            ...rendezVousUpdatePayload,
            etat: "terminé"
          }
          this.savePaiement(this.selectedRendezVous, result.heureFin);
        }

        console.log("Payload for update: ", rendezVousUpdatePayload);

        const updatedRendezVous = await firstValueFrom(
          this.rendezVousService.updateRendezVous(rendezVousUpdatePayload)
        );
        console.log("Backend update successful:", updatedRendezVous);

        const index = this.listeRendezVous.findIndex(rdv => rdv._id === rendezVousId);

        if (index !== -1) {
          this.listeRendezVous[index] = { ...this.listeRendezVous[index], ...updatedRendezVous };
        } else {

          this.selectedRendezVous.heureDebut = updatedRendezVous.heureDebut;
          this.selectedRendezVous.heureFin = updatedRendezVous.heureFin;

          if (updatedRendezVous.etat) {
              this.selectedRendezVous.etat = updatedRendezVous.etat;
          }
        }

        this.updatePagination();
        this.updateInterventionCounts();

      } catch (error: any) {
        console.error('Erreur lors de la mise à jour:', error);

        const friendlyError = error.message?.includes('already passed') ? 'L\'heure de début ne peut pas être dans le passé.' :
                              error.message?.includes('required') ? 'Veuillez remplir tous les champs requis.' :
                              error.message?.includes('L\'heure de début ne peut pas être avant') ? 'L\'heure de début ne peut pas être dans le passé.' :
                              error.message?.includes('L\'heure de fin doit être après') ? 'L\'heure de fin doit être après l\'heure de début.' :
                              error.message?.includes('La durée totale des services dépasse') ? 'La durée totale des services dépasse l\'heure de fin.' :
                              error.message?.includes('Tous les services doivent être') ? 'Tous les services doivent être terminés avant de clôturer le rendez-vous.' :
                              'Une erreur est survenue lors de la mise à jour.';
                             
        await this.openModal(friendlyError.replace("Error: ", ""));
      }
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2); // Adding leading zero to month
    const day = ('0' + d.getDate()).slice(-2); // Adding leading zero to day
    const hours = ('0' + d.getHours()).slice(-2); // Adding leading zero to hours
    const minutes = ('0' + d.getMinutes()).slice(-2); // Adding leading zero to minutes
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  verifyBeforeSubmit(selectedRendezVous: RendezVous, heureDebut: any, heureFin: any) {
    const originalHeureDebut = new Date(selectedRendezVous.heureDebut).getTime();
      const selectedHeureDebut = new Date(heureDebut).getTime();
      if (selectedHeureDebut < originalHeureDebut) {
        throw new Error("L'heure de début ne peut pas être avant l'heure initiale du rendez-vous.");
      }

      const selectedHeureFin = new Date(heureFin).getTime();
      if (selectedHeureFin <= selectedHeureDebut) {
        throw new Error("L'heure de fin doit être après l'heure de début.");
      }

      // Vérifier si la durée totale des services dépasse l'heureFin
      const totalDuration = this.calculateTotalServiceDuration();
      const plannedEnd = selectedHeureDebut + totalDuration;
      if (plannedEnd > selectedHeureFin) {
        throw new Error("La durée totale des services dépasse l'heure de fin.");
      }

      // Vérifier si tous les services sont terminés
      const incompleteServices = selectedRendezVous.services?.some(service => service.status !== 'terminé');
      if (incompleteServices) {
        throw new Error("Tous les services doivent être terminés avant de clôturer le rendez-vous.");
      }
  }

  calculateTotalServiceDuration(): number {
    let totalDuration = 0;
  
    if (this.selectedRendezVous && this.selectedRendezVous.services) {
      this.selectedRendezVous.services.forEach(service => {
        // Convertir la durée de chaque service (en minutes)
        const startTime = new Date(service.heureDebut).getTime();
        const endTime = new Date(service.heureFin).getTime();
        if (startTime && endTime) {
          totalDuration += (endTime - startTime);
        }
      });
    }
  
    return totalDuration;
  }

  calculateMontantTotal(rendezVous: RendezVous): number {
    if (!rendezVous) {
        console.error("Erreur : Aucun rendez-vous fourni.");
        return 0;
    }

    const totalServices = rendezVous.services.reduce((total, service) => {
        return total + (service.prixTotal || 0);
    }, 0);

    const totalPieces = rendezVous.piecesAchetees.reduce((total, piece) => {
        return total + (piece.prixTotal || 0);
    }, 0);

    return totalServices + totalPieces;
  }

  async savePaiement(rendezVous: RendezVous, heureFin: Date): Promise<void> {
    
    if (!rendezVous) {
        console.error("Erreur : Aucun rendez-vous sélectionné.");
        return;
    }

    let paiementData: any = {
        rendezVous: {
            _id: rendezVous._id,
        },
        montant: this.calculateMontantTotal(rendezVous) || 0,
        datePaiement: heureFin,
    };

    console.log(paiementData)

    const userString = localStorage.getItem('user');
    if (userString) {
        try {
            const user = JSON.parse(userString);
            paiementData = {
                ...paiementData,
                mecanicien: {
                    _id: user.idPersonne,
                },
                datePaiement: heureFin,
            };
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }

    console.log("paiementData >>>> ", paiementData);

    try {
        const updatedPaiement = await firstValueFrom(
            this.paiementService.addPaiement(paiementData)
        );
        console.log("Backend save for paiement successful:", updatedPaiement);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du service :", error);
    }
  } 

  getAllRendezVous() {
    this.rendezVousService.getRendezVousByMecanicien().subscribe({
        next: (listeRendezVous) => {
          console.log('Rendez-vous reçus:', listeRendezVous);
            this.listeRendezVous = listeRendezVous;

            this.dataSource.data = this.listeRendezVous;

            this.updateInterventionCounts();

            this.totalInterventions = this.listeRendezVous.length;

            this.updatePagination();
            if (this.paginator) {
                this.dataSource.paginator = this.paginator;
            }
        },
        error: (error) => {
            console.error('Erreur lors du chargement des rendez-vous:', error.message || error);
            alert('Impossible de charger la liste des rendez-vous. Veuillez vérifier votre connexion ou contacter le support.');
            this.listeRendezVous = [];
            this.dataSource.data = [];
            this.totalInterventions = 0;
            this.updateInterventionCounts();
        }
    });
  }

  updateInterventionCounts() {
    this.interventionsInProgress = 0;
    this.interventionsOpen = 0;
    this.interventionsClosed = 0;

    this.totalInterventions = this.listeRendezVous.length;
    this.interventionsInProgress = this.listeRendezVous.filter(t => t.etat?.toLowerCase() === 'en attente').length;
    this.interventionsOpen = this.listeRendezVous.filter(t => t.etat?.toLowerCase() === 'validé' || t.etat?.toLowerCase() === 'valide').length;
    this.interventionsClosed = this.listeRendezVous.filter(t => t.etat?.toLowerCase() === 'terminé' || t.etat?.toLowerCase() === 'termine').length;

  }

  updatePagination() {
    this.totalInterventions = this.listeRendezVous.length;

    this.dataSource.data = this.listeRendezVous;

  }

  onPaginateChange(event: PageEvent) {
      console.log('Paginate event:', event);
      this.currentPage = event.pageIndex;
      this.pageSize = event.pageSize;
  }

  trackByRendezVous(index: number, item: RendezVous): string {
    return item?._id ?? `index-${index}`;
  }

}