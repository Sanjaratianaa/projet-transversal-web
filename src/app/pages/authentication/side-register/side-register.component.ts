import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { AuthentificationService  } from 'src/app/services/authentification/authentification.service';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  errorMessage = '';

  genderOptions = [
    { value: 'Homme', label: 'Homme' },
    { value: 'Femme', label: 'Femme' },
    { value: 'Autre', label: 'Autre' }
  ];

  options = this.settings.getOptions();

  constructor(private settings: CoreService, private router: Router, private authService: AuthentificationService) {}

  form = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(6)]),
    prenoms: new FormControl('', [Validators.required]),
    dateDeNaissance: new FormControl('', [Validators.required]),
    lieuDeNaissance: new FormControl('', [Validators.required]),
    genre: new FormControl('', [Validators.required]),
    numeroTelephone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]), // Add email validator
    motDePasse: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.valid) {
      const userData = {
        nom: this.form.value.nom!,
        prenom: this.form.value.prenoms!,
        dateDeNaissance: this.form.value.dateDeNaissance!,
        lieuDeNaissance: this.form.value.lieuDeNaissance!,
        genre: this.form.value.genre!,
        etat: "Active",
        numeroTelephone: this.form.value.numeroTelephone!,
        email: this.form.value.email!,
        motDePasse: this.form.value.motDePasse!,
        idRole: "client"
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log(response);
          this.router.navigate(['/authentication/client-login']);
        },
        error: (error) => {
          this.errorMessage = error.message;
          console.error('Registration error:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }
}