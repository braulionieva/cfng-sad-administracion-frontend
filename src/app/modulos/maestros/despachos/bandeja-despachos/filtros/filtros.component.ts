import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DistritoFiscal, Filtros } from '@interfaces/admin-despacho/admin-despacho';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminDespachoService } from '@services/admin-despacho/admin-despacho.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [
    DropdownModule,
    ButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss']
})
export class FiltrosComponent implements OnInit {

  @Output() filter = new EventEmitter<Filtros>();
  filtros: Filtros;
  filtroForm: FormGroup;
  distritosFiscales: any[];
  dependencias: any[];
  error: any;
  cmbDependenciaDisabled: FormControl;

  constructor(private despachosService: AdminDespachoService,
    private fb: FormBuilder) {
    this.filtroForm = this.fb.group({
      nombreDespacho: [null],
      idDistritoFiscal: [null],
      idDependencia: [null]
    });
    this.cmbDependenciaDisabled = this.filtroForm.get('idDependencia') as FormControl;
    this.cmbDependenciaDisabled.disable(); // Deshabilitar por defecto*/

    this.listarComboDistritoFiscal();

  }

  ngOnInit() {
    this.filtroForm.valueChanges
      .pipe(
        debounceTime(300) // Ajustar el tiempo de debounce según sea necesario para el tiempo
      )
      .subscribe(() => {
        this.onSubmit();
      });
    this.onSubmit();
  }

  //OBTENER EL PAYLOAD
  getPayload() {
    this.filtros = {
      nombreDespacho: this.filtroForm.value.nombreDespacho,
      codigoDistritoFiscal: this.filtroForm.value.idDistritoFiscal,
      codigoDependencia: this.filtroForm.value.idDependencia,
    };
    return this.filtros;
  }

  public onSubmit(): void {
    // Esta función se ejecutará cuando ocurra el evento submit
    this.filter.emit(this.getPayload());
  }

  listarComboDistritoFiscal() {
    this.despachosService.listarComboDistritoFiscal().subscribe({
      next: (response) => {

        this.distritosFiscales = response.map(df => ({
          label: df.nombre,
          value: df.codigo
        }));

      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener combo distritos fiscales:', err);
      }
    });
  }

  listarComboDependencia(distritoFiscal: DistritoFiscal) {
    this.despachosService.listarComboDependencia(distritoFiscal).subscribe({
      next: (response) => {
        this.dependencias = response
          .map(df => ({
            label: df.nombre,
            value: df.codigo
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        
        this.cmbDependenciaDisabled.enable();
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener combo dependencias:', err);
      }
    });
  }

  onchangeDistritoFiscalGetDependencias(event: any) {
    let distritoFiscal: DistritoFiscal = { codigo: event.value, nombre: null };
    this.listarComboDependencia(distritoFiscal);
  }

  //FUNCIÓN LIMPIAR FILTROS
  onClearFilters() {
    this.filtroForm.reset();
    this.cmbDependenciaDisabled.disable();
  }

}
