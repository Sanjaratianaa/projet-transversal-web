import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-confirm-annulation-modal',
  templateUrl: './confirm-annulation-modal.component.html',
  standalone: true,
  imports: [
    // Modules Angular et Angular Material
    NgIf, 
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatNativeDateModule,
    CommonModule
  ]
})
export class AnnulationConfirmationModalComponent {
  form: FormGroup; // Formulaire dynamique
  @Input() buttonLabel: string = 'Soumettre'; // Texte du bouton
  @Input() errorMessage: string = ''; // Message d'erreur
  @Output() saveData = new EventEmitter<any>(); // Événement pour envoyer les données

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AnnulationConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Données injectées
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      raison: ['', Validators.required]
    });
  }

  // Méthode pour fermer la modale avec confirmation
  confirmDelete(): void {
    if (this.form.valid) {
      this.dialogRef.close({ confirmed: true, raison: this.form.value.raison }); 
    }
  }

  // Méthode pour fermer la modale sans confirmation
  cancelDelete(): void {
    this.dialogRef.close({ confirmed: false, raison: '' }); 
  }

  canConfirm(): boolean {
    return this.form.valid;
  }
  
}
