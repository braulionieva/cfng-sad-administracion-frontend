import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './calendario-anual/calendario-anual.component';
import { AccionesComponent } from './acciones/acciones.component';
import { Filtros, FiltrosCalendar } from '@interfaces/shared/shared';
import {
  DynamicDialogModule,
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import * as XLSX from 'xlsx';
import { CalendarioNoLaborableService } from '@services/calendario-no-laborable/calendario-no-laborable.service';
import { TablaDiasNoLaborableComponent } from './tabla-dias-no-laborable/tabla-dias-no-laborable.component';
import { MenuItem } from 'primeng/api';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { formatDateString } from '@utils/utils';

@Component({
  selector: 'app-calendario-no-laborable',
  standalone: true,
  templateUrl: './calendario-no-laborable.component.html',
  styleUrls: ['./calendario-no-laborable.component.scss'],
  imports: [
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    FiltrosComponent,
    TablaComponent,
    AccionesComponent,
    DynamicDialogModule,
    CmpLibModule,
    TablaDiasNoLaborableComponent,
  ],
  providers: [DynamicDialogConfig, DialogService],
})
export class CalendarioNoLaborableComponent {
  @Output() filter = new EventEmitter<Filtros>();
  error: any;
  query: any;
  calendario: boolean = true;
  valueToAction: any;
  ListaNoLaborables: any;
  showActionsButton: boolean = true;
  menuActionsItems: MenuItem[] = [];
  totalFechas: number;
  calendarioNoLaborable: any;
  nameExcel = 'calendarionolaborable.xlsx';
  public refModal: DynamicDialogRef;

  // 1) Creamos una referencia al componente <app-calendario-anual>
  @ViewChild(TablaComponent) calendarioAnual: TablaComponent;

  constructor(
    public dialogService: DialogService,
    private calendarioNoLaborableService: CalendarioNoLaborableService
  ) {}

  onDelete($objetoFecha: any) {
    if ($objetoFecha != null && $objetoFecha != undefined) {
      this.servicioEliminarRegistro($objetoFecha);
      this.actualizarTablaDiasNoLaborables();
    }
  }

  onFilter(filtros: FiltrosCalendar) {
    if (filtros) {
      this.calendario = false; // Modo tabla
      this.query = filtros;
      this.actualizarTablaDiasNoLaborables();
    } else {
      this.calendario = true; // Modo calendario
    }
  }

  private servicioEliminarRegistro($objetoFecha: any): void {
    let usuario = '32920589';
    let fechaEliminar = $objetoFecha;
    this.calendarioNoLaborableService
      .eliminarFechaNoLaborable(fechaEliminar?.idCalendario, usuario)
      .subscribe({
        next: (response) => {
          this.informarEliminacionRegistro(
            'success',
            'ELIMINACIÓN REALIZADA CORRECTAMENTE',
            'Se eliminó de forma exitosa los datos del(los) día(s)  ' +
              formatDateString(fechaEliminar.fecha) +
              ': ' +
              fechaEliminar.nombre +
              '.'
          );
        },
        error: (err) => {
          this.error = err;
          console.error('Error al eliminar día no laborable.', err);
        },
      });
  }

  public informarEliminacionRegistro(
    icon: string,
    title: string,
    description: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
        confirmButtonText: 'Listo',
      },
    });
  }

  actualizarTablaDiasNoLaborables() {
    this.calendarioNoLaborableService
      .obtenerListaFechasNoLaborables(this.query)
      .subscribe({
        next: (response) => {
          this.calendarioNoLaborable = response;
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener dias laborables:', err);
        },
      });
  }

  refrescarBandeja() {
    this.actualizarTablaDiasNoLaborables();

    // Si el calendario está activo, también refrescamos
    if (this.calendario) {
      this.calendarioAnual?.actualizarCalendario();
    }
  }

  getDataToAction(data: any) {
    this.valueToAction = data;
  }

  exportarExcel() {
    let element = document.getElementById('dias no laborables');
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    XLSX.writeFile(book, this.nameExcel);
  }
}
