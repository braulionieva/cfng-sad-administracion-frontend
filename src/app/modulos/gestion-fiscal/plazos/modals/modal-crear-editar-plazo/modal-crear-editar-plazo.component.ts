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
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { Subscription } from 'rxjs';
import { PlazosDetencionService } from '@modulos/gestion-fiscal/plazos/plazos-detencion.service';
import { PlazoDetencionFlagranciaService } from '@services/plazo-detencion-flagrancia/plazo-detencion-flagrancia.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  standalone: true,
  selector: 'app-modal-crear-editar-plazo',
  templateUrl: './modal-crear-editar-plazo.component.html',
  styleUrls: [
    './modal-crear-editar-plazo.component.scss',
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
    InputTextarea,
  ],
  providers: [DialogService],
})
export class ModalCrearEditarPlazoComponent implements OnInit, OnDestroy {
  private readonly actionSubscription: Subscription;
  public formGroup: FormGroup;
  private isEditing: boolean;
  private plazo;
  // dropdowns
  public categoriesDropdown: any[] = [];
  public specialtiesDropdown: any[] = [];

  public refModal: DynamicDialogRef;

  public codigoPlazo: string;

  formObject = {
    categoria: new FormControl('', Validators.required),
    especialidad: new FormControl('', Validators.required),
    plazo_horas: new FormControl('', Validators.required),
    plazo_dias: new FormControl('', Validators.required),
    descripcion: new FormControl(''),
  };

  @Output() isConfirmAction: EventEmitter<any> = new EventEmitter();

  private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly config: DynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly plazosDetencionService: PlazosDetencionService = inject(
    PlazosDetencionService
  );

  constructor(
    private readonly plazoDetencionFlagranciaService: PlazoDetencionFlagranciaService,
    public readonly dialogService: DialogService
  ) {
    this.formGroup = new FormGroup(this.formObject);
  }

  ngOnInit(): void {
    this.setData();

    this.plazoHorasField.valueChanges.subscribe((plazoHoras) => {
      this.plazoDiasField.setValue(this.calcularDias(plazoHoras));
    });
  }

  confirmaGuardar(action: 'save' | 'create') {
    let title = '';
    let description = '';

    if (action === 'create') {
      title = 'Registrar plazo de detención por flagrancia';
      description = `A continuación, se procederá a registrar el plazo de detención por flagrancia de la especialidad <strong>${this.especialidadField.value}</strong>. ¿Está seguro de realizar esta acción?`;
    } else if (action === 'save') {
      title = 'Editar plazo de detención por flagrancia';
      description = `A continuación, se procederá a modificar el plazo de detención por flagrancia de la especialidad <strong>${this.especialidadField.value}</strong>. ¿Está seguro de realizar esta acción?`;
    }

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '828px',
      showHeader: false,
      data: {
        icon: 'question',
        title: title,
        confirm: true,
        confirmButtonText: 'Aceptar',
        description: description,
      }
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          if (action === 'create') {
            this.createPlazo();
          } else if (action === 'save') {
            this.savePlazo();
          }
        }
      },
      error: (err) => console.error('Error al cerrar modal:', err),
    });
  }

  cierraAddAppModal() {
    this.closeModal();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  setData() {
    if (!this.config.data) return;

    this.categoriesDropdown = this.config.data.dropdownsData?.categorias;

    if (this.config.data.plazoDetail) {
      this.isEditing = true;
      this.plazo = this.config.data.plazoDetail;
      if (this.plazo?.idPlazoTurno) {
        this.codigoPlazo = this.plazo.idPlazoTurno;
      }
      this.formGroup.patchValue({
        categoria: this.plazo.idCategoria,
        plazo_horas: this.plazo.plazoDeDetencionHoras,
        descripcion: this.plazo.comentario,
      });
      this.plazoDiasField.setValue(
        this.calcularDias(this.plazo.plazoDeDetencionHoras)
      );
      this.getSpecialtiesData({ value: this.plazo.idCategoria }, true);
    } else {
      this.isEditing = false;
    }
  }

  closeModal() {
    this.ref.close();
  }

  getSpecialtiesData(categoria: any, isSettingData?: boolean) {
    this.plazoDetencionFlagranciaService
      .obtenerListaEspecialidad(categoria?.value)
      .subscribe({
        next: (resp: any[]) => {
          resp.sort((a, b) =>
            a.nombreEspecialidad.localeCompare(b.nombreEspecialidad, 'es', { sensitivity: 'base' })
          );
          this.specialtiesDropdown = resp;

          if (isSettingData && this.plazo) {
            this.especialidadField.patchValue(this.plazo.idEspecialidad);
          }
        },
        error: (err) => {
          console.error('Error en la solicitud [obtenerListaEspecialidad]: ', err);
        },
      });
  }

  calcularDias(cantidadHoras) {
    const dias = cantidadHoras / 24;
    return dias.toFixed(1);
  }

  onCategoryChange(categoryId: any) {
    this.getSpecialtiesData(categoryId);
  }

  sendPlazoCreateSave() {
    if (this.formGroup.valid) {
      if (this.isEditing) {
        this.confirmaGuardar('save');
      } else {
        this.confirmaGuardar('create');
      }

    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  createPlazo() {
    this.plazosDetencionService.notifySuccessModal('create');
    this.plazosDetencionService.notifyCompleteActionPlazo(this.formGroup.value);
    this.closeModal();
  }

  savePlazo() {
    this.plazosDetencionService.notificarActalizacionPlazos(
      this.formGroup.value,
      this.codigoPlazo
    );
    this.closeModal();
  }

  get categoriaField(): AbstractControl {
    return this.formGroup.get('categoria');
  }
  get especialidadField(): AbstractControl {
    return this.formGroup.get('especialidad');
  }
  get plazoHorasField(): AbstractControl {
    return this.formGroup.get('plazo_horas');
  }
  get plazoDiasField(): AbstractControl {
    return this.formGroup.get('plazo_dias');
  }
  get descripcionField(): AbstractControl {
    return this.formGroup.get('descripcion');
  }

  ngOnDestroy(): void {
    if (this.actionSubscription) this.actionSubscription.unsubscribe();
  }
}
