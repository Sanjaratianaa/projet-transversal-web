import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement';

interface LoginResponse {
    token: string;
}

interface RegisterResponse {
    message: string;
    data: any;
}

interface ChangePasswordResponse {
  message: string;
  data: any;
}

interface TokenVerificationSuccessResponse {
  success: true;
  user: any;
}

interface TokenVerificationErrorResponse {
  success: false;
  message: string;
}

type TokenVerificationResponse =
  | TokenVerificationSuccessResponse
  | TokenVerificationErrorResponse;

@Injectable({
    providedIn: 'root'
})
export class AuthentificationService {
    private apiUrl = environment.apiUrl + '/auth';

    constructor(private http: HttpClient) { }

    /**
   * Login user
   */
    login(email: string, password: string): Observable<LoginResponse> {
        const body = { email, password };
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body).pipe(
          catchError(this.handleError)
        );
      }

    /**
     * Register user
     */
    register(userData: any): Observable<RegisterResponse> { // Consider a specific type for userData
        return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
            catchError(this.handleError)
        );
    }

     /**
   * Change password user
   */
     changePassword(email: string, oldPassword: string, newPassword: string, confirmPassword: string): Observable<ChangePasswordResponse> {
        const body = { email, oldPassword, newPassword, confirmPassword };
        return this.http.post<ChangePasswordResponse>(`${this.apiUrl}/change-password`, body).pipe(
          catchError(this.handleError)
        );
      }
  
    /**
     * Verify token
     */
    // verifyToken(token: string): Observable<any> {
    //   const headers = new HttpHeaders({
    //     'Authorization': `Bearer ${token}`
    //   });
  
    //   return this.http.get<any>(`${this.apiUrl}/verifyToken`, { headers }).pipe(
    //     catchError(this.handleError)
    //   );
    // }

    verifyToken(token: string): Observable<TokenVerificationResponse> {
    
      return this.http.post<TokenVerificationResponse>(`${this.apiUrl}/verifyToken`, { token }).pipe(
        tap(response => {
          console.log("verifyToken response received:", response);
        }),
        catchError(error => {
          console.error("Error in verifyToken:", error);
          return this.handleError(error);
        })
      );
    }
    
    /**
   * Error handling function
   */
    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            errorMessage = `${error.error.message || error.message}`; //Improved error
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}