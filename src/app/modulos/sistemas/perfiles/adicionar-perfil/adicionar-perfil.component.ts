import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AdminPerfilesService } from '@services/admin-perfiles/admin-perfiles.service';
import { Aplicacion, Perfil } from '@interfaces/admin-perfiles/admin-perfiles';
import { ToastModule } from 'primeng/toast';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';

@Component({
  selector: 'app-adicionar-perfil',
  standalone: true,
  templateUrl: './adicionar-perfil.component.html',
  styleUrls: ['./adicionar-perfil.component.scss'],
  imports: [InputTextModule, ButtonModule, ToastModule, ReactiveFormsModule],
  providers: [DialogService, MessageService],
})
export class AdicionarPerfilComponent {
  agregarPerfilForm: FormGroup;

  @Output() clicked = new EventEmitter();
  @Input() aplicacion: Aplicacion;
  perfil: Perfil;
  error: any;
  public refModal: DynamicDialogRef;
  public refModalMensaje: DynamicDialogRef;
  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
    private readonly adminPerfilesService: AdminPerfilesService
  ) {
    this.agregarPerfilForm = this.fb.group({
      nombrePerfil: [
        '',
        [Validators.required, Validators.maxLength(60), this.noSoloEspacios()],
      ],
    });
  }

  onClicked() {
    this.clicked.emit();
  }

  onSubmit() {
    if (this.agregarPerfilForm.valid) {
      this.perfil = {
        ...this.agregarPerfilForm.value,
        idAplicacion: this.aplicacion.idAplicacion,
      };
      this.confirmaGuardar(this.perfil);

      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.crearPerfil(this.perfil);
          }
        },
      });
    }
  }

  // Validador personalizado para evitar solo espacios en blanco
  noSoloEspacios(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { noSoloEspacios: true };
    };
  }

  confirmaGuardar(perfil: Perfil) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Registrar nuevo perfil',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description: `A continuación, se procederá a registrar los datos del nuevo pefil <strong>${perfil.nombrePerfil.toUpperCase()}</strong> para el sistema <strong>${
          this.aplicacion.nombreAplicacion
        }.</strong> ¿Está seguro de realizar esta acción?`,
      },
    });
  }

  crearPerfil(perfil: Perfil) {
    this.adminPerfilesService.crearPerfil(perfil).subscribe({
      next: (response) => {
        if (response.existe === '1') {
          this.refModalMensaje = this.dialogService.open(
            ModalMensajeComponent,
            {
              width: '800px',
              contentStyle: { overflow: 'auto' },
              closable: false,
              showHeader: false,
              data: {
                icon: 'warning-red',
                title: 'PERFIL YA EXISTE',
                subTitle: response.responseMessageDTO.message,
                textButtonSecondary: 'Cerrar',
                showOnlySecondaryButton: false,
              },
            }
          );
        } else {
          this.agregarPerfilForm.reset();
          this.onClicked();

          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '750px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Perfil registrado',
              confirmButtonText: 'Listo',
              description:
                'El registro de los datos del nuevo perfil <strong>' +
                perfil.nombrePerfil.toUpperCase() +
                '</strong> se realizó de forma exitosa.',
            },
          });
        }

        this.agregarPerfilForm.reset();
        this.clicked.emit(); // Emitir evento para actualizar la tabla
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'error',
          detail: 'Error agregando perfil',
        });
        this.error = err;
      },
    });
  }
}
