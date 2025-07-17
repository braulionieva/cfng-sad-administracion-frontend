import { Routes } from '@angular/router';
import { isAuthGuard } from '@guards/is-auth.guard';
import { isUnauthGuard } from '@guards/is-unauth.guard';
import { AuthTwoComponent } from '@layouts/auth/auth-two.component';
import { AutoComponent } from '@modulos/auto/auto.component';

import { VerificationStepsComponent } from '@modulos/login-two/components/verification-steps/verification-steps.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'auth', pathMatch: 'full' },
      {
        path: 'auth',
        canActivate: [isUnauthGuard],
        loadChildren: () =>
          import('./shared/layouts/auth/auth-routes').then((m) => m.routes),
      },
      {
        path: 'auth/auto',
        component: AuthTwoComponent,
        children: [{ path: '', component: AutoComponent }],
      },
      {
        //recovery/pre y  recovery/post
        path: 'recovery',
        canActivate: [isUnauthGuard],
        loadChildren: () =>
          import('@modulos/recuperar-contrasena/auth-routes-recovery').then(
            (m) => m.routes
          ),
      },
      {
        path: 'app',
        canActivate: [isAuthGuard],
        loadChildren: () =>
          import('./modulos/modulos-routes').then((m) => m.routes),
      },
      {
        path: 'auth/verification-steps',
        component: VerificationStepsComponent,
      },
    ],
  },
];
