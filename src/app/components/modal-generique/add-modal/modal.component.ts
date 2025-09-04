import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';

export interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}


@Component({
  selector: 'app-generic-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  imports: [
    NgIf, NgFor, // Import Angular Common Pipes,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule
  ],
})
export class GenericModalComponent implements OnInit {
  form: FormGroup; // Formulaire dynamique
  @Input() title: string = '';  // Titre de la modale
  @Input() fields: any[] = [];  // Liste des champs à afficher dans le formulaire
  @Input() buttonLabel: string = 'Submit';  // Le texte du bouton
  @Input() errorMessage: string = '';  // Recevoir l'erreur du parent
  @Output() saveData = new EventEmitter<any>();  // L'event pour émettre les données sauvegardées

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GenericModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // Vérifier si `data.fields` contient bien des champs
    if (!this.data || !this.data.fields) {
      console.log('Aucun champ fourni pour le formulaire dynamique.');
      return;
    }

    // Construire le formulaire dynamique en fonction des `fields`  
    const controls: { [key: string]: any[] } = {};  
    this.data.fields.forEach((field : Field) => {
      let validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      controls[field.name] = [field.defaultValue || '', validators];
    });

    this.form = this.fb.group(controls);
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value); // Retourner les valeurs du formulaire
    } else {
      this.form.markAllAsTouched(); // Marquer tous les champs comme "touchés"
    }
  }

  cancel() {
    this.dialogRef.close(null); // Annuler sans rien retourner
  }
}
