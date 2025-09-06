import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

export interface Field {
  name: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  options?: { value: string; label: string; serviceId?: string }[];
}

@Component({
  selector: 'app-add-rendez-vous-modal',
  standalone: true,
  templateUrl: './rendez-vous-modal.component.html',
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
    MatNativeDateModule,
    MatIconModule
  ],
})
export class RendezVousModalComponent implements OnInit {
  form: FormGroup;
  @Input() title: string = '';
  @Input() fields: any[] = [];
  @Input() buttonLabel: string = 'Submit';
  @Input() errorMessage: string = '';
  @Output() saveData = new EventEmitter<any>();

  allSousServices: any[] = [];
  voituresOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RendezVousModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (!this.data || !this.data.fields) {
      console.log('Aucun champ fourni pour le formulaire dynamique.');
      return;
    }

    this.allSousServices = this.data.fields.find((f: Field) => f.name === 'id_sous_service')?.options || [];
    this.voituresOptions = this.data.fields.find((f: Field) => f.name === 'voiture')?.options || [];

    // Si un rendez-vous est fourni, on pré-remplit les champs
    const rv = this.data.rendezVous || {}; 
    console.log(rv);

    this.form = this.fb.group({
      voiture: [rv.voiture?._id || '', Validators.required],
      date: [rv.dateRendezVous ? new Date(rv.dateRendezVous).toISOString().slice(0, 16) : '', Validators.required],
      sousServicesArray: this.fb.array([])
    });

    // Pré-remplir les sous-services si disponibles
    if (rv.services && rv.services.length > 0) {
      rv.services.forEach((service: any) => {
        console.log(service);
        this.sousServicesFormArray.push(this.fb.group({
          id: [service.sousSpecialite._id, Validators.required],
          quantite: [service.quantiteEstimee || 1, Validators.min(1)],
          raison: [service.raison || '', Validators.required]
        }));
      });
    } else {
      this.addSousService(); // Ajoute un sous-service vide si aucun n'est fourni
    }
  }

  get sousServicesFormArray() {
    return this.form.get('sousServicesArray') as FormArray;
  }

  newSousServiceFormGroup(): FormGroup {
    return this.fb.group({
      id: ['', Validators.required],       // Sous-service ID
      quantite: [1, Validators.min(1)],     // Quantity (default 1, minimum 1)
      raison: ['', Validators.required],   // Reason
    });
  }

  addSousService() {
    this.sousServicesFormArray.push(this.newSousServiceFormGroup());
  }

  removeSousService(index: number) {
    this.sousServicesFormArray.removeAt(index);
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
      console.log(this.form.controls)
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}