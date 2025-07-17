import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { CargosAccionesService } from '../../cargos-acciones.service';

@Component({
  standalone: true,
  selector: 'app-modal-crear-editar-cargo',
  templateUrl: './modal-crear-editar-cargo.component.html',
  styleUrls: [
    './modal-crear-editar-cargo.component.scss',
    '../../../categorias/modals/modal-mensaje/modal-mensaje.component.scss',
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    InputNumberModule,
    InputTextarea,
  ],
  providers: [DialogService],
})
export class ModalCrearEditarCargoComponent implements OnInit, OnDestroy {
  protected refModal: DynamicDialogRef;

  private actionSubscription: Subscription;
  protected formGroup: FormGroup;
  protected isEditing: boolean;
  protected cargo: any;

  protected jerarquiaLista = [];
  protected categoriaLista = [];

  private codigo: string;

  private readonly formObject = {
    nombre: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      this.validarTextoEspecial(),
    ]),
    descripcion: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      this.validarTextoEspecial(),
    ]),
    codigo: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      this.validarAlfanumerico(),
    ]),
    jerarquia: new FormControl(''),
    categoria: new FormControl(''),
  };

  closeModalEmitter: EventEmitter<boolean>;

  @Output() isConfirmAction = new EventEmitter();

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly cargosAccionesService: CargosAccionesService,
    private readonly dialogService: DialogService
  ) {
    this.formGroup = new FormGroup(this.formObject);

    if (this.config.data.closeModalEmitter) {
      this.closeModalEmitter = this.config.data.closeModalEmitter;
    }
  }

  get nombreField(): AbstractControl {
    return this.formGroup.get('nombre');
  }

  get descripcionField(): AbstractControl {
    return this.formGroup.get('descripcion');
  }

  get codigoField(): AbstractControl {
    return this.formGroup.get('codigo');
  }

  get jerarquiaField(): AbstractControl {
    return this.formGroup.get('jerarquia');
  }

  get categoriaField(): AbstractControl {
    return this.formGroup.get('categoria');
  }

  ngOnInit(): void {
    this.setData();

    this.actionSubscription = this.cargosAccionesService.action$.subscribe(
      (action: 'save' | 'create') => {
        this.confirmaGuardar(action);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.actionSubscription) this.actionSubscription.unsubscribe();
  }

  private confirmaGuardar(action: 'save' | 'create') {
    let titulo = '';
    let descripcion = '';

    if (action === 'create') {
      titulo = 'Registrar nueva cargo';
      descripcion = `A continuación, se procederá a registrar los datos del nuevo cargo <strong>${this.nombreField.value}</strong>. ¿Está seguro de realizar esta acción?`;
    } else if (action === 'save') {
      titulo = 'Editar datos del cargo';
      descripcion = `A continuación, se procederá a modificar los datos del cargo <strong>${this.nombreField.value}</strong>. ¿Está seguro de realizar esta acción?`;
    }

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '828px',
      showHeader: false,
      data: {
        icon: 'question',
        title: titulo,
        confirm: true,
        confirmButtonText: 'Aceptar',
        description: descripcion,
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          if (action === 'create') {
            this.createCharger();
          } else if (action === 'save') {
            this.saveCharger();
          }
        }
      },
    });
  }

  private setData() {
    if (!this.config.data) return;

    this.jerarquiaLista = this.config.data.dropdownsData?.jerarquias;
    this.categoriaLista = this.config.data.dropdownsData?.categorias;

    if (!this.config.data.cargoDetail) return;

    this.isEditing = true;
    this.cargo = this.config.data.cargoDetail;

    this.formGroup.patchValue({
      ...this.cargo,
      jerarquia: this.cargo.codigoJerarquia,
      categoria: this.cargo.codigoCategoria,
    });

    if (this.cargo.codigo != null) {
      this.codigo = this.cargo.idCargo;
    }
  }

  protected closeModal() {
    if (this.config.data.closeModal)
      this.config.data.closeModal(); // Usar la función pasada por el componente de cargos
    else this.ref.close(); // Cierre de respaldo, por si acaso no se proporciona la función
  }

  protected sendChargerCreateSave() {
    if (this.formGroup.valid) {
      this.isEditing
        ? this.cargosAccionesService.notifyShowConfirmModal(
            'save',
            this.nombreField.value
          )
        : this.cargosAccionesService.notifyShowConfirmModal(
            'create',
            this.nombreField.value
          );
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  private createCharger() {
    this.formGroup.patchValue({
      ...this.formGroup,
      // jerarquia: this.sendChargerCreateSave.value.value,
      // categoria: this.categoriaField.value.value
    });

    this.cargosAccionesService.notifySuccessModal('create');
    this.cargosAccionesService.notifyCompleteActionCharger(
      this.formGroup.value
    );
  }

  private saveCharger() {
    this.formGroup.patchValue({
      ...this.formGroup,
      // jerarquia: this.jerarquiaField.value.value,
      // categoria: this.categoriaField.value.value
    });

    this.cargosAccionesService.notifySuccessModal('save');
    this.cargosAccionesService.notificarActualizacionCharger(
      this.formGroup.value,
      this.codigo
    );
  }

  protected icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  // Validador personalizado para solo aceptar texto alfabético
  private validarTextoEspecial(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value?.trim(); // Elimina los espacios en blanco al inicio y al final
      const textoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s./()-]*$/;

      if (!valor) {
        return {
          soloTexto: 'Este campo no puede estar vacío o contener solo espacios',
        };
      }

      return textoRegex.test(valor)
        ? null
        : {
            soloTexto:
              'Este campo solo acepta letras, espacios y los caracteres . / ( ) -',
          };
    };
  }

  private validarAlfanumerico(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value?.trim(); // Elimina espacios en blanco al inicio y final
      const alfanumericoRegex = /^[a-zA-Z0-9]+$/; // Solo permite letras y números

      if (!valor) {
        return {
          soloAlfanumerico:
            'Este campo no puede estar vacío o contener solo espacios',
        };
      }

      return alfanumericoRegex.test(valor)
        ? null
        : { soloAlfanumerico: 'Este campo solo acepta letras y números' };
    };
  }
}
