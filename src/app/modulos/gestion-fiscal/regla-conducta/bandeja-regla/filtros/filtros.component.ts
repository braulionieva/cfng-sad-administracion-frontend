import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule
  ],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss']
})
export class FiltrosComponent {

  @Output() filter = new EventEmitter<any>();
  filtroForm: FormGroup;
  filtros : any;

  constructor(private fb: FormBuilder){
    this.filtroForm = this.fb.group({
      nombreReglaConducta: [null]
    });
  }

  ngOnInit(){
    this.onSubmit();
  }

  //OBTENER EL PAYLOAD
  getPayload() {

    this.filtros = {
      nombreReglaConducta: this.filtroForm.value.nombreReglaConducta
    };

    return this.filtros;
  }

  onSubmit() {
    // Esta función se ejecutará cuando ocurra el evento submit
    this.filter.emit(this.getPayload());
  }

  buscarReglaKeyUp() {
    const nombreReglaConducta = this.filtroForm.get('nombreReglaConducta').value;
    if (nombreReglaConducta.length >= 5) {
      // Ejecutar código específico aquí
      this.onSubmit();
    }
  }

  //FUNCIÓN LIMPIAR FILTROS
  onClearFilters() {
    this.filtroForm.reset();
  }
}
