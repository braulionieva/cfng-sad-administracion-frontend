import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { saveAs } from 'file-saver';
import { ConfiguracionPlazosCasosService } from '@services/configuracion-plazos-casos/configuracion-plazos-casos.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfiguracionPlazosService } from '../configuracion-plazos.service';

@Component({
  standalone: true,
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
  imports: [CommonModule, ButtonModule, DropdownModule, ReactiveFormsModule],
  providers: [DynamicDialogConfig, DialogService],
})
export class FiltrosComponent implements OnInit {
  public refModal: DynamicDialogRef;
  public configuracion: number = null;
  public distritoFiscal: number = null;
  public tipoEspecialidad: number = null;
  public especialidad: string = null;
  @Input() dropdownsData = [];
  @Output() onCleanFilters = new EventEmitter();
  @Output() onSelectValue = new EventEmitter();
  @Output() createPlazo = new EventEmitter();
  @Output() onLoadSpecialties = new EventEmitter<number>();

  formFilters: FormGroup;

  formObject = {
    configurado: new FormControl(null),
    distrito_fiscal: new FormControl(null),
    tipo_especialidad: new FormControl(null),
    especialidad: new FormControl(null),
  };

  constructor(
    private configuracionPlazosCasosService: ConfiguracionPlazosCasosService,
    private spinner: NgxSpinnerService,
    private configuracionPlazosService: ConfiguracionPlazosService
  ) {
    this.formFilters = new FormGroup(this.formObject);
  }

  ngOnInit(): void {
    // This is intentional
  }

  handleChangeTypeSpecialty($event: any) {
    // const selectedValue = $event.value;
    // this.tipoEspecialidadField.patchValue(selectedValue);
    // this.onSelectValue.emit({
    //   ...this.formFilters.value,
    // });

    // // Emitir evento al componente padre para cargar las especialidades dinámicas
    // this.onLoadSpecialties.emit(selectedValue);
    const selectedValue = $event.value;

    // Actualiza el valor del control de formulario
    this.tipoEspecialidadField.patchValue(selectedValue);

    // Resetea el campo de especialidad, ya que cambió el tipo de especialidad
    this.especialidadField.patchValue(null);

    // Emite los valores seleccionados al componente padre
    this.onSelectValue.emit({
      ...this.formFilters.value,
    });

    // Si es necesario cargar especialidades dinámicamente, emite el evento correspondiente
    if (selectedValue) {
      this.onLoadSpecialties.emit(selectedValue);
    }
  }

  exportarExcel() {
    const request = {
      tipoConfiguracion: this.formFilters.get('configurado')?.value,
      distritoFiscal: this.formFilters.get('distrito_fiscal')?.value,
      tipoEspecialidad: this.formFilters.get('tipo_especialidad')?.value,
      especialidad: this.formFilters.get('especialidad')?.value,
    };

    this.spinner.show();

    this.configuracionPlazosCasosService
      .exportarExcelPlazosCasos(request)
      .subscribe({
        next: (resp) => {
          this.spinner.hide();
          saveAs(resp, 'ListadoPlazosCasos.xlsx');
        },
        error: (error) => {
          this.spinner.hide();
          console.error(error);
        },
      });
  }

  showModalCreationPlazo() {
    this.createPlazo.emit();
  }

  handleChange($event: any) {
    this.onSelectValue.emit($event.value);
  }

  onClickCleanFilters() {
    this.onCleanFilters.emit();
    this.formFilters.reset();
    this.configuracionPlazosService.triggerRefreshPlazos();
  }

  handleChangeConfigure($event: any) {
    this.configuracion = $event.value;
    this.distritoFiscalField.patchValue(null);
    this.tipoEspecialidadField.patchValue(null);
    this.especialidadField.patchValue(null);

    this.onSelectValue.emit({
      ...this.formFilters.value,
    });
  }

  handleChangeTaxDistrict($event: any) {
    this.configuracion = $event.value;
    this.tipoEspecialidadField.patchValue(null);
    this.especialidadField.patchValue(null);

    this.onSelectValue.emit({
      ...this.formFilters.value,
    });
  }

  // handleChangeTypeSpecialty($event: any) {
  //   this.especialidadField.patchValue(null);

  //   this.onSelectValue.emit({
  //     ...this.formFilters.value,
  //   });
  // }

  handleChangeSpecialty($event: any) {
    this.onSelectValue.emit({
      ...this.formFilters.value,
    });
  }

  get configuradoField(): AbstractControl {
    return this.formFilters.get('configurado')!;
  }
  get distritoFiscalField(): AbstractControl {
    return this.formFilters.get('distrito_fiscal')!;
  }
  get tipoEspecialidadField(): AbstractControl {
    return this.formFilters.get('tipo_especialidad')!;
  }
  get especialidadField(): AbstractControl {
    return this.formFilters.get('especialidad')!;
  }
}
