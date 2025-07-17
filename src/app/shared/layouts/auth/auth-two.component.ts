import { CommonModule } from '@angular/common';
import { Component, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule],
  selector: 'app-auth-two',
  templateUrl: './auth-two.component.html',
  styleUrls: ['./auth-two.component.scss'],
  providers: [MessageService],
})
export class AuthTwoComponent implements OnInit, OnChanges {
  private readonly router: Router = inject(Router);
  private readonly messageService: MessageService = inject(MessageService);

  public currentRoute: string = '';
  public isCambiarContrasena!: boolean;

  constructor() {
    this.currentRoute = this.router.url;
  }

  ngOnInit() {
    this.onCambiarContrasenaRoute();
    this.onValueShowHideFooter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentRoute']) {
      this.onCambiarContrasenaRoute();
      this.onValueShowHideFooter();
    }
  }

  public onCambiarContrasenaRoute() {
    if (this.currentRoute === '/auth/cambiar-contrasena') {
      this.isCambiarContrasena = true;
    }
  }

  //valida si debe o no mostrar footer
  public onValueShowHideFooter() {
    //ocultar en el enlace de recuperar clave antes de enviar el mail
    if (this.currentRoute === '/auth/recuperar/pre') {
      this.isCambiarContrasena = true;
    }
  }

  public returnLogin() {
    this.router.navigate(['/auth/login']);
  }

  public onToastMessage(data) {
    this.messageService.add({
      severity: data.type,
      summary: data.type,
      detail: data.message,
    });
  }
}
