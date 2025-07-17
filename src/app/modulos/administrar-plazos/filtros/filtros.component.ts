import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  IDropdownsData,
  IFormularioFiltros,
  IFormularioFiltrosControls,
} from '@interfaces/administrar-plazos/administrar-plazos';
import { InputNumberModule } from 'primeng/inputnumber';
import { AdministrarPlazosService } from '@services/administrar-plazos/administrar-plazos.service';
import { debounceTime } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['../administrar-plazos.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    ReactiveFormsModule,
    RadioButtonModule,
    InputNumberModule,
  ],
  providers: [DynamicDialogConfig, DialogService],
  animations: [
    trigger('stateFilter', [
      state(
        'collapsed',
        style({
          height: '0',
          padding: '0',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition(
        'expanded <=> collapsed',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
    ]),
  ],
})
export class FiltrosComponent {
  public refModal: DynamicDialogRef;
  public indiceActivo: number = 1;
  private valoresInicialesFormulario: IFormularioFiltros;
  @Input() numeroPlazos: number = 0;

  @Input() dropdownsData: IDropdownsData = {
    tipos: [],
    distritos_fiscales: [],
    tipos_especialidad: [],
    preEtapas_etapas: [],
  };

  @Output() obtenerValoresFiltros = new EventEmitter<any>();
  @Output() clickBotonCreacion = new EventEmitter<void>();
  @Output() clickBotonExportacion = new EventEmitter<any>();

  public especialidadesDropdown = [];
  public formularioFiltros: FormGroup<any>;

  constructor(private administrarPlazosService: AdministrarPlazosService) {
    this.formularioFiltros = new FormGroup<IFormularioFiltrosControls>({
      tipo: new FormControl<number | null>(null),
      plazo: new FormControl<string>(null),
      distritoFiscal: new FormControl<number | null>(null),
      tipoEspecialidad: new FormControl<number | null>(null),
      especialidad: new FormControl<number | null>(null),
      etapaPreEtapa: new FormControl<number | null>(null),
      codigoTramite: new FormControl<string>(''),
      tramite: new FormControl<string>(''),
      diasCalendario: new FormControl<string | null>(null),
      restrictivo: new FormControl<string | null>(null),
    });

    this.valoresInicialesFormulario = this.formularioFiltros
      .value as IFormularioFiltros;

    // Aquí agregamos la suscripción a los cambios del formulario con debounceTime
    this.formularioFiltros.valueChanges
      .pipe(debounceTime(300)) // Esperamos 300ms después de cada cambio en el formulario
      .subscribe(() => {
        this.obtenerFiltros(); // Aplicamos los filtros automáticamente cuando hay cambios
      });
  }

  showModalCreationPlazo() {
    this.clickBotonCreacion.emit();
  }

  obtenerFiltros() {
    // emitiendo los filtros seleccionados para filtrarlos en la tabla
    this.obtenerValoresFiltros.emit(
      this.filtrosMapping(this.formularioFiltros.value)
    );
    if (this.tipoEspecialidad.valueChanges) {
      this.obtenerEspecialidadesDropdown(this.tipoEspecialidad.value);
    }
  }

  exportarExcel() {
    // this.clickBotonExportacion.emit(
    //   this.formularioFiltros.value as IFormularioFiltros
    // );
    this.clickBotonExportacion.emit(
      this.filtrosMapping(this.formularioFiltros.value)
    );
  }

  public obtenerEspecialidadesDropdown(tipoEspecialidadId: number | null): void {
    if (tipoEspecialidadId === null) return;
  
    this.administrarPlazosService
      .listaEspecialidades(tipoEspecialidadId)
      .subscribe({
        next: (res: any) => {
          if (!res.data) return;
          this.especialidadesDropdown = res.data;
          this.especialidadesDropdown.sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          );
        },
        error: (err) => {
          console.error('Error en la solicitud [listaEspecialidades]: ', err);
        },
      });
  }

  public limpiarFiltros() {
    this.formularioFiltros.reset();
    this.formularioFiltros.setValue(this.valoresInicialesFormulario);
    // limpiando valores de especialidades
    this.especialidadesDropdown = [];
    // emitiendo filtros vacios para refrescar la tabla
    this.obtenerValoresFiltros.emit(
      this.filtrosMapping(this.formularioFiltros.value)
    );
  }

  private filtrosMapping(filtros) {
    return {
      idItem: filtros.tipo,
      numeroPlazo: filtros.plazo,
      idDistritoFiscal: filtros.distritoFiscal,
      idTipoEspecialidad: filtros.tipoEspecialidad,
      idEspecialidad: filtros.especialidad,
      idEtapa: filtros.etapaPreEtapa,
      idTramite: filtros.codigoTramite,
      tramite: filtros.tramite,
      flagDiasCalendarios: filtros.diasCalendario,
      flagRestriccion: filtros.restrictivo,
      // falta dias calendario y restrictivo?
    };
  }

  public mostrarOcultarFiltros(index: number) {
    this.indiceActivo = this.indiceActivo === index ? -1 : index;
  }

  get tipoEspecialidad(): AbstractControl {
    return this.formularioFiltros.get('tipoEspecialidad')!;
  }
}
