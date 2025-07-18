import { Component } from '@angular/core';
import { TablaComponent } from './tabla/tabla.component';
import { FiltrosComponent } from './filtros/filtros.component';
import { AccionesComponent } from './acciones/acciones.component';
import { AdminDespachoService } from '@services/admin-despacho/admin-despacho.service';
import { DespachoBandejaRequest, DespachoBandejaResponse, Filtros } from '@interfaces/admin-despacho/admin-despacho';
import { DynamicDialogModule, DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bandeja-despachos',
  standalone: true,
  templateUrl: './bandeja-despachos.component.html',
  styleUrls: ['./bandeja-despachos.component.scss'],
  imports: [
    TablaComponent,
    FiltrosComponent,
    AccionesComponent,
    //EditarDespachoComponent,
    DynamicDialogModule
  ],
  providers: [DynamicDialogConfig, DialogService, DatePipe],
})
export class BandejaDespachosComponent {

  /**
  //@ViewChild(AgregarDespachoComponent) childAgregarDespachoComponent:AgregarDespachoComponent;
  //@ViewChild(EditarDespachoComponent) childEditarDespachoComponent:EditarDespachoComponent;**/

  first = 0;
  query: DespachoBandejaRequest;
  despachos: DespachoBandejaResponse[];
  error: any;
  totalDespachos: number = 0;
  exportarExcelDisabled: boolean = true;

  constructor(private despachosService: AdminDespachoService,
    private datePipe: DatePipe) {
  }

  onFilter(filtros: Filtros) {
    this.first = 0;
    this.query = { ...this.query, pages: 1, perPage: 10, filtros };
    this.buscarDespachos();
  }

  buscarDespachos() {
    this.despachosService.obtenerDespachos(this.query).subscribe({
      next: (response) => {

        this.despachos = response.registros.map(bandejaDespacho => ({
          ...bandejaDespacho,
          fechaCreacionFormato: this.datePipe.transform(bandejaDespacho.fechaCreacion, 'dd/MM/yyyy HH:mm'),
          fechaModificacionFormato: this.datePipe.transform(bandejaDespacho.fechaModificacion, 'dd/MM/yyyy HH:mm')
        }));
        this.totalDespachos = response.totalElementos;
        if (this.totalDespachos > 0) {
          this.exportarExcelDisabled = false;
        } else {
          this.exportarExcelDisabled = true;
        }

      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener bandeja despachos:', err);
      }
    });
  }

  refrescarBandeja() {

    this.buscarDespachos();

  }

  exportarExcel() {
    const filtros: Filtros = this.query.filtros;
    this.despachosService.exportarDespachos(filtros).subscribe(
      {
        next: (response) => {

          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'Despachos.xlsx';
          anchor.click();
          window.URL.revokeObjectURL(url);

        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener despachos:', err);
        }
      });


  }


}
