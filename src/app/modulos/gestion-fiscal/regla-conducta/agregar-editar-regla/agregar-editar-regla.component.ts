import { JsonPipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { AdminReglaService } from '@services/admin-regla-conducta/admin-regla.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-agregar-editar-regla',
  standalone: true,
  templateUrl: './agregar-editar-regla.component.html',
  styleUrls: ['./agregar-editar-regla.component.scss'],
  imports: [
    DialogModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    JsonPipe,
    NgIf,
  ],
})
export class AgregarEditarReglaComponent {
  @Output() close = new EventEmitter<boolean>();
  @Output() clicked = new EventEmitter();
  @Input() data: any;
  reglaForm: FormGroup;
  public refModal: DynamicDialogRef;
  error: any;

  constructor(
    private reglaService: AdminReglaService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private dialogService: DialogService
  ) {
    this.reglaForm = this.fb.group({
      //nomRegla: [null, [Validators.required, Validators.maxLength(500)]]
      nomRegla: new FormControl(null, [
        Validators.required,
        Validators.maxLength(500),
      ]),
    });
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  cierraAddAppModal() {
    this.close.emit();
  }

  //actualizar bandeja de reglas
  onClicked() {
    this.clicked.emit();
  }

  informarRegistroDeRegla(icon: string) {
    const title = this.data.isEdit
      ? 'Regla de conducta modificada'
      : 'Regla de conducta registrada';
    const description = (
      this.data.isEdit
        ? 'Se modificó la regla de conducta: <b>'
        : 'Se guardó exitosamente la regla de conducta: <b>'
    )
      .concat(this.reglaForm.value.nomRegla)
      .concat('<b>');

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
        confirmButtonText: 'Listo',
      },
    });
  }

  validaAgregarReglaForm(): boolean {
    if (this.reglaForm.get('nomRegla').value) {
      return true;
    } else {
      return false;
    }
  }

  GuardarReglaConducta() {
    if (this.reglaForm.valid) {
      if (this.data.isEdit) {
        const regla = {
          idRegla: this.data.regla.idRegla,
          nomRegla: this.reglaForm.value.nomRegla,
          coUser: null,
        };
        this.editarRegla(regla);
      } else {
        const regla = {
          nomRegla: this.reglaForm.value.nomRegla,
          coUser: null,
        };
        this.crearRegla(regla);
      }
    }
  }

  crearRegla(regla: any) {
    this.reglaService.crearReglaConducta(regla).subscribe({
      next: (response) => {
        this.cierraAddAppModal();
        this.informarRegistroDeRegla('success');
        this.reglaForm.reset();
        this.onClicked(); //actualizar bandeja de reglas
      },
      error: (err) => {
        if (err.error.code === '42206007') {
          this.informarRegistroDuplicadoDeRegla('warning', err.error.message);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'error',
            detail: 'Error agregando regla conducta',
          });
        }
        this.error = err;
      },
    });
  }

  editarRegla(regla: any) {
    this.reglaService.editarReglaConducta(regla).subscribe({
      next: (response) => {
        this.cierraAddAppModal();
        this.informarRegistroDeRegla('success');
        this.reglaForm.reset();
        this.onClicked(); //actualizar bandeja de reglas
      },
      error: (err) => {
        if (err.error.code === '42206007') {
          this.informarRegistroDuplicadoDeRegla('warning', err.error.message);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'error',
            detail: 'Error editando regla conducta',
          });
        }
        this.error = err;
      },
    });
  }

  informarRegistroDuplicadoDeRegla(icon: string, description: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Regla de Conducta',
        description: description,
        confirmButtonText: 'Aceptar',
      },
    });
  }
}
