import { Component } from '@angular/core';
import { ActoProcesalAccionesComponent } from './acciones/acto-procesal-acciones.component';
import { ActoProcesalTablaComponent } from './tabla/acto-procesal-tabla.component';
import { Filtros } from '@interfaces/shared/shared';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { NgxSpinnerService } from 'ngx-spinner';
import { MaestroService } from '@services/maestro/maestro.service';
import { ActoProcesalBandejaDetalleResponse, ActoProcesalBandejaResponse } from '@interfaces/admin-acto-procesal/acto-procesal';
import { AdminActoProcesalService } from '@services/admin-acto-procesal/admin-acto-procesal.service';
//import { FiltroGenericoComponent } from '@components/filtro-generico/filtro-generico.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {FiltrosComponent} from "@modulos/gestion-fiscal/acto-procesal/bandeja/filtros/filtros.component";
import {
  ActosProcesalesRequest,
  FiltroActosProcesales
} from "@modulos/gestion-fiscal/acto-procesal/interfaces/acto-procesal.interface";

@Component({
  selector: 'app-bandeja-acto-procesal',
  standalone: true,
  imports: [
    ActoProcesalAccionesComponent,
    //FiltroGenericoComponent,
    ActoProcesalTablaComponent,
    FiltrosComponent
  ],
  templateUrl: './bandeja-acto-procesal.component.html',
  styleUrls: ['./bandeja-acto-procesal.component.scss']
})
export class BandejaActoProcesalComponent {
  tituloPage: string = 'Registro de Actos Procesales';

  // actoProcesal: MaestroGenerico[] = [];
  // carpetaCuaderno: MaestroGenerico[] = [];
  // tipoEspecialidad: MaestroGenerico[] = [];
  // especialidad: MaestroGenerico[] = [];
  // jerarquia: MaestroGenerico[] = [];
  // tipoProceso: MaestroGenerico[] = [];
  // subTipoProceso: MaestroGenerico[] = [];
  // etapas: MaestroGenerico[] = [];

  bandejaActoProcesal: ActoProcesalBandejaResponse;
  detalleActoProcesal: ActoProcesalBandejaDetalleResponse[] = [];//actoProcesalLst
  contadorActosProcesales: number = 0;
  totalActosProcesales: number = 0;

  loading: boolean = false;

  query: ActosProcesalesRequest;

  constructor(
    private readonly maestroService: MaestroService,
    private readonly actoProcesalService: AdminActoProcesalService,
    private readonly spinner: NgxSpinnerService
  ) {
    //this.loadFiltros();
  }

  // public onFilterOld(filtros: Filtros): void {
  //
  //   console.log("filtros", filtros);
  //   this.loadBandejaDetalleActosProcesales();
  // }

  public onFilter(filtros: FiltroActosProcesales): void {

    console.log("filtros", filtros);
    this.query = { ...this.query, pages: 1, perPage: 1000000, filtros };
    this.buscarActosProcesales();
  }

  // private loadFiltros(): void {
  //   this.loadFiltroActoProcesal();
  //   this.loadFiltroCarpetaCuaderno();
  //   this.loadFiltroTipoEspecialidad();
  //   this.loadFiltroEspecialidad();
  //   this.loadFiltroJerarquia();
  //   this.loadFiltroTipoProceso();
  // }
  //
  // private loadFiltroActoProcesal(): void {
  //   this.spinner.show();
  //   this.maestroService.listarActoProcesal().subscribe({
  //     next: (response) => {
  //       this.spinner.hide();
  //       // Ordenamos la data por 'nombre'
  //       response.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  //       this.actoProcesal = response.data;
  //       this.contadorActosProcesales = this.actoProcesal.length;
  //     },
  //     error: () => this.spinner.hide(),
  //   });
  // }
  //
  // private loadFiltroCarpetaCuaderno(): void {
  //   this.spinner.show();
  //   this.maestroService.listarCarpetaCuadernos().subscribe({
  //     next: (response) => {
  //       this.spinner.hide();
  //       response.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  //       this.carpetaCuaderno = response.data;
  //     },
  //     error: () => this.spinner.hide(),
  //   });
  // }
  //
  // private loadFiltroTipoEspecialidad(): void {
  //   this.spinner.show();
  //   this.maestroService.listarTipoEspecialidad().subscribe({
  //     next: (response) => {
  //       this.spinner.hide();
  //       response.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  //       this.tipoEspecialidad = response.data;
  //     },
  //     error: () => this.spinner.hide(),
  //   });
  // }
  //
  // private loadFiltroEspecialidad(): void {
  //   this.spinner.show();
  //   this.maestroService.listarEspecialidad().subscribe({
  //     next: (response) => {
  //       this.spinner.hide();
  //       response.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  //       this.especialidad = response.data;
  //     },
  //     error: () => this.spinner.hide(),
  //   });
  // }
  //
  // private loadFiltroJerarquia(): void {
  //   this.spinner.show();
  //   this.maestroService.listarJerarquia().subscribe({
  //     next: (response) => {
  //       this.spinner.hide();
  //       response.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  //       this.jerarquia = response.data;
  //     },
  //     error: () => this.spinner.hide(),
  //   });
  // }
  //
  // private loadFiltroTipoProceso(): void {
  //   this.spinner.show();
  //   this.maestroService.listarTipoProceso().subscribe({
  //     next: (response) => {
  //       this.spinner.hide();
  //       response.data.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  //       this.tipoProceso = response.data;
  //     },
  //     error: () => this.spinner.hide(),
  //   });
  // }

