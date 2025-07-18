import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  Plazo,
} from '@modulos/configuracion-plazos/configuracion-plazos.interface';
import { ConfiguracionPlazosService } from '@modulos/configuracion-plazos/configuracion-plazos.service';
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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-modal-crear-editar-plazo',
  templateUrl: './modal-crear-editar-plazo.component.html',
  styleUrls: [
    './modal-crear-editar-plazo.component.scss',
    '../../../maestros/categorias/modals/modal-mensaje/modal-mensaje.component.scss',
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
    InputTextareaModule,
    RadioButtonModule,
  ],
  providers: [DialogService],
})
export class ModalCrearEditarPlazoComponent implements OnInit, OnDestroy {
  private actionSubscription: Subscription;
  public formGroup: FormGroup;
  private isEditing: boolean;
  private plazo: Plazo;
  // dropdowns
  public taxDistrictsDropdown: any[] = [];
  public typeSpecialtiesDropdown: any[] = [];
  public specialtiesDropdown: any[] = [];
  public typeDeadlineDaysDropdown: any[] = [];
  public codigoPlazo!: string;

  formObject = {
    configurado: new FormControl<number | null>(927, Validators.required),
    distrito_fiscal: new FormControl<string | null>(null),
    tipo_especialidad: new FormControl<string | null>(null),
    especialidad: new FormControl<string | null>(null),
    plazo_evaluar_cantidad: new FormControl<number | null>(
      null,
      Validators.required
    ),
    plazo_evaluar_tipo: new FormControl<number | null>(
      null,
      Validators.required
    ),
    plazo_mostrar_cantidad: new FormControl<number | null>(
      null,
      Validators.required
    ),
    plazo_mostrar_tipo: new FormControl<number | null>(
      null,
      Validators.required
    ),
  };

  @Output() isConfirmAction: EventEmitter<any> = new EventEmitter();

  private readonly ref: DynamicDialogRef = inject(DynamicDialogRef);
  private readonly config: DynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly configuracionPlazosService: ConfiguracionPlazosService =
    inject(ConfiguracionPlazosService);

  constructor() {
    this.formGroup = new FormGroup(this.formObject);

    // this.configuradoField!.valueChanges.subscribe((value) => {
    //   if (value === 'Distrito Fiscal') {
    //     this.distritoFiscalField!.setValidators([Validators.required]);
    //   } else if (value === 'Tipo Especialidad') {
    //     this.distritoFiscalField!.setValidators([Validators.required]);
    //     this.tipoEspecialidadField.setValidators([Validators.required]);
    //   } else if (value === 'Especialidad') {
    //     this.distritoFiscalField!.setValidators([Validators.required]);
    //     this.tipoEspecialidadField!.setValidators([Validators.required]);
    //     this.especialidadField!.setValidators([Validators.required]);
    //   }
    //   this.formGroup.updateValueAndValidity();
    // });
  }

  ngOnInit(): void {
    this.setData();

    this.actionSubscription = this.configuracionPlazosService.action$.subscribe(
      (action) => {
        if (action === 'create') {
          this.createPlazo();
        } else if (action === 'save') {
          this.savePlazo();
        }
      }
    );
  }

  setData() {
    if (!this.config.data) return;
    this.taxDistrictsDropdown =
      this.config.data.dropdownsData?.distritosFiscales;
    this.typeSpecialtiesDropdown =
      this.config.data.dropdownsData?.tiposEspecialidades;
    this.specialtiesDropdown = this.config.data.dropdownsData?.especialidades;
    this.typeDeadlineDaysDropdown =
      this.config.data.dropdownsData?.tiposPlazosDias;

    if (!this.config.data.plazoDetail) return;
    this.isEditing = true;
    this.plazo = this.config.data.plazoDetail;
    this.formGroup.patchValue({
      ...this.plazo,

      configurado: this.plazo.tipoConfiguracion,
      distrito_fiscal: this.plazo.idDistrito ? this.plazo.idDistrito : null,
      tipo_especialidad: this.plazo.idTipoEspecialidad
        ? this.plazo.idTipoEspecialidad
        : null,
      especialidad: this.plazo.idEspecialidad
        ? this.plazo.idEspecialidad
        : null,
      plazo_evaluar_cantidad: this.plazo.plazoEvaluar,
      plazo_evaluar_tipo: this.plazo.tipoDiasEvaluar,
      plazo_mostrar_cantidad: this.plazo.plazoAlerta,
      plazo_mostrar_tipo: this.plazo.tipoDiasAlerta,
    });
    this.codigoPlazo = this.plazo.codigoPlazo;
  }

  handleChangeTimeSet($event: any) {

    /**
    // if($event.value === 'Distrito Fiscal'){
    // }**/
  }

  closeModal() {
    this.ref.close();
  }

  sendPlazoCreateSave() {
    if (this.formGroup.valid) {
      this.isEditing ? this.savePlazo() : this.createPlazo();
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  createPlazo() {
    this.formGroup.patchValue({
      ...this.formGroup,
    });
    this.configuracionPlazosService.notifySuccessModal(
      'create',
      this.formGroup.value
    );
    this.configuracionPlazosService.notifyCompleteActionPlazo();
    // llamada al servicio
    this.closeModal();
  }

  savePlazo() {
    this.formGroup.patchValue({
      ...this.formGroup,
    });
    this.configuracionPlazosService.notifySuccessModal(
      'save',
      this.formGroup.value,
      this.codigoPlazo
    );
    this.configuracionPlazosService.notifyCompleteActionPlazo();
    // llamada al servicio
    this.closeModal();
  }

  get configuradoField(): AbstractControl {
    return this.formGroup.get('configurado');
  }
  get distritoFiscalField(): AbstractControl {
    return this.formGroup.get('distrito_fiscal');
  }
  get tipoEspecialidadField(): AbstractControl {
    return this.formGroup.get('tipo_especialidad');
  }
  get especialidadField(): AbstractControl {
    return this.formGroup.get('especialidad');
  }
  get plazoEvaluarCantidadField(): AbstractControl {
    return this.formGroup.get('plazo_evaluar_cantidad');
  }
  get plazoEvaluarTipoField(): AbstractControl {
    return this.formGroup.get('plazo_evaluar_tipo');
  }
  get plazoMostrarCantidadField(): AbstractControl {
    return this.formGroup.get('plazo_mostrar_cantidad');
  }
  get plazoMostrarTipoField(): AbstractControl {
    return this.formGroup.get('plazo_mostrar_tipo');
  }

  ngOnDestroy(): void {
    if (this.actionSubscription) this.actionSubscription.unsubscribe();
  }
}
