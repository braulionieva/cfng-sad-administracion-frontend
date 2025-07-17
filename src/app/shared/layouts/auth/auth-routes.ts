import { Routes } from '@angular/router';
import { AuthTwoComponent } from './auth-two.component';
import { LoginTwoComponent } from '@modulos/login-two/login-two.component';
import { VerificationStepsComponent } from '@modulos/login-two/components/verification-steps/verification-steps.component';
import { SesionValidarPasswordComponent } from '@modulos/login-two/components/sesion-validar-password/sesion-validar-password.component';
import { ListarDependeciasUsuarioComponent } from '@modulos/login-two/components/listar-dependecias-usuario/listar-dependecias-usuario.component';
import { CambiarContrasenaComponent } from '@modulos/login-two/components/cambiar-contrasena/cambiar-contrasena.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthTwoComponent,
    children: [
      { path: 'login', component: LoginTwoComponent },
      { path: 'login2/:username', component: SesionValidarPasswordComponent },
      { path: 'verification-steps', component: VerificationStepsComponent },

      {
        path: 'listar-dependencias-usuario/:username',
        component: ListarDependeciasUsuarioComponent,
      },
      {
        path: 'cambiar-contrasena',
        component: CambiarContrasenaComponent,
      },
      // {
      //   path: 'recuperar/pre',
      //   component: RecuperarContrasenaPreEmailComponent,
      // },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
