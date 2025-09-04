import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user?.exp) {
      // console.log('✅ NoAuthGuard - Allowed Access to login pages');
      return true; // Permet d’accéder aux pages de login
    }

    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes

    if (user.exp > currentTime) {
      // console.log('🔄 NoAuthGuard - Valid token, Redirecting to Dashboard');
      this.router.navigate(['/dashboard']);
      return false; // Bloque l’accès aux pages de login
    }

    // console.log('✅ NoAuthGuard - Token expired, Allowed Access to login pages');
    return true; // Si le token est expiré, on laisse l’accès aux pages de login
  }
}
