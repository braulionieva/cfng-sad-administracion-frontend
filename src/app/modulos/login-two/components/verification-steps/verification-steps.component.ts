import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import {
  ISegGenerateEmailCodeRequest,
  ISegListStates2FA,
  ISegValidateEmailCodeRequest,
  ISegValidateGoogleAuthCodeRequest,
} from '@interfaces/seguridad-cuenta/seguridad-cuenta';
import { Auth2Service } from '@services/auth/auth2.service';

@Component({
  standalone: true,
  selector: 'app-verification-steps',
  templateUrl: './verification-steps.component.html',
  styleUrls: ['./verification-steps.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    CmpLibModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    ToastModule,
  ],
})
export class VerificationStepsComponent implements OnInit {
  isLoading: boolean;
  options: ISegListStates2FA[];
  filteredOptions: ISegListStates2FA[];
  //selectedOption: ISegListStates2FA | null = null;
  selectedOptionId: string | null = null;
  codeInput: number | null = null;
  isCodeEntered: boolean = false;
  errorMessage: string = '';
  usuario: string;

  emailPersonal: string = '';
  emailInstitucional: string = '';
  nombre: string = '';

  public verificationMethods = {
    personal: false,
    institucional: false,
    googleAuth: false,
  };

  constructor(
    private readonly router: Router,
    private readonly auth2Service: Auth2Service
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as {
      options: ISegListStates2FA[];
      usuario: string;
      emailPersonal: string;
      emailInstitucional: string;
      nombre: string;
    };
    this.options = state.options;
    this.usuario = state.usuario;
    this.emailPersonal = state.emailPersonal;
    this.emailInstitucional = state.emailInstitucional;
    this.filteredOptions = [];
    this.nombre = state.nombre;
  }

  ngOnInit(): void {
    // Filtrar opciones con estadoMetodo = '1'
    this.filteredOptions = this.options.filter(
      (option) => option.estadoMetodo === '1'
    );
  }

  onOptionChange(): void {
    // Encontrar la opción seleccionada basada en `selectedOptionId`
    const selectedOption = this.filteredOptions.find(
      (option) => option.codMetodo === this.selectedOptionId
    );

    if (!selectedOption) {
      this.errorMessage =
        'Por favor, seleccione un método de verificación válido.';
      return;
    }
    // limpiando input 6 digitos
    this.codeInput = null;

    this.errorMessage = '';
    this.isCodeEntered = false;

    if (selectedOption?.codMetodo === '003') {
      //Google Authenticator
      this.verificationMethods = {
        personal: false,
        institucional: false,
        googleAuth: true,
      };
    } else if (
      selectedOption?.codMetodo === '001' ||
      selectedOption?.codMetodo === '002'
    ) {
      const email = this.getEmailForOption(selectedOption.codMetodo);

      if (selectedOption?.codMetodo === '001') {
        this.verificationMethods = {
          personal: true,
          institucional: false,
          googleAuth: false,
        };
      } else if (selectedOption?.codMetodo === '002') {
        this.verificationMethods = {
          personal: false,
          institucional: true,
          googleAuth: false,
        };
      }

      const request: ISegGenerateEmailCodeRequest = {
        nombre: this.usuario,
        correoValidar: email,
        codigoUserName: this.usuario,
      };

      this.isLoading = true;
      this.auth2Service.enviarCodigoEmail(request).subscribe({
        next: (response) => {
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Error al enviar el código al correo.';
        },
      });
    }
  }

  getEmailForOption(idMetodo: string): string {
    if (idMetodo === '001') {
      return this.emailPersonal || ''; // Correo personal obtenido desde LoginTwoComponent
    } else if (idMetodo === '002') {
      return this.emailInstitucional || ''; // Correo institucional obtenido desde LoginTwoComponent
    }
    return '';
  }

  public enmascararCorreo(email: string): string {
    if (!email) {
      return ''; // O muestra un mensaje de error si es necesario
    }
    const [local, domain] = email.split('@');
    if (!local || !domain) {
      return email; // Devuelve el correo original si no se puede enmascarar
    }
    if (local.length <= 2) {
      return email; // Devuelve el correo original si el nombre local es demasiado corto para enmascarar
    }
    return `${local.slice(0, 2)}....${local.slice(-2)}@${domain}`;
  }

  onCodeInputChange(): void {
    const codeStr = this.codeInput !== null ? this.codeInput.toString() : '';
    this.isCodeEntered = codeStr.length === 6;

    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  protected redireccionarHome() {
    this.errorMessage = ''; // Limpiar mensaje de error previo

    const selectedOption = this.filteredOptions.find(
      (option) => option.codMetodo === this.selectedOptionId
    );

    if (!selectedOption) {
      this.errorMessage = 'Por favor, seleccione un método de verificación.';
      return;
    }

    const codeStr = this.codeInput !== null ? this.codeInput.toString() : '';
    if (codeStr.length !== 6) {
      this.errorMessage = 'Ingrese el código de 6 dígitos.';
      return;
    }

    this.isLoading = true;

    if (selectedOption.codMetodo === '003') {
      // Validar código de Google Authenticator
      const request: ISegValidateGoogleAuthCodeRequest = {
        codigoUserName: this.usuario,
        idMetodo2FA: selectedOption.codMetodo,
        estadoMetodo2FA: null,
        codigoValidacionQr: codeStr,
        dispositivo: null,
        sistemaOperativo: null,
        navegador: null,
      };

      this.auth2Service.validarCodigoGoogle(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.data === true) {
            // Validación exitosa
            this.router.navigate(['app']);
            ////////////////////////////////////////////////////////
            // CAMBIAR ACA A LA NUEVA URL DE LISTA DE APLICACIONES//
            ////////////////////////////////////////////////////////
            // window.location.href =
            //   'http://cfng-home-development.apps.dev.ocp4.cfe.mpfn.gob.pe/home';
            // window.location.href = 'http://localhost:55645/home';
          } else {
            // Validación fallida
            this.errorMessage = 'Validar token ingresado';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Error al validar el código.';
        },
      });
    } else if (
      selectedOption.codMetodo === '001' ||
      selectedOption.codMetodo === '002'
    ) {
      //Valdiar codigo evniado al correo
      const email = this.getEmailForOption(selectedOption.codMetodo);
      const request: ISegValidateEmailCodeRequest = {
        codigoUserName: this.usuario,
        codigoValidacion: Number(codeStr),
        correoValidar: email,
        dispositivo: null,
        sistemaOperativo: null,
        navegador: 'Brave',
        idMetodo2FA: selectedOption.codMetodo,
        estadoMetodo2FA: null,
      };

      this.auth2Service.validarCodigoEmails(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.data === true) {
            // Validación exitosa
            this.router.navigate(['app']);
            ////////////////////////////////////////////////////////
            // CAMBIAR ACA A LA NUEVA URL DE LISTA DE APLICACIONES//
            ////////////////////////////////////////////////////////
            // window.location.href =
            //   'http://cfng-home-development.apps.dev.ocp4.cfe.mpfn.gob.pe/home';
            // window.location.href = 'http://localhost:55645/home';
          } else {
            // Validación fallida
            this.errorMessage = 'Validar token ingresado';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Error al validar el código.';
        },
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'Método de verificación no soportado.';
    }
  }

  onCancel(): void {
    this.router.navigate(['auth/login']);
  }
}
