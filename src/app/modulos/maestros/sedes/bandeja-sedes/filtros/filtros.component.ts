import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DistritoFiscal } from '@interfaces/admin-sedes/admin-sedes';
import { Filtros } from '@interfaces/shared/shared';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-sedes-filtros',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss'],
})
export class FiltrosComponent implements OnInit {
  @Input() distritos: DistritoFiscal[] = [];
  @Output() filter = new EventEmitter<Filtros>();
  filtros: Filtros;
  filtroForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filtroForm = this.fb.group({
      nombreSede: [null],
      idDistritoFiscal: [null],
    });
  }

  ngOnInit() {
    /**
    // this.filtroForm.valueChanges.subscribe(() => {
    //   this.submit(); // Llama al método submit() cada vez que hay un cambio en el formulario
    // });**/
    this.filtroForm.valueChanges
      .pipe(
        debounceTime(300) // Ajustar el tiempo de debounce según sea necesario para el tiempo
      )
      .subscribe(() => {
        this.submit();
      });
    this.submit(); // Llamada inicial para cargar los datos
  }

  public getPayload(): Filtros {
    this.filtros = {
      nombreSede: this.filtroForm.value.nombreSede,
      idDistritoFiscal: this.filtroForm.value.idDistritoFiscal,
    };
    return this.filtros;
  }

  public submit(): void {
    this.filter.emit(this.getPayload());
  }

  //FUNCIÓN LIMPIAR FILTROS
  public onClearFilters(): void {
    this.filtroForm.reset();
  }
}