  //antiguo servicio que cuando buscaba se llamaba a este servicio
  // private loadBandejaDetalleActosProcesales(): void {
  //   this.loading = true;
  //
  //   this.spinner.show();
  //   this.actoProcesalService.listarDetalleActoProcesal('000001').subscribe(
  //     {
  //       next: (response) => {
  //         console.log("response loadBandejaDetalleActosProcesales:",response)
  //         console.log(typeof(response))
  //         this.detalleActoProcesal = response;
  //
  //         this.loading = false;
  //         this.spinner.hide();
  //       }
  //     }
  //   );
  // }

  private buscarActosProcesales(): void {
    this.loading = true;

    this.spinner.show();
    this.actoProcesalService.buscarActosProcesales(this.query).subscribe(
      {
        next: (response) => {
          this.detalleActoProcesal = response.registros;
          this.totalActosProcesales = response.totalElementos;

          this.loading = false;
          this.spinner.hide();
        }
      }
    );
  }

  public refrescarBandeja(): void {
    this.buscarActosProcesales();
    //this.loadFiltroActoProcesal();
  }

  public exportExcel(): void {
    if (!this.detalleActoProcesal || this.detalleActoProcesal.length === 0) {
      // No hay datos para exportar
      return;
    }

    // Primero, agrupamos la data por actoProcesal y idActoProcesal
    // Podemos usar un Map para agrupar
    const grupos = new Map<string, ActoProcesalBandejaDetalleResponse[]>();

    for (const item of this.detalleActoProcesal) {
      const key = `${item.idActoProcesal}||${item.actoProcesal}`;
      if (!grupos.has(key)) {
        grupos.set(key, []);
      }
      grupos.get(key).push(item);
    }

    // Ahora creamos el arreglo final de filas del Excel
    // Estructura solicitada:
    // Cabecera de grupo: idActoProcesal, actoProcesal, [resto celdas vacías]
    // Filas detalle: codigo, tipoCarpetaCuaderno, tipoEspecialidad, especialidad, jerarquia, tipoProceso, subTipoProceso, etapa

    const dataForExcel: any[] = [];

    // Opcional: agregamos una fila de encabezados globales (no obligatorio si no lo deseas)
    // Por ejemplo:
    dataForExcel.push([
      'Código/ID Acto Procesal',
      'Acto Procesal',
      'Código Detalle',
      'Carpeta/Cuaderno',
      'Tipo Especialidad',
      'Especialidad',
      'Jerarquía',
      'Tipo Proceso',
      'Sub Tipo Proceso',
      'Etapa'
    ]);

    for (const [key, items] of grupos.entries()) {
      const [idActoProcesal, actoProcesal] = key.split('||');

      // Fila del encabezado del grupo
      dataForExcel.push([
        idActoProcesal,
        actoProcesal,
        '', // a partir de aquí celdas vacías para alinear
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ]);

      // Filas de detalle
      for (const detalle of items) {
        dataForExcel.push([
          '', // vacío porque ya se mostró en la fila del grupo
          '', // vacío también
          detalle.codigo,
          detalle.tipoCarpetaCuaderno,
          detalle.tipoEspecialidad,
          detalle.especialidad,
          detalle.jerarquia,
          detalle.tipoProceso,
          detalle.subTipoProceso,
          detalle.etapa
        ]);
      }

    }

    // Creamos la hoja de cálculo a partir del array dataForExcel
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

    // Creamos el workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ActosProcesales');

    // Generamos el archivo
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Nombre de archivo
    const fecha = new Date();
    const nombreArchivo = `ActosProcesales_${fecha.getFullYear()}${(fecha.getMonth()+1)}${fecha.getDate()}.xlsx`;

    // Descargamos el archivo
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), nombreArchivo);
  }

}
