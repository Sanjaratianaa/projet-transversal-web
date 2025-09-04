import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface PrixPiece {
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
    prixUnitaire: number | 0,
    date: Date | null;
    manager: { id: string, nom: string, prenom: string } | null;
}

@Injectable({
    providedIn: 'root'
})
export class PrixPieceService {
    private apiUrl = environment.apiUrl + '/prixPieces'; // URL API depuis le fichier d’environnement
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
     * Récupérer toutes les prix des pieces
     */
    getPrixPieces(): Observable<PrixPiece[]> {
        return this.http.get<PrixPiece[]>(this.apiUrl, {headers: this.headers}).pipe(
            catchError(this.handleError) // Prix des erreurs
        );
    }

    /**
     * Ajouter une nouvelle stock
     */
    addPrixPiece(idPiece: string, marquePiece: string, idMarque: string, idModele: string, idTypeTransmission: string, prixUnitaire: number, date: Date): Observable<PrixPiece> {
        const mouvementData = {
            piece: idPiece,
            marquePiece: marquePiece.trim().toUpperCase(),
            marqueVoiture: idMarque === '0' ? null : idMarque,
            modeleVoiture: idModele === '0' ? null : idModele,
            typeTransmission: idTypeTransmission === '0' ? null : idTypeTransmission,
            prixUnitaire: prixUnitaire,
            date: date
        };
        return this.http.post<PrixPiece>(this.apiUrl, mouvementData, {headers: this.headers}).pipe(
            catchError(this.handleError) // Prix des erreurs
        );
    }

    /**
     * Modifier une stock existante
     */
    updatePrixPiece(stock: PrixPiece): Observable<PrixPiece> {
        stock.marquePiece = stock.marquePiece.toUpperCase();
        const mouvementData = {
            piece: stock.piece,
            marquePiece: stock.marquePiece.toUpperCase(),
            marqueVoiture: stock.marqueVoiture._id === '0' ? null : stock.marqueVoiture._id,
            modeleVoiture: stock.modeleVoiture._id === '0' ? null : stock.modeleVoiture._id,
            typeTransmission: stock.typeTransmission._id === '0' ? null : stock.typeTransmission._id,
            prixUnitaire: stock.prixUnitaire,
            date: stock.date,
        };
        return this.http.put<PrixPiece>(`${this.apiUrl}/${stock._id}`, mouvementData, {headers: this.headers}).pipe(
            catchError(this.handleError) // Prix des erreurs
        );
    }

    /**
     * Supprimer une stock par ID
     */
    deletePrixPiece(stockId: string): Observable<PrixPiece> {
        return this.http.delete<PrixPiece>(`${this.apiUrl}/${stockId}`).pipe(
            catchError(this.handleError) // Prix des erreurs
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