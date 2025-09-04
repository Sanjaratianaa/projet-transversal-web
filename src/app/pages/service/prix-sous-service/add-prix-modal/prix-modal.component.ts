import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  options?: { value: string; label: string; serviceId?: string }[]; // Ajout du typage pour les options
}

@Component({
  selector: 'app-add-prix-modal',
  standalone: true,
  templateUrl: './prix-modal.component.html',
  imports: [
    NgIf, NgFor,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
})
export class PrixModalComponent implements OnInit {
  form: FormGroup;
  @Input() title: string = '';
  @Input() fields: any[] = [];
  @Input() buttonLabel: string = 'Submit';
  @Input() errorMessage: string = '';
  @Output() saveData = new EventEmitter<any>();

  filteredSousServices: any[] = [];
  servicesOptions: any[] = []; // Stocker les options des services

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PrixModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (!this.data || !this.data.fields) {
      console.log('Aucun champ fourni pour le formulaire dynamique.');
      return;
    }

    const controls: { [key: string]: any[] } = {};

    // Initialisation du formulaire avec les valeurs par défaut définies dans chaque champ
    this.data.fields.forEach((field: any) => {
      let validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }

      // Si un `defaultValue` est défini dans le champ, l'utiliser ; sinon, un champ vide
      controls[field.name] = [field.defaultValue || '', validators];
    });

    this.form = this.fb.group(controls);

    // Initialisation des options pour le service
    this.servicesOptions = this.data.fields.find((f: Field) => f.name === 'id_service')?.options || [];
    this.filteredSousServices = [];

    // Mettre à jour les sous-services en fonction du service sélectionné
    if (this.form.get('id_service')?.value) {
      this.updateSousServices(this.form.get('id_service')?.value);
    }

    this.form.get('id_service')?.valueChanges.subscribe(serviceId => {
      this.updateSousServices(serviceId);
    });
  }

  updateSousServices(serviceId: string) {
    const sousServiceField = this.data.fields.find((f: Field) => f.name === 'id_sous_service');
    if (sousServiceField) {
      this.filteredSousServices = sousServiceField.options.filter((sousService: any) => sousService.serviceId === serviceId);
    }
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
