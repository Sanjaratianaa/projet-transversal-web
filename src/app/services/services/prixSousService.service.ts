import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface PrixSousService {
    _id: string;
    sousService: {
        _id: string;
        libelle: string;
        service: { 
            _id: string;
            libelle: string;
        },
        duree: number | 0
    }
    date: Date | null;
    prixUnitaire: number | 0;
    dateEnregistrement: Date | null;
}

@Injectable({
    providedIn: 'root'
})
export class PrixSousServiceService {
    private apiUrl = environment.apiUrl + '/prixSousServices'; // URL API depuis le fichier d’environnement

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les sousServices
     */
    getPrixSousServices(): Observable<PrixSousService[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<PrixSousService[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Récupérer un sousService
     */
    getPrixSousService(sousServiceId: string): Observable<PrixSousService> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<PrixSousService>(`${this.apiUrl}/${sousServiceId}`, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Ajouter une nouvelle sousService
     */
    addPrixSousService(idSousService: string, date: Date, prixUnitaire: number): Observable<PrixSousService> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        const prixSousServiceData = {
            sousService: idSousService,
            date: date,
            prixUnitaire: prixUnitaire
        };

        return this.http.post<PrixSousService>(this.apiUrl, prixSousServiceData, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Modifier une sousService existante
     */
    updatePrixSousService(sousService: PrixSousService): Observable<PrixSousService> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<PrixSousService>(`${this.apiUrl}/${sousService._id}`, sousService, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Supprimer une sousService par ID
     */
    deletePrixSousService(sousServiceId: string): Observable<PrixSousService> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<PrixSousService>(`${this.apiUrl}/${sousServiceId}`, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Fonction de gestion des erreurs HTTP
     */
    private handleError(error: HttpErrorResponse) {
        let errorMessage = error.error.message;
        console.log("handle erreur: error message : " + errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
