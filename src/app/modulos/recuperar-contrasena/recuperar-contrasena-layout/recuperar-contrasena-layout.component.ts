import { Component, inject } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";

@Component({
  selector: 'app-recuperar-contrasena-layout',
  templateUrl: './recuperar-contrasena-layout.component.html',
  standalone: true,
  styleUrls: ['./recuperar-contrasena-layout.component.scss'],
  imports: [RouterModule, ToastModule],
  providers: [MessageService, DialogService],
})
export class RecuperarContrasenaLayoutComponent {
  private readonly router: Router = inject(Router);

  public currentRoute: string = '';

  constructor(
    private readonly messageService: MessageService,
    public readonly dialogService: DialogService,
  ) {
    this.currentRoute = this.router.url;
  }

  returnLogin() {
    this.router.navigate(['/auth/login']);
  }

  onToastMessage(data) {
    this.messageService.add({
      severity: data.type,
      summary: data.type,
      detail: data.message,
    });
  }
}
