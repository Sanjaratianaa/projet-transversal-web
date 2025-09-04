import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface Promotion {
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
    dateDebut: Date | null;
    dateFin: Date | null;
    remise: number | 0;
    dateEnregistrement: Date | null;
}

@Injectable({
    providedIn: 'root'
})
export class PromotionService {
    private apiUrl = environment.apiUrl + '/promotions'; // URL API depuis le fichier d’environnement

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les sousServices
     */
    getPromotions(): Observable<Promotion[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Promotion[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Récupérer un sousService
     */
    getPromotion(sousServiceId: string): Observable<Promotion> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Promotion>(`${this.apiUrl}/${sousServiceId}`, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Ajouter une nouvelle sousService
     */
    addPromotion(idSousService: string, dateDebut: Date, dateFin: Date, remise: number): Observable<Promotion> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        const promotionData = {
            sousService: idSousService,
            dateDebut: dateDebut,
            dateFin: dateFin,
            remise: remise
        };

        return this.http.post<Promotion>(this.apiUrl, promotionData, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Modifier une sousService existante
     */
    updatePromotion(sousService: Promotion): Observable<Promotion> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<Promotion>(`${this.apiUrl}/${sousService._id}`, sousService, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Supprimer une sousService par ID
     */
    deletePromotion(sousServiceId: string): Observable<Promotion> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<Promotion>(`${this.apiUrl}/${sousServiceId}`, { headers }).pipe(
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
