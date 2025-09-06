import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environnements/environnement'; // Import de l’environnement

export interface Service {
    _id: string;
    libelle: string;
    dateEnregistrement: Date | null;
    manager: { id: string, nom: string, prenom: string } | any;
    dateSuppression: Date | any;
    managerSuppression: { id: string, nom: string, prenom: string } | any;
    etat: number;
}

@Injectable({
    providedIn: 'root'
})
export class ServiceService {
    private apiUrl = environment.apiUrl + '/services'; // URL API depuis le fichier d’environnement

    constructor(private http: HttpClient) { }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Récupérer toutes les services
     */
    getServices(): Observable<Service[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });
        return this.http.get<Service[]>(this.apiUrl, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Récupérer toutes les services
     */
    getServicesActives(): Observable<Service[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.get<Service[]>(this.apiUrl + "/active", { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Ajouter une nouvelle service
     */
    addService(libelle: string): Observable<Service> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        const serviceData = {
            libelle: libelle, // Inclure seulement le libelle
        };
        return this.http.post<Service>(this.apiUrl, serviceData, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Modifier une service existante
     */
    updateService(service: Service): Observable<Service> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.put<Service>(`${this.apiUrl}/${service._id}`, service, { headers }).pipe(
            catchError(this.handleError) // Gestion des erreurs
        );
    }

    /**
     * Supprimer une service par ID
     */
    deleteService(serviceId: string): Observable<Service> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });

        return this.http.delete<Service>(`${this.apiUrl}/${serviceId}`, { headers }).pipe(
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
