import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
@Component({
  standalone: true,
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [DynamicDialogConfig, DialogService],
})
export class FiltrosComponent implements OnInit {
  public refModal: DynamicDialogRef;
  @Input() categories = [];
  @Input() specialties = [];

  @Output() onCleanFilters = new EventEmitter();
  @Output() createPlazo = new EventEmitter();
  @Output() onSelectCategory = new EventEmitter();
  @Output() onSelectValuesFilter = new EventEmitter();
  @Output() onExportExcel = new EventEmitter();

  objetoFormulario = {
    tipoEspecialidad: new FormControl(null),
    idEspecialidad: new FormControl(null),
  };

  public formularioFiltros: FormGroup;

  constructor() {
    this.formularioFiltros = new FormGroup(this.objetoFormulario);
  }

  ngOnInit(): void {
    // This is intentional
  }

  showModalCreationPlazo() {
    this.createPlazo.emit();
  }

  changeCategory($event: any) {
    const selectedCategoryId = $event.value;
    this.onSelectCategory.emit(selectedCategoryId);
    this.onSelectValuesFilter.emit(this.formularioFiltros.value);
  }

  changeSpecialty($event: any) {
    /**const selectedSpecialtyId = $event.value;**/
    this.onSelectValuesFilter.emit(this.formularioFiltros.value);
  }

  exportarExcel($event: any) {
    this.onExportExcel.emit(this.formularioFiltros.value);
  }

  onClickCleanFilters() {
    this.formularioFiltros.reset();
    this.onCleanFilters.emit(this.formularioFiltros.value);
  }
}
