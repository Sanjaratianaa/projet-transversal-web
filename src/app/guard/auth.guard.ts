import { Injectable } from '@angular/core';
import { CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthentificationService } from '../services/authentification/authentification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {

  constructor(private authService: AuthentificationService, private router: Router) { }

  // La méthode doit être en minuscule, `canActivateChild` et non `CanActivateChild`
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // console.log("state.url: " + state.url);

    // Si la page actuelle est une page de login, ne pas bloquer l'accès
    const loginPages = ['/authentication/login-client', '/authentication/login-manager', '/authentication/login-mecanicien', '/login'];
    if (loginPages.includes(state.url)) {
      // console.log("ouiiiii loginnnnn")
      return true;
    }

    if (token && user && user.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes
      // console.log(user.exp + " > ? " + currentTime);
      if (user.exp > currentTime) {
        // console.log('AuthGuard - Allowed Access');
        // Token exists, allow access to the route
        return true;
      } else {
        // console.log('AuthGuard - Redirecting to Login');
        const role = user.role.libelle;
        let redirectUrl = '/authentication/client-login';
        if (role === "manager") {
          redirectUrl = '/authentication/manager-login';
        } else if (role === "mécanicien") {
          redirectUrl = '/authentication/mecanicien-login';
        }

        // return this.router.navigate([redirectUrl]).then(() => false);
        // Exécuter la redirection APRES avoir retourné false
        setTimeout(() => {
          // console.log("redirect eooooooooooooooooooooooooo");
          this.router.navigate([redirectUrl]);
        }, 0);
        // document.location.href = redirectUrl;
        // this.router.navigate([redirectUrl]);
        return false;
      }
    } else {
      // console.log('AuthGuard - Redirecting to Login');
      // No token, redirect to the login page
      this.router.navigate(['/authentication/client-login']); // Corrected redirect
      return false;
    }
  }
}
