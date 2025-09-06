import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-repondre-conge',
    templateUrl: './repondre-conge.component.html',
    imports: [
        MatDialogModule,
        CommonModule,
        NgIf,  // Import Angular Common Pipes,
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
export class RepondreDemandeCongeComponent implements OnInit {
    form: FormGroup;
    // Colonnes pour le tableau des services
    constructor(
        public dialogRef: MatDialogRef<RepondreDemandeCongeComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { errorMessage: string },
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        // Créer un FormGroup avec un contrôle pour le commentaire et un FormArray pour les services.
        this.form = this.fb.group({
            commentaire: [''],
        });
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
        this.dialogRef.close({
            action: 'validé',
            commentaire: this.form.value.commentaire,
        });
    }

    peutValider(): boolean {
        return !this.isCommentaireEmpty();
    }


}
