import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { IDropdown } from '../cargos.interface';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';

@Component({
  standalone: true,
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    ReactiveFormsModule,
    CmpLibModule,
  ],
  providers: [DynamicDialogConfig, DialogService],
})
export class FiltrosComponent implements OnInit {
  public obtenerIcono = obtenerIcono;
  public refModal: DynamicDialogRef;

  @Input() jerarquias: IDropdown[] = [];
  @Input() categorias: IDropdown[] = [];
  @Input() puedeExportar: boolean = false;

  @Output() onCleanFilters = new EventEmitter();
  @Output() onSelectValue = new EventEmitter();
  @Output() createCharger = new EventEmitter();
  @Output() onExportExcel = new EventEmitter();

  public formularioFiltros: FormGroup;

  objetoFormulario = {
    nombre: new FormControl(''),
    jerarquia: new FormControl(null),
    categoria: new FormControl(null),
  };


  constructor() {
    this.formularioFiltros = new FormGroup(this.objetoFormulario);
  }

  ngOnInit() {
    this.formularioFiltros.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  showModalCreationPlazo() {
    this.createCharger.emit();
  }

  aplicarFiltros() {
    this.onSelectValue.emit(this.formularioFiltros.value);
  }

  exportarExcel() {
    this.onExportExcel.emit(this.formularioFiltros.value);
  }

  onClickCleanFilters() {
    this.formularioFiltros.reset();
    this.onCleanFilters.emit(this.formularioFiltros.value);
  }
}
