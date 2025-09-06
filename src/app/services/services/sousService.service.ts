import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface SousService {
    _id: string;
    libelle: string;
    service: { 
        _id: string;
        libelle: string;
    },
    duree: number | 0, 
    prixUnitaire: number | 0,
    remise: number | 0,
    dateEnregistrement: Date | null;
    manager: { id: string, nom: string, prenom: string } | any;
    dateSuppression: Date | any;
    managerSuppression: { id: string, nom: string, prenom: string } | any;
    etat: number;
}

@Injectable({
    providedIn: 'root'
})
export class SousServiceService {
    private apiUrl = environment.apiUrl + '/sousServices'; // URL API depuis le fichier d’environnement

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les sousServices
     */
    getSousServices(): Observable<SousService[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<SousService[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    getSousServicesActives(): Observable<SousService[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<SousService[]>(this.apiUrl + "/active", { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Ajouter une nouvelle sousService
     */
    addSousService(libelle: string, duree: number, idService: string): Observable<SousService> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        const sousServiceData = {
            libelle: libelle, // Inclure seulement le libelle,
            duree: duree,
            service: idService
        };
        return this.http.post<SousService>(this.apiUrl, sousServiceData, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une sousService existante
     */
    updateSousService(sousService: SousService): Observable<SousService> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<SousService>(`${this.apiUrl}/${sousService._id}`, sousService, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une sousService par ID
     */
    deleteSousService(sousServiceId: string): Observable<SousService> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<SousService>(`${this.apiUrl}/${sousServiceId}`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Fonction de gestion des erreurs HTTP
     */
    private handleError(error: HttpErrorResponse) {
        let errorMessage = error.error.message;
        console.log("handle erreur: erreor message : " + errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
