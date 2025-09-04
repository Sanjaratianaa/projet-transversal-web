import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthentificationService  } from 'src/app/services/authentification/authentification.service';
import { CommonModule, NgIf } from '@angular/common'; // Import NgIf
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-login-manager',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, NgIf, TablerIconsModule, MatIconModule, CommonModule],
  templateUrl: './side-login-manager.component.html',
})
export class AppSideLoginManagerComponent {
  errorMessage = '';
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthentificationService) {}

  form = new FormGroup({
    email: new FormControl('layah@example.com', [Validators.required, Validators.email]),
    password: new FormControl('securePassword123', [Validators.required, Validators.minLength(6)]),
  });

  get f() {
    return this.form.controls;
  }

  // submit() {
  //   this.router.navigate(['']);
  // }

  submit() {
    if (this.form.valid) {
      this.isLoading = true;
      this.authService.login(this.form.value.email!, this.form.value.password!).subscribe({
        next: (response) => {

          localStorage.setItem('token', response.token);

          this.authService.verifyToken(response.token).subscribe({
            next: (verificationResponse) => {

              if (verificationResponse.success) {
                localStorage.setItem('user', JSON.stringify(verificationResponse.user));
                this.router.navigate(['/dashboard']);
              } else {
                console.error('Token verification failed:', verificationResponse.message);
                this.errorMessage = verificationResponse.message || 'Token verification failed.';
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }
            }
          });

        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
      this.isLoading = false;
    } else {
      this.errorMessage = 'Please fill in all required fields.';
    }
  }
}
