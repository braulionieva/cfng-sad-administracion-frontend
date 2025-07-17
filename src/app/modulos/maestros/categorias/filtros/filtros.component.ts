import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { IDropdownsData } from '@interfaces/categorias/categorias';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['../aplicaciones-categorias.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    ReactiveFormsModule,
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
  public readonly refModal: DynamicDialogRef;
  public indiceActivo: number = 1;
  private readonly valoresInicialesFormulario: any;

  @Input() dropdownsData: IDropdownsData = {
    categorias_padre: [],
  };

  @Output() obtenerValoresFiltros = new EventEmitter<any>();
  @Output() clickBotonCreacion = new EventEmitter<any>();
  @Output() clickBotonExportacion = new EventEmitter<any>();

  public formularioFiltros: FormGroup<any>;

  constructor() {
    this.formularioFiltros = new FormGroup<any>({
      nombre: new FormControl<string>(''),
      codigo: new FormControl<string>(''),
      nombrePlural: new FormControl<string>(''),
      categoriaPadre: new FormControl<number | null>(null),
      palabraClave: new FormControl<string>(''),
    });
    this.valoresInicialesFormulario = this.formularioFiltros.value;

    // Aquí agregamos la suscripción a los cambios del formulario con debounceTime
    this.formularioFiltros.valueChanges
      .pipe(debounceTime(300)) // Esperamos 300ms después de cada cambio en el formulario
      .subscribe(() => {
        this.obtenerFiltros(); // Aplicamos los filtros automáticamente cuando hay cambios
      });
  }

  showModalCreationCategory() {
    this.clickBotonCreacion.emit();
  }

  obtenerFiltros() {
    // emitiendo los filtros seleccionados para filtrarlos en la tabla
    this.obtenerValoresFiltros.emit(
      this.filtrosMapping(this.formularioFiltros.value)
    );
  }

  onlyNumberKey(event: KeyboardEvent) {
    const key = event.key;

    if (!/^\d$/.test(key) && key !== 'Backspace') {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onPasteSoloNumeros(event: ClipboardEvent) {
    const clipboardData = event.clipboardData; // Accede directamente al clipboardData del evento
    const pastedText = clipboardData?.getData('text'); // Obtén los datos como texto

    if (!/^\d+$/.test(pastedText || '')) {
      event.preventDefault(); // Cancela el evento si no es numérico
      return false;
    }
    return true;
  }

  public limpiarFiltros() {
    this.formularioFiltros.reset();
    this.formularioFiltros.setValue(this.valoresInicialesFormulario);
    // emitiendo filtros vacios para refrescar la tabla
    this.obtenerValoresFiltros.emit(
      this.filtrosMapping(this.formularioFiltros.value)
    );
  }

  private filtrosMapping(filtros) {
    return {
      nombreCategoria: filtros.nombre,
      codigoCategoria: filtros.codigo,
      nombreCategoriaPlural: filtros.nombrePlural,
      idCategoriaPadre: filtros.categoriaPadre,
      palabrasClave: filtros.palabraClave,
    };
  }

  public mostrarOcultarFiltros(index: number) {
    this.indiceActivo = this.indiceActivo === index ? -1 : index;
  }
}
