import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface Personne {
    _id: string;
    nom: string;
    prenom: string;
    dateDeNaissance: Date | null;
    lieuDeNaissance: string;
    genre: string;
    numeroTelephone: string;
    email: string;
    motDePasse: string;
    etat: string;
}

export interface Utilisateur {
    _id: string;
    personne: Personne;
    idRole: string;
    etat: string;
    dateInscription: Date;
    matricule: string;
    dateEmbauche: Date | any;
    dateEnregistrement: Date |any;
    dateSuppression: Date | any;
}

@Injectable({
    providedIn: 'root'
})
export class PersonneService {
    private apiUrl = environment.apiUrl + '/personne';

    private utilisateurApiUrl = environment.apiUrl + '/utilisateur';

    constructor(private http: HttpClient) { }

    /**
     * Récupérer toutes les personnes
     */
    getPersonnes(): Observable<Personne[]> {
        return this.http.get<Personne[]>(this.apiUrl).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Récupérer toutes les employés actives
     */
    getActiveByRole(role: string): Observable<Utilisateur[]> {
        return this.http.get<Utilisateur[]>(`${environment.apiUrl}/utilisateur/active-utilisateurs-by-role?role=${role}`).pipe(
            catchError(this.handleError)
        );
    }

    getAllByRole(role: string): Observable<Utilisateur[]> {
        return this.http.get<Utilisateur[]>(`${environment.apiUrl}/utilisateur/utilisateurs-by-role?role=${role}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Ajouter une nouvelle personne
     */
    addPersonne(personneData: any): Observable<Utilisateur> {
        return this.http.post<Utilisateur>(environment.apiUrl + '/auth/register', personneData).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une personne existante
     */
    updatePersonne(utilisateur: Utilisateur): Observable<Utilisateur> {
        this.http.put<Personne>(`${this.apiUrl}/${utilisateur.personne._id}`, utilisateur.personne).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
        return this.http.put<Utilisateur>(`${this.utilisateurApiUrl}/${utilisateur._id}`, utilisateur).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une personne par ID
     */
    deletePersonne(utilisateurId: string): Observable<Utilisateur> {
        return this.http.delete<Utilisateur>(`${this.utilisateurApiUrl}/${utilisateurId}`).pipe(
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
