import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface GestionStock {
    _id: string;
    piece: {
        _id: string;
        libelle: string;
    } | any,
    marquePiece: string;
    marqueVoiture: {
        _id: string;
        libelle: string;
    } | any,
    modeleVoiture: {
        _id: string;
        libelle: string;
    } | any,
    typeTransmission: {
        _id: string;
        libelle: string;
    } | any,
    entree: number | 0,
    sortie: number | 0,
    prixUnitaire: number | 0,
    dateHeure: Date | null;
    manager: { id: string, nom: string, prenom: string } | null;
}

@Injectable({
    providedIn: 'root'
})
export class GestionStockService {
    private apiUrl = environment.apiUrl + '/stocks'; // URL API depuis le fichier d’environnement
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
     * Récupérer toutes les stocks
     */
    getGestionStocks(): Observable<GestionStock[]> {
        return this.http.get<GestionStock[]>(this.apiUrl, {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Ajouter une nouvelle stock
     */
    addGestionStock(idPiece: string, marquePiece: string, idMarque: string, idModele: string, idTypeTransmission: string, entree: number, sortie: number, prixUnitaire: number): Observable<GestionStock> {
        const mouvementData = {
            piece: idPiece,
            marquePiece: marquePiece.trim().toUpperCase(),
            marqueVoiture: idMarque === '0' ? null : idMarque,
            modeleVoiture: idModele === '0' ? null : idModele,
            typeTransmission: idTypeTransmission === '0' ? null : idTypeTransmission,
            entree: entree,
            sortie: sortie,
            prixUnitaire: prixUnitaire
        };
        return this.http.post<GestionStock>(this.apiUrl, mouvementData, {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une stock existante
     */
    updateGestionStock(stock: GestionStock): Observable<GestionStock> {
        return this.http.put<GestionStock>(`${this.apiUrl}/${stock._id}`, stock, {headers: this.headers}).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une stock par ID
     */
    deleteGestionStock(stockId: string): Observable<GestionStock> {
        return this.http.delete<GestionStock>(`${this.apiUrl}/${stockId}`, {headers: this.headers}).pipe(
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

    getStocks(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + "/stocks", {headers: this.headers}).pipe(
            catchError(this.handleError) // Prix des erreurs
        );
    }
}