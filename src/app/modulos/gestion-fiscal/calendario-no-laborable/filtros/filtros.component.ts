import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup , ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FiltrosCalendar } from '@interfaces/shared/shared';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { MaestroService } from '@services/maestro/maestro.service';
import { formatDateSimple } from '@utils/utils';

@Component({
  selector: 'app-filtros',
  standalone: true,
  imports: [CommonModule,DropdownModule,
            RadioButtonModule,
            ReactiveFormsModule,
            InputTextModule,
            CalendarModule,
            ReactiveFormsModule,
            CheckboxModule,
            ButtonModule],
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss']
})
export class FiltrosComponent implements OnInit {

  @Output() filter = new EventEmitter<FiltrosCalendar>();
  filtros : FiltrosCalendar;
  filtroForm: FormGroup;
  distritosFiscales = [{label: 'Lima Norte', value: 4}, /* otros valores */];
  showAdditionalFilters = false;

  constructor(private fb: FormBuilder,
    public maestroService:MaestroService
  ) {
    this.filtroForm = this.fb.group({
      nombre:[null],
      descripcion:[null],
      fechaInicio:[null],
      fechaFin:[null],
      distritoFiscal:[null],
      feriado:[null],
      nolaborable:[null],
      nacional:[null],
      regional:[null],
    });
  }

  ngOnInit() {
    this.loadDistritosFiscales();
  }

  obtenerTipoDia():string{
    if(this.filtroForm.value.feriado?.length>0){
      if(this.filtroForm.value.noLaborable?.length>0)
        return null;
      else
        return '1';
    }
    else{
      if(this.filtroForm.value.noLaborable?.length>0)
        return '2';
      else
        return null;
    }
  }

  obtenerTipoAmbito():string{
    if(this.filtroForm.value.nacional?.length>0){
      if(this.filtroForm.value.regional?.length>0)
        return null;
      else
        return '1';
    }
    else{
      if(this.filtroForm.value.regional?.length>0)
        return '2';
      else
        return null;

    }
  }
  //OBTENER EL PAYLOAD
  getPayload() {
    this.filtros = {
      nombre: this.filtroForm.value.nombre,
      descripcion: this.filtroForm.value.descripcion,
      idDistritoFiscal: this.filtroForm.value.distritoFiscal,
      fechaInicio: formatDateSimple(this.filtroForm.value.fechaInicio),
      fechaFin: formatDateSimple(this.filtroForm.value.fechaFin),
      tipoDia:this.obtenerTipoDia(),
      tipoAmbito:this.obtenerTipoAmbito(),
      pagina:1,//automatizar
      porPagina:10
    };

    return this.filtros;
  }
  public loadDistritosFiscales(): void {
    this.maestroService.obtenerDistritosFiscales().subscribe({
      next: (response) => {
        this.distritosFiscales = response.data.sort(
          (a, b) => a.nombre.localeCompare(b.nombre)
        );
      }
    });
  }

  submit() {
    this.filter.emit(this.getPayload());
  }

  //FUNCION MOSTRAR MÁS FILTROS
  toggleFilters() {
    this.showAdditionalFilters = !this.showAdditionalFilters;
  }

  //FUNCIÓN OBTENER ICONO
  getIcon() {
    return `pi pi-angle-double-${this.showAdditionalFilters ? 'up' : 'down'}`;
  }

  //FUNCIÓN LIMPIAR FILTROS
  onClearFilters() {
    this.filtroForm.reset();
    this.showAdditionalFilters = false;
    this.filter.emit(null);
  }

}
