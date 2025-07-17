import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  DynamicDialogConfig,
  DynamicDialogRef,
  DialogService,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subscription } from 'rxjs';
import { CentralesNotificacionesService } from '@modulos/notificaciones/centrales-notificacion/centrales-notificacion.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { isEqual } from 'lodash';

@Component({
  standalone: true,
  selector: 'app-modal-crear-editar-central',
  templateUrl: './modal-crear-editar-central.component.html',
  styleUrls: [
    './modal-crear-editar-central.component.scss',
    '../../../../maestros/categorias/modals/modal-mensaje/modal-mensaje.component.scss',
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
  ],
})
export class ModalCrearEditarCentralComponent implements OnInit, OnDestroy {
  public refModal: DynamicDialogRef;
  private actionSubscription: Subscription;
  formGroup: FormGroup;
  isEditing: boolean;
  central;
  // dropdowns
  taxDistrictsDropdown = [];

  initialFormValues: any;

  public codigoCentral: string;

  formObject = {
    codigo: new FormControl(null, [
      Validators.required,
      Validators.maxLength(20),
      //this.noSoloEspacios(),
    ]),
    nombre: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      //this.noSoloEspacios(),
    ]),
    distrito_fiscal: new FormControl('', Validators.required),
  };

  @Output() isConfirmAction = new EventEmitter();

  private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly config: DynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly centralesNotificacionesService: CentralesNotificacionesService =
    inject(CentralesNotificacionesService);

  constructor(
    public dialogService: DialogService
  ) {
    this.formGroup = new FormGroup(this.formObject);
  }

  ngOnInit(): void {
    this.setData();

    this.actionSubscription =
      this.centralesNotificacionesService.action$.subscribe((action) => {
        if (action === 'create') {
          this.createCentral();
        } else if (action === 'save') {
          this.saveCentral();
        }
      });

    // // Evita que el foco vaya directamente a un input al abrir el modal
    // setTimeout(() => {
    //   const cancelButton = document.querySelector('button[label="Cancelar"]');
    //   if (cancelButton) {
    //     (cancelButton as HTMLElement).focus();
    //   }
    // }, 0);
  }

  // Validador personalizado para evitar solo espacios en blanco
  noSoloEspacios(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si no hay valor, no se valida
      }

      const trimmedValue = (control.value || '').trim();
      const isWhitespace = trimmedValue.length === 0;
      const isValid = !isWhitespace && control.value === trimmedValue;

      return isValid ? null : { noSoloEspacios: true };
    };
  }

  //Limpia espacios
  private limpiarEspacios(texto: string): string {
    return texto.trim().replace(/\s+/g, ' ');
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  cierraAddAppModal() {
    this.closeModal();
  }

  setData() {
    if (!this.config.data) return;
  
    // 1. Obtenemos la lista de distritos que llega al modal
    let distritos = this.config.data.dropdownsData?.distritos || [];
  
    // 2. Ordenamos alfabéticamente (case-insensitive) por el campo "nombre"
    distritos = distritos.sort((a, b) =>
      (a.nombre || '').toLowerCase()
        .localeCompare((b.nombre || '').toLowerCase())
    );
  
    // 3. Asignamos la lista ya ordenada a la variable que usa el combo
    this.taxDistrictsDropdown = distritos;
  
    // 4. Si existe centralDetail => modo edición
    if (this.config.data.centralDetail) {
      this.isEditing = true;
      this.central = this.config.data.centralDetail;
      if (this.central?.idCentral) {
        this.codigoCentral = this.central.idCentral;
      }
      // Rellenar el formulario con los datos de la central
      this.formGroup.patchValue({
        codigo: this.limpiarEspacios(this.central?.codigoCentral),
        nombre: this.limpiarEspacios(this.central?.nombreCentral),
        distrito_fiscal: this.central?.idDistritoFiscal,
      });
  
      this.initialFormValues = this.formGroup.getRawValue();
    }
  }

  closeModal() {
    this.ref.close();
  }

  onCancel(event: Event) {
    // Detener la propagación del evento para evitar que el formulario sea marcado como "touched"
    event.stopPropagation();
    event.preventDefault();

    // Cierra el modal
    this.closeModal();
  }

  sendCentralCreateSave() {
    /**
    // if (this.formGroup.valid) {
    //   this.isEditing
    //     ? this.centralesNotificacionesService.notifyShowConfirmModal(
    //         'save',
    //         this.formGroup.value
    //       )
    //     : this.centralesNotificacionesService.notifyShowConfirmModal(
    //         'create',
    //         this.formGroup.value
    //       );
    // } else {
    //   this.formGroup.markAllAsTouched();
    // }**/

    if (this.formGroup.valid) {
      this.openConfirmationModal();
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  createCentral() {
    /**
    // this.centralesNotificacionesService.notifySuccessModal('create');
    // this.centralesNotificacionesService.notifyCompleteActionCentral();**/
    this.centralesNotificacionesService.notifyCompleteActionCentral(
      this.formGroup.value
    );
  }

  saveCentral() {
    const currentFormValues = this.formGroup.getRawValue();

    if (isEqual(this.initialFormValues, currentFormValues)) {
      // Los valores son iguales; no se han realizado cambios efectivos
      this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'info',
          title: 'Sin cambios',
          description: 'No se ha realizado ningún cambio en los datos.',
          confirmButtonText: 'Aceptar',
        },
      });
      return; // Salir sin enviar la solicitud de edición
    }

    this.centralesNotificacionesService.notificarActualizacionCentral(
      this.formGroup.value,
      this.codigoCentral
    );
  }

  openConfirmationModal() {
    const ref = this.dialogService.open(AlertModalComponent, {
      width: '828px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'question',
        title: this.isEditing
          ? 'Editar datos de la central de notificaciones'
          : 'Registrar nueva central de notificaciones',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        description: this.isEditing
          ? `A continuación, se procederá a modificar los datos de la central de notificaciones <strong>${this.formGroup.value.nombre}</strong>. ¿Está seguro de realizar esta acción?`
          : `A continuación, se procederá a registrar los datos de la nueva central de notificaciones <strong>${this.formGroup.value.nombre}</strong>. ¿Está seguro de realizar esta acción?`,
        confirm: true,
      },
    });

    ref.onClose.subscribe((result) => {
      if (result === 'confirm') {
        // Usuario confirmó, proceder a crear o editar la central
        this.isEditing ? this.saveCentral() : this.createCentral();
      }
    });
  }

  get codigoField(): AbstractControl {
    return this.formGroup.get('codigo');
  }

  get nombreField(): AbstractControl {
    return this.formGroup.get('nombre');
  }

  get distritoFiscalField(): AbstractControl {
    return this.formGroup.get('distrito_fiscal');
  }

  ngOnDestroy(): void {
    if (this.actionSubscription) this.actionSubscription.unsubscribe();
  }
}
