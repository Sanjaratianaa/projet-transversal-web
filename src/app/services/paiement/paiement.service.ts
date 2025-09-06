import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface Paiement {
    _id: string;
    rendezVous: { 
        _id: string;
        dateRendezVous: Date;
        etat: string;
        heureFin: string | any | null;
        heureDebut: string | any | null;
    },
    montant: number | 0,
    datePaiement: Date | null;
    mecanicien: { _id: string, nom: string, prenom: string } | any;
}

@Injectable({
    providedIn: 'root'
})
export class PaiementService {
    private apiUrl = environment.apiUrl + '/paiements';

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les sousServices
     */
    getPaiements(): Observable<Paiement[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Paiement[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    getPaiementsActives(): Observable<Paiement[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Paiement[]>(this.apiUrl + "/active", { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Ajouter une nouvelle paiement
     */
    addPaiement(paiement: any): Observable<Paiement> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.post<Paiement>(this.apiUrl, paiement, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une paiement existante
     */
    updatePaiement(paiement: Paiement): Observable<Paiement> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<Paiement>(`${this.apiUrl}/${paiement._id}`, paiement, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une paiement par ID
     */
    deletePaiement(paiementId: string): Observable<Paiement> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<Paiement>(`${this.apiUrl}/${paiementId}`, { headers }).pipe(
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
