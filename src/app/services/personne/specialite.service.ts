import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface Specialite {
    _id: string;
    mecanicien: { _id: string, personne: {_id: string, nom: string, prenom: string} } | null;
    sousService: {
        _id: string;
        libelle: string;
        service: { 
            _id: string;
            libelle: string;
        }
    }
    dateEnregistrement: Date | null;
    manager: { _id: string, personne: {nom: string, prenom: string} } | null;
    dateSuppression: Date | null;
    managerSuppression: { _id: string, personne: {nom: string, prenom: string} } | null;
    etat: string;
}

@Injectable({
    providedIn: 'root'
})
export class SpecialiteService {
    private apiUrl = environment.apiUrl + '/specialites'; // URL API depuis le fichier d’environnement

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les sousServices
     */
    getSpecialites(): Observable<Specialite[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Specialite[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    getSpecialitesActives(): Observable<Specialite[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Specialite[]>(this.apiUrl + "/active", { headers }).pipe(
            catchError(this.handleError)
        );
    }

    getSpecialitesActivesBySousService(idSousService: string): Observable<Specialite[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Specialite[]>(this.apiUrl + "/mecanicien/" + idSousService, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Ajouter une nouvelle sousService
     */
    addSpecialite(idSousService: string, idMecanicien: string): Observable<Specialite> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        const specialiteData = {
            sousService: idSousService,
            mecanicien: idMecanicien
        };

        return this.http.post<Specialite>(this.apiUrl, specialiteData, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Modifier une specialite existante
     */
    updateSpecialite(specialite: Specialite): Observable<Specialite> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<Specialite>(`${this.apiUrl}/${specialite._id}`, specialite, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Supprimer une specialite par ID
     */
    deleteSpecialite(specialiteId: string): Observable<Specialite> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<Specialite>(`${this.apiUrl}/${specialiteId}`, { headers }).pipe(
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
