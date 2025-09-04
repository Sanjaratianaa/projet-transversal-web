import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface Voiture {
    _id: string;
    client: { id: string, nom: string, prenom: string } | null;
    marque: {
        _id: string;
        libelle: string;
    } | any,
    modele: {
        _id: string;
        libelle: string;
    } | any,
    categorie: {
        _id: string;
        libelle: string;
    } | any,
    typeTransmission: {
        _id: string;
        libelle: string;
    } | any,
    annee: number | 0,
    numeroImmatriculation: string
    kilometrage: number | 0,
    puissanceMoteur: number | 0,
    cylindree:number | 0,
    capaciteReservoir:  number | 0,
    pressionPneusRecommande: string,
    dateEnregistrement: Date | null;
    dateSuppression: Date | null;
    etat: string;
}

@Injectable({
    providedIn: 'root'
})
export class VoitureService {
    private apiUrl = environment.apiUrl + '/voitures'; // URL API depuis le fichier d’environnement
    private headers: HttpHeaders;

    constructor(private http: HttpClient) {
        this.getHeader();
    }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private getHeader(): void {
        this.headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });
    }

    /**
     * Récupérer toutes les voitures
     */
    getVoitures(): Observable<Voiture[]> {
        return this.http.get<Voiture[]>(this.apiUrl, {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    getVoituresByClient(): Observable<Voiture[]> {
        return this.http.get<Voiture[]>(this.apiUrl + "/client", {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Récupérer une voiture
     */
    getVoituresById(voitureId: string): Observable<Voiture> {
        return this.http.get<Voiture>(this.apiUrl + "/one/" + voitureId, {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Ajouter une nouvelle voiture
     */
    addVoiture(idMarque: string, idModele: string, idCategorie: string, idTypeTransmission: string, annee: number,
        numeroImmatriculation: string, kilometrage: number, puissanceMoteur: number, cylindree: number, capaciteReservoir: number, 
    pressionPneusRecommande: number): Observable<Voiture> {
        const voitureData = {
            marque: idMarque,
            modele: idModele,
            categorie: idCategorie,
            typeTransmission: idTypeTransmission,
            annee: annee,
            numeroImmatriculation: numeroImmatriculation,
            kilometrage: kilometrage,
            puissanceMoteur: puissanceMoteur,
            cylindree: cylindree,
            capaciteReservoir: capaciteReservoir,
            pressionPneusRecommande: pressionPneusRecommande

        };

        console.log(voitureData);

        return this.http.post<Voiture>(this.apiUrl, voitureData, {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une voiture existante
     */
    updateVoiture(voiture: Voiture): Observable<Voiture> {
        return this.http.put<Voiture>(`${this.apiUrl}/${voiture._id}`, voiture, {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une voiture par ID
     */
    deleteVoiture(voitureId: string): Observable<Voiture> {
        return this.http.delete<Voiture>(`${this.apiUrl}/${voitureId}`, {headers: this.headers}).pipe(
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