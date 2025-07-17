import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
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
import { Perfil } from '@interfaces/admin-perfiles/admin-perfiles';
import { ToastModule } from 'primeng/toast';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';

@Component({
  selector: 'app-edit-perfil',
  standalone: true,
  templateUrl: './edit-perfil.component.html',
  styleUrls: ['./edit-perfil.component.scss'],
  imports: [InputTextModule, ButtonModule, ToastModule, ReactiveFormsModule],
  providers: [DialogService, MessageService],
})
export class EditPerfilComponent implements OnChanges {
  editarPerfilForm: FormGroup;

  @Output() clicked = new EventEmitter();
  @Input() selectedPerfil: Perfil;

  error: any;
  perfil: Perfil;
  public refModal: DynamicDialogRef;
  public refModalMensaje: DynamicDialogRef;

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
    private readonly adminPerfilesService: AdminPerfilesService
  ) {
    this.editarPerfilForm = this.fb.group({
      descripcionPerfil: [
        '',
        [Validators.required, Validators.maxLength(60), this.noSoloEspacios()],
      ],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedPerfil'] && changes['selectedPerfil'].currentValue) {
      this.actualizarValorDescripcion(changes['selectedPerfil'].currentValue);
    }
  }

  onClicked() {
    this.clicked.emit();
  }

  onSubmit() {
    if (this.editarPerfilForm.valid) {
      this.perfil = this.selectedPerfil;

      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '700px',
        showHeader: false,
        data: {
          icon: 'question',
          title: 'Editar datos del perfil',
          confirm: true,
          confirmButtonText: 'Aceptar',
          description: `A continuación, se procederá a modificar los datos del perfil <strong>${this.perfil.descripcionPerfil.toUpperCase()}</strong>. ¿Está seguro de realizar esta acción?`,
        },
      });

      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.editarPerfil();
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

  editarPerfil() {
    const perfilAntiguo = this.perfil.descripcionPerfil;
    this.perfil.descripcionPerfil =
      this.editarPerfilForm.value.descripcionPerfil;

    this.adminPerfilesService.editarPerfil(this.perfil).subscribe({
      next: (response) => {
        if (response.existe === '1') {
          this.perfil.descripcionPerfil = perfilAntiguo;
          this.openModalPerfilExiste(response.responseMessageDTO.message);
        } else {
          this.onClicked();

          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '750px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Perfil editado',
              confirmButtonText: 'Listo',
              description:
                'La actualización de los datos del perfil <strong>' +
                this.perfil.descripcionPerfil.toUpperCase() +
                '</strong> se realizó de forma exitosa.',
            },
          });
        }

        this.clicked.emit(); // Emitir evento para actualizar la tabla
      },
      error: (err) => {
        this.error = err;
        this.messageService.add({
          severity: 'error',
          summary: 'error',
          detail: 'Error actualizando perfil',
        });
      },
    });
  }

  obtenerPerfil(idPerfil: BigInt) {
    this.adminPerfilesService.obtenerPerfil(idPerfil).subscribe({
      next: (response) => {

      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  actualizarValorDescripcion(selectedPerfil: Perfil) {
    if (selectedPerfil) {
      this.selectedPerfil = selectedPerfil;

      this.editarPerfilForm.patchValue({
        descripcionPerfil: selectedPerfil.descripcionPerfil,
      });
    }
  }

  openModalPerfilExiste(mensaje: string) {
    this.refModalMensaje = this.dialogService.open(ModalMensajeComponent, {
      width: '800px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning-red',
        title: 'PERFIL YA EXISTE',
        subTitle: mensaje,
        textButtonSecondary: 'Cerrar',
        showOnlySecondaryButton: false,
      },
    });
  }
}
