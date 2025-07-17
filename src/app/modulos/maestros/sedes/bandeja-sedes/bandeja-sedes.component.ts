import { Component } from '@angular/core';
import { FiltrosComponent } from './filtros/filtros.component';
import { Filtros } from '@interfaces/shared/shared';
import { AdminSedeService } from '@services/admin-sede/admin-sede.service';
import {
  DistritoFiscal,
  SedeBandejaExcelRequest,
  SedeBandejaRequest,
  SedeBandejaResponse,
} from '@interfaces/admin-sedes/admin-sedes';
import { TablaSedeComponent } from './tabla/tabla-sede.component';
import { AccionesSedeComponent } from './acciones/acciones-sede.component';
import { ContadorSedesComponent } from './contador-sedes/contador-sedes.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MaestroService } from '@services/maestro/maestro.service';
import { saveAs } from 'file-saver';
import { MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialog,
} from 'primeng/dynamicdialog';
import { EventService } from '../event.service';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-bandeja-sedes',
  standalone: true,
  imports: [
    ContadorSedesComponent,
    FiltrosComponent,
    TablaSedeComponent,
    AccionesSedeComponent,
    DynamicDialog,
  ],
  providers: [MessageService, DialogService],
  templateUrl: './bandeja-sedes.component.html',
  styleUrls: ['./bandeja-sedes.component.scss'],
})
export class BandejaSedesComponent {
  first = 0;
  query: SedeBandejaRequest;
  queryExcel: SedeBandejaExcelRequest;
  distritos: DistritoFiscal[] = [];
  sedes: SedeBandejaResponse = {
    registros: [],
    totalPaginas: 0,
    totalElementos: 0,
  };
  error: any;
  sedesDisponiblesParaExportar: boolean = false;
  totalElementos: number = 0;

  //refModal: DynamicDialogRef;

  constructor(
    private sedeService: AdminSedeService,
    private maestroService: MaestroService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    public dialogService: DialogService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.eventService.refreshSedes$.subscribe(() => {
      this.refrescarBandeja();
    });
  }

  public onFilter(filtros: Filtros): void {
    this.first = 0;
    this.loadDistritosFiscales();

    this.query = { ...this.query, pages: 10, perPage: 1, filtros };
    this.queryExcel = {
      ...this.queryExcel,
      idDistritoFiscal: filtros.idDistritoFiscal,
      nombreSede: filtros.nombreSede,
    };
    this.buscarSedesDisponibles();
  }

  public loadDistritosFiscales(): void {
    this.spinner.show();
    this.maestroService.obtenerDistritosFiscales().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.distritos = response.data;
      },
    });
  }

  public buscarSedesDisponibles(): void {
    this.spinner.show();

    this.sedeService.obtenerSedes(this.query).subscribe({
      next: (response) => {
        this.sedes = response;
        this.totalElementos = this.sedes.totalElementos;

        this.sedesDisponiblesParaExportar = this.sedes.registros.length > 0;

        this.spinner.hide();
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener servidores:', err);
        this.spinner.hide();
        this.sedesDisponiblesParaExportar = false; // Esto en caso de error también
      },
    });
  }

  public refrescarBandeja(): void {
    this.buscarSedesDisponibles();
  }

  public exportarExcel(): void {
    this.spinner.show();

    this.sedeService.obtenerSedesExcel(this.queryExcel).subscribe({
      next: (resp) => {
        saveAs(resp, 'sedes.xlsx');
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error en la solicitud [descargarExcel]: ', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error descargando el archivo Excel',
        });
      },
    });
  }

  private guardarExcel(buffer: any, nombreArchivo: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${nombreArchivo}_${new Date().getTime()}.xlsx`);
  }
}
