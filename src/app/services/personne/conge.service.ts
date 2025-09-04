import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface Personne {
    _id: string;
    nom: string;
    prenom: string;
    numeroTelephone: string;
    email: string;
    genre: string;
}

export interface Conge {
    _id: string;
    mecanicien: Personne;
    validateur: Personne;
    dateHeureDebut: Date;
    dateHeureFin: Date;
    dateHeureDemande: Date;
    remarque: string;
    raison: string;
    etat: string;
}

@Injectable({
    providedIn: 'root'
})
export class CongeService {
    private apiUrl = environment.apiUrl + '/conges'; // URL API depuis le fichier d’environnement

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les conge by mecanicien
     */
    getCongeByMecanicien(): Observable<Conge[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Conge[]>(`${this.apiUrl}/parMecanicien`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Récupérer toutes les sousServices
     */
    getAllConges(): Observable<Conge[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Conge[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Ajouter une nouvelle sousService
     */
    addConge(dateDebut: string, dateFin: string, raison: string): Observable<Conge> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        });

        const congeData = {
            dateHeureDebut: dateDebut,
            dateHeureFin: dateFin,
            raison: raison.trim()
        };

        return this.http.post<Conge>(this.apiUrl, congeData, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    getCongeByEtat(etat: string): Observable<Conge[]> {

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Conge[]>(`${this.apiUrl}/parEtat/${etat}`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une conge existante
     */
    updateConge(conge: any): Observable<Conge> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<Conge>(`${this.apiUrl}/${conge._id}`, conge, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Modifier une conge existante
     */
    answerConge(idConge: string, action: string, commentaire: string): Observable<Conge[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        const data = {
            action: action,
            commentaire: commentaire
        };

        return this.http.put<Conge[]>(`${this.apiUrl}/repondre/${idConge}`,  data, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une conge par ID
     */
    deleteConge(congeId: string): Observable<Conge> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<Conge>(`${this.apiUrl}/${congeId}`, { headers }).pipe(
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
