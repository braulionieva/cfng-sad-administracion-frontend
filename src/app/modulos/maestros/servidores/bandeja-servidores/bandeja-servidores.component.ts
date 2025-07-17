
import { ServidorService } from '@services/servidor/servidor.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import { AccionesComponent } from './acciones/acciones.component';
import { Filtros } from '@interfaces/shared/shared';
import { ServidorBandejaRequest, ServidorBandejaResponse } from '@interfaces/servidor/servidor';
import { DynamicDialog, DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-bandeja-servidores',
  standalone: true,
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
    DynamicDialog

  ],
  providers: [DynamicDialogConfig, DialogService],
  templateUrl: './bandeja-servidores.component.html',
  styleUrls: ['./bandeja-servidores.component.scss']
})
export class BandejaServidoresComponent {

  private query: ServidorBandejaRequest;
  public servidores: ServidorBandejaResponse;
  private error: any;
  private readonly servidorService: ServidorService = inject(ServidorService);

  public onFilter(filtros: Filtros): void {

    this.query = { ...this.query, pages: 1, perPage: 10, filtros };
    this.buscarServidoresDisponibles();
  }

  public buscarServidoresDisponibles(): void {
    this.servidorService.obtenerServidores(this.query).subscribe(
      {
        next: (response: ServidorBandejaResponse): void => {
          this.servidores = response;
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener servidores:', err);
        }
      });

  }

  public refrescarBandeja(): void {

    this.buscarServidoresDisponibles();

  }

  public exportarExcel(): void {
    this.servidorService.exportarServidores(this.query).subscribe(
      {
        next: (response) => {

          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'ExcelBandejaServidores.xlsx';
          anchor.click();
          window.URL.revokeObjectURL(url);

        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener servidores:', err);
        }
      });


  }

}
