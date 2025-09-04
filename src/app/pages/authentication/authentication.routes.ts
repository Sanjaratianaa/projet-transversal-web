import { Routes } from '@angular/router';
import { NoAuthGuard } from 'src/app/guard/no-auth.guard';

import { AppSideLoginManagerComponent } from './side-login/manager/side-login-manager.component'
import { AppSideLoginClientComponent } from './side-login/client/side-login-client.component';
import { AppSideLoginMecanicienComponent } from './side-login/mecanicien/side-login-mecanicien.component';
import { AppResetPasswordComponent } from './reset-password/reset-password.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';

export const AuthenticationRoutes: Routes = [
  {
    path: 'manager-login',
    component: AppSideLoginManagerComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'mecanicien-login',
    component: AppSideLoginMecanicienComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'client-login',
    component: AppSideLoginClientComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'resetPassword',
    component: AppResetPasswordComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'register',
    component: AppSideRegisterComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: '',
    redirectTo: 'client-login',
    pathMatch: 'full'
  }
];