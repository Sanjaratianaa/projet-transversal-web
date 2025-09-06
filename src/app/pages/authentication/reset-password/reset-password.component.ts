import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthentificationService  } from 'src/app/services/authentification/authentification.service';
import { NgIf } from '@angular/common'; // Import NgIf

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './reset-password.component.html',
})
export class AppResetPasswordComponent {
  errorMessage = '';

  constructor(private router: Router, private authService: AuthentificationService) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    oldPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get f() {
    return this.form.controls;
  }

  // submit() {
  //   this.router.navigate(['']);
  // }

  submit() {
    if (this.form.valid) {
      this.authService.changePassword(this.form.value.email!, this.form.value.oldPassword!, this.form.value.newPassword!, this.form.value.confirmPassword!).subscribe({
        next: (response) => {
          this.router.navigate(['/authentification/login']);
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }
}
