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

export interface Voiture {
    _id: string;
    client: string;
    marque: { _id: string; libelle: string; };
    modele: { _id: string; libelle: string; };
    categorie: { _id: string; libelle: string; };
    typeTransmission: { _id: string; libelle: string; };
    annee: number;
    numeroImmatriculation: string;
    kilometrage: number;
    puissanceMoteur: number;
    cylindree: number;
    capaciteReservoir: number;
    pressionPneusRecommande: string;
}

export interface SousSpecialite {
    _id: string;
    service: { _id: string; libelle: string; };
    libelle: string;
    duree: number;
    ptix: number;
}

export interface Service {
    _id: string;
    sousSpecialite: SousSpecialite;
    raison: string;
    mecanicien: Personne;
    quantiteEstimee: number;
    quantiteFinale: number | 0;
    prixUnitaire: number;
    prixTotal: number | 0;
    heureFin: string | any | null;
    heureDebut: string | any | null;
    mecaniciensDisponibles: any[];
    commentaire: string | null;
    status: string;
    tempStatus?: string;
    remise: number | 0;
    note: number | 5;
    avis: string;
}

export interface Piece {
    _id: string;
    libelle: string;
}

export interface Marque {
    _id: string;
    libelle: string;
}

export interface Modele {
    _id: string;
    libelle: string;
}

export interface TypeTransmission {
    _id: string;
    libelle: string;
}

export interface PiecesAchetees {
    piece: Piece;
    marquePiece: string;
    marqueVoiture: Marque;
    modeleVoiture: Modele;
    typeTransmission: TypeTransmission;
    quantite: Number;
    prixUnitaire: number;
    prixTotal: number;
    commentaire: string;
}

export interface RendezVous {
    _id: string;
    client: Personne;
    validateur: Personne;
    voiture: Voiture;
    services: Service[];
    dateRendezVous: Date;
    etat: string;
    dateHeureDemande: Date;
    piecesAchetees: PiecesAchetees[];
    remarque: string;
    heureFin: string | any | null;
    heureDebut: string | any | null;
}

@Injectable({
    providedIn: 'root'
})
export class RendezVousService {
    private apiUrl = environment.apiUrl + '/rendezVous'; // URL API depuis le fichier d’environnement

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les rendezVous
     */
    getRendezVous(): Observable<RendezVous[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<RendezVous[]>(`${this.apiUrl}/liste/parClient`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    getRendezVousById(idRendezVous: string): Observable<RendezVous> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<RendezVous>(`${this.apiUrl}/${idRendezVous}`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Récupérer toutes les rendezVous by mecanicien
     */
    getRendezVousByMecanicien(): Observable<RendezVous[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<RendezVous[]>(`${this.apiUrl}/parMecanicien`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Récupérer toutes les sousServices
     */
    getAllRendezVous(): Observable<RendezVous[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<RendezVous[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Ajouter une nouvelle sousService
     */
    addRendezVous(rendezVousData: any): Observable<RendezVous> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        });

        console.log("API URL:", this.apiUrl);

        console.log("data: ", rendezVousData);

        return this.http.post<RendezVous>(this.apiUrl, rendezVousData, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    getRendezVousByEtat(etat: string): Observable<RendezVous[]> {

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<RendezVous[]>(`${this.apiUrl}/parEtat/${etat}`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une rendezVous existante
     */
    updateRendezVous(rendezVous: any): Observable<RendezVous> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<RendezVous>(`${this.apiUrl}/${rendezVous._id}`, rendezVous, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Modifier une rendezVous existante
     */
    answerRendezVous(idRendezVous: string, action: string, commentaire: string, services: Service[], nouveauMecanicienId: string): Observable<RendezVous[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        const actions: any[] = [
            {
                action: action,
                commentaire: commentaire,
                services: services,
                nouveauMecanicienId: nouveauMecanicienId
            }
        ];

        return this.http.put<RendezVous[]>(`${this.apiUrl}/repondre/${idRendezVous}`, { actions }, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une rendezVous par ID
     */
    deleteRendezVous(rendezVousId: string): Observable<RendezVous> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<RendezVous>(`${this.apiUrl}/${rendezVousId}`, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Ajouter un piece
     */
    addNewPiece(rendezVousId: string, idPiece: string, marquePiece: string, idMarque: string, idModele: string, idTypeTransmission: string, quantite: number, commentaire: number): Observable<RendezVous> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });
        
        const pieceData = {
            piece: idPiece,
            marquePiece: marquePiece.trim().toUpperCase(),
            marqueVoiture: idMarque === '0' ? null : idMarque,
            modeleVoiture: idModele === '0' ? null : idModele,
            typeTransmission: idTypeTransmission === '0' ? null : idTypeTransmission,
            quantite: quantite,
            commentaire: commentaire,
        };
        return this.http.put<RendezVous>(this.apiUrl + "/ajoutPiece/" + rendezVousId, pieceData, { headers }).pipe(
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
