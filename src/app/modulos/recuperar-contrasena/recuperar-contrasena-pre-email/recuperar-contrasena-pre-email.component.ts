import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { RecuperarContrasenaPremailReq } from "@interfaces/recuperar-contrasena/RecuperarContrasena";
import { RecuperarContrasenaService } from "@services/recuperar-contrasena/recuperar-contrasena.service";
import { NgxSpinnerService } from "ngx-spinner";
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-recuperar-contrasena-pre-email',
  standalone: true,
  templateUrl: './recuperar-contrasena-pre-email.component.html',
  styleUrls: ['./recuperar-contrasena-pre-email.component.scss'],
  imports: [
    CommonModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
  ],
})
export class RecuperarContrasenaPreEmailComponent {
  public formGroup: FormGroup;
  public isLoading: boolean;
  public mensajeErrorPersonalizado: string;

  constructor(
    private readonly recuperarContrasenaService: RecuperarContrasenaService,
    private readonly spinner: NgxSpinnerService,
    private readonly fb: FormBuilder,
    public readonly dialogService: DialogService,
  ) {
    this.formGroup = this.fb.group({
      emailUsuario: new FormControl('', [
        Validators.required,
        Validators.email
      ])
    });
  }

  public submit(): void {
    const baseUrlBrowser = this.getBaseUrlBrowser();

    const request: RecuperarContrasenaPremailReq = {
      ...this.formGroup.value,
      baseUrlBrowser: baseUrlBrowser,
      urlRecuperarContrasenaPostemail: baseUrlBrowser + '/recovery/post'
    }

    this.spinner.show();
    this.recuperarContrasenaService.recuperarContrasenapremail(request).subscribe({
      next: (response) => {
        if (response.code == "0") {
          this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Recuperación realizada correctamente',
              description: `La información de la recuperación de contraseña, fue enviada al correo
              electrónico <b>${request.emailUsuario}</b>. Por favor, proceda a ingresar a su
              correo y siga las indicaciones correspondientes.`,
              confirmButtonText: 'Listo'
            },
          });
        } else if (response.code == "1") {
          this.mensajeErrorPersonalizado = response.message

        } else {
          this.mensajeErrorPersonalizado = "Ocurrió un error. Vuelva a intentar"
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error en el proceso', err);
        this.mensajeErrorPersonalizado = "Ocurrió un error. Vuelva a intentar"
        this.spinner.hide();
      }
    });
  }

  private getBaseUrlBrowser(): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
  }

}
