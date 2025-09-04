import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RendezVous } from 'src/app/services/rendez-vous/rendez-vous.service';

@Component({
    selector: 'app-detail-rendez-vous',
    templateUrl: './detail-rendez-vous.component.html',
    imports: [
        MatDialogModule,
        CommonModule,
        NgIf, NgFor, // Import Angular Common Pipes,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatTableModule,
        MatSelectModule,
        FormsModule,
        MatInputModule,
        MatIconModule
    ]
})
export class DetailRendezVousComponent implements OnInit {
    form: FormGroup;
    // Colonnes pour le tableau des services
    columns = ['sousSpecialite', 'raison', 'quantite', 'prix', 'remise', 'mecanicien'];
    displayedColumns: string[] = ['label', 'value'];

    voitureDetails = [
        { label: 'Marque', value: this.data.rendezVous.voiture.marque.libelle },
        { label: 'Modèle', value: this.data.rendezVous.voiture.modele.libelle },
        { label: 'Catégorie', value: this.data.rendezVous.voiture.categorie.libelle },
        { label: 'Transmission', value: this.data.rendezVous.voiture.typeTransmission.libelle },
        { label: 'Année', value: this.data.rendezVous.voiture.annee },
        { label: 'Immatriculation', value: this.data.rendezVous.voiture.numeroImmatriculation },
        { label: 'Kilométrage', value: `${this.data.rendezVous.voiture.kilometrage} km` },
        { label: 'Puissance Moteur', value: `${this.data.rendezVous.voiture.puissanceMoteur} w` },
        { label: 'Cylindrée', value: `${this.data.rendezVous.voiture.cylindree} cm³` },
        { label: 'Capacité Réservoir', value: `${this.data.rendezVous.voiture.capaciteReservoir} L` },
        { label: 'Pression Pneus', value: `${this.data.rendezVous.voiture.pressionPneusRecommande}` }
    ];

    constructor(
        public dialogRef: MatDialogRef<DetailRendezVousComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { rendezVous: RendezVous; isValidable: boolean; errorMessage: string },
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        // Créer un FormGroup avec un contrôle pour le commentaire et un FormArray pour les services.
        this.form = this.fb.group({
            commentaire: [''],
            services: this.fb.array(this.data.rendezVous.services.map(service =>
                this.fb.group({
                    mecanicien: [service.mecanicien, this.data.isValidable ? Validators.required : []]
                })
            ))
        });
    }

    // Accès facile au FormArray dans le template
    get servicesFormArray(): FormArray {
        return this.form.get('services') as FormArray;
    }

    close(): void {
        this.dialogRef.close();
    }

    // Vérifie si le commentaire est vide
    isCommentaireEmpty(): boolean {
        return !this.form.get('commentaire')?.value;
    }

    // Fonction qui gère l'activation/désactivation des boutons
    peutRejeter(): boolean {
        return !this.isCommentaireEmpty();
    }

    rejeter(): void {
        this.dialogRef.close({ action: 'rejeté', commentaire: this.form.value.commentaire, services: [] });
    }

    valider(): void {
        // Fusionner les données mises à jour
        const updatedServices = this.data.rendezVous.services.map((service, i) => ({
            ...service,
            mecanicien: this.servicesFormArray.at(i).value.mecanicien,
        }));

        this.dialogRef.close({
            action: 'validé',
            services: updatedServices,
            commentaire: this.form.value.commentaire,
        });
    }

    peutValider(): boolean {
        if (!this.data.isValidable) {
            return true;
        }
        // Vérifier que tous les contrôles du FormArray sont valides
        return this.servicesFormArray.controls.every((ctrl) => ctrl.valid);
    }


}
