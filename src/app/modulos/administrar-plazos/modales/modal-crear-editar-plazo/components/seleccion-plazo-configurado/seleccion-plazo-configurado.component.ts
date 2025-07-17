import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { IDropdownsData } from '@interfaces/administrar-plazos/administrar-plazos';
import { AdministrarPlazosService } from '@services/administrar-plazos/administrar-plazos.service';

@Component({
  selector: 'app-seleccion-plazo-configurado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RadioButtonModule,
    DropdownModule,
  ],
  templateUrl: './seleccion-plazo-configurado.component.html',
})
export class SeleccionPlazoConfiguradoComponent implements OnInit {
  public formGroup: FormGroup;

  @Input() dropdownsData: IDropdownsData;
  @Input() plazoAplica: 1 | 4;

  public especialidadesDropdown = [];

  public plazoConfiguradoEvaluado = {
    distrito_fiscal: false,
    tipo_especialidad: false,
    especialidad: false,
    pre_etapa: false,
  };

  private grupoFormularioObjeto = {
    plazoConfigurado: new FormControl<number>(1, Validators.required),
    distritoFiscal: new FormControl<number | null>(null),
    tipoEspecialidad: new FormControl<number | null>(null),
    especialidad: new FormControl<number | null>(null),
    preEtapa: new FormControl<string | null>(null),
    etapa: new FormControl<string | null>(null),
  };

  constructor(private administrarPlazosService: AdministrarPlazosService) {
    this.formGroup = new FormGroup(this.grupoFormularioObjeto);
  }

  ngOnInit(): void {
    this.evaluarSeleccionPlazoConfigurado();
    this.campoPlazoConfigurado.valueChanges.subscribe(() => {
      this.evaluarSeleccionPlazoConfigurado();
    });
  }

  private evaluarSeleccionPlazoConfigurado() {
    // reinicio de campos
    this.campoDistritoFiscal.reset();
    this.campoTipoEspecialidad.reset();
    this.campoEspecialidad.reset();
    this.campoPreEtapa.reset();
    this.campoEtapa.reset();
    const configuracionSeccion = {
      1: {
        distrito_fiscal: false,
        tipo_especialidad: false,
        especialidad: false,
        pre_etapa: true,
        distritoFiscalValidator: [],
        tipoEspecialidadValidator: [],
        especialidadValidator: [],
      },
      2: {
        distrito_fiscal: true,
        tipo_especialidad: false,
        especialidad: false,
        pre_etapa: true,
        distritoFiscalValidator: [Validators.required],
        tipoEspecialidadValidator: [],
        especialidadValidator: [],
      },
      3: {
        distrito_fiscal: true,
        tipo_especialidad: true,
        especialidad: false,
        pre_etapa: true,
        distritoFiscalValidator: [Validators.required],
        tipoEspecialidadValidator: [Validators.required],
        especialidadValidator: [],
      },
      4: {
        distrito_fiscal: true,
        tipo_especialidad: true,
        especialidad: true,
        pre_etapa: true,
        distritoFiscalValidator: [Validators.required],
        tipoEspecialidadValidator: [Validators.required],
        especialidadValidator: [Validators.required],
      },
    };

    const plazoSeleccionado =
      configuracionSeccion[this.campoPlazoConfigurado.value];
    this.plazoConfiguradoEvaluado = {
      distrito_fiscal: plazoSeleccionado?.distrito_fiscal,
      tipo_especialidad: plazoSeleccionado?.tipo_especialidad,
      especialidad: plazoSeleccionado?.especialidad,
      pre_etapa: plazoSeleccionado?.pre_etapa,
    };

    // Configurando validadores
    this.campoDistritoFiscal.setValidators(
      plazoSeleccionado?.distritoFiscalValidator
    );
    this.campoTipoEspecialidad.setValidators(
      plazoSeleccionado?.tipoEspecialidadValidator
    );
    this.campoEspecialidad.setValidators(
      plazoSeleccionado?.especialidadValidator
    );

    // Validación de preEtapa y etapaTramite
    if (this.plazoAplica === 1) {
      this.campoEtapa.clearValidators();
      this.campoPreEtapa.setValidators([Validators.required]);
    } else if (this.plazoAplica === 4) {
      this.campoPreEtapa.clearValidators();
      this.campoEtapa.setValidators([Validators.required]);
    }

    // Forzando la actualización del estado de los controles
    this.campoPreEtapa.updateValueAndValidity();
    this.campoEtapa.updateValueAndValidity();
    this.campoDistritoFiscal.updateValueAndValidity();
    this.campoTipoEspecialidad.updateValueAndValidity();
    this.campoEspecialidad.updateValueAndValidity();
  }

  getFormData() {
    return this.formGroup.value;
  }

  public obtenerEspecialidadesDropdown(
    tipoEspecialidadId: number | null,
    especialidadId?: number | null
  ): void {
    // Limpia el array
    this.especialidadesDropdown = [];
  
    if (tipoEspecialidadId === null) return;
  
    this.administrarPlazosService
      .listaEspecialidades(tipoEspecialidadId)
      .subscribe({
        next: (res: any) => {
          if (!res.data) return;
  
          // Ordenar alfabéticamente según la propiedad "nombre"
          res.data.sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
          );
  
          this.especialidadesDropdown = res.data;
  
          if (especialidadId !== null && especialidadId !== undefined) {
            this.campoEspecialidad.setValue(especialidadId);
          }
        },
        error: (err: string | any) => {
          console.error('Error en la solicitud [listaEspecialidades]: ', err);
        },
      });
  }
  

  get campoPlazoConfigurado(): AbstractControl {
    return this.formGroup.get('plazoConfigurado')!;
  }
  get campoDistritoFiscal(): AbstractControl {
    return this.formGroup.get('distritoFiscal')!;
  }
  get campoTipoEspecialidad(): AbstractControl {
    return this.formGroup.get('tipoEspecialidad')!;
  }
  get campoEspecialidad(): AbstractControl {
    return this.formGroup.get('especialidad')!;
  }
  get campoPreEtapa(): AbstractControl {
    return this.formGroup.get('preEtapa')!;
  }
  get campoEtapa(): AbstractControl {
    return this.formGroup.get('etapa')!;
  }
}
