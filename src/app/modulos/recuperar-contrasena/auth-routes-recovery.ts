import { Routes } from "@angular/router";
import { RecuperarContrasenaPreEmailComponent } from "./recuperar-contrasena-pre-email/recuperar-contrasena-pre-email.component";
import { RecuperarContrasenaPostEmailComponent } from "./recuperar-contrasena-post-email/recuperar-contrasena-post-email.component";
import {
  RecuperarContrasenaLayoutComponent
} from "@modulos/recuperar-contrasena/recuperar-contrasena-layout/recuperar-contrasena-layout.component";

export const routes: Routes = [
    {
      path: '',
      //component: RecuperarContrasenaComponent,
      component: RecuperarContrasenaLayoutComponent,
      children: [
        { path: 'pre', component: RecuperarContrasenaPreEmailComponent },
        { path: '', redirectTo: 'pre', pathMatch: 'full' },
        { path: 'post', component: RecuperarContrasenaPostEmailComponent },
      ],
    },
  ];
