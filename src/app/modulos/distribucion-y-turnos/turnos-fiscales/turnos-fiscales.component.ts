import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FiltrosComponent } from './filtros/filtros.component';
import { TablaComponent } from './tabla/tabla.component';
import { AccionesComponent } from './acciones/acciones.component';
import {
  DynamicDialogModule,
  DialogService,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { Component, OnInit } from '@angular/core';
import {
  RequestFiltrarTurno,
  TurnoResponse,
  TurnoTabla,
} from '@interfaces/administrar-turno/administrar-turno';
import { Subscription } from 'rxjs';
import { TurnoService } from '@services/turno/turno.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MenuItem } from 'primeng/api';
import { formatDateTimeTextCut } from '@utils/utils';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-turnos-fiscales',
  standalone: true,
  templateUrl: './turnos-fiscales.component.html',
  styleUrls: ['./turnos-fiscales.component.scss'],
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
  ],
  providers: [DynamicDialogConfig, DialogService],
})
export class TurnosFiscalesComponent implements OnInit {
  turnoResponse: TurnoResponse;
  turnoTabla: TurnoTabla[];

  request: RequestFiltrarTurno;
  vigente: string = null; //'0';
  nameExcel = 'Turnos_fiscales.xlsx';
  menuActionsItems: MenuItem[] = [];
  public suscriptions: Subscription[] = [];

  error: any;
  valueToAction: any;
  constructor(private readonly turnoService: TurnoService) {}
  ngOnInit() {
    // This is intentional
  }
  onFilter(getFiltros: any) {
    if (getFiltros == null) this.vigente = null; //'0';
    this.request = {
      pagina: 0,
      porPagina: 10,
      idDistritoFiscal: getFiltros?.idDistritoFiscal,
      codigoDependencia: getFiltros?.codigoDependencia,
      codigoDespacho: getFiltros?.codigoDespacho,
      fechaInicio: getFiltros?.fechaInicio,
      fechaFin: getFiltros?.fechaFin,
      vigente: this.vigente,
    };
    this.actualizarTablaTurnos(this.request);
  }

  filtraVigente(vigente: string) {
    this.request.vigente = vigente;
    this.actualizarTablaTurnos(this.request);
    this.vigente = vigente;
  }

  actualizarTablaTurnos(request: RequestFiltrarTurno) {
    this.suscriptions.push(
      this.turnoService.obtenerListaTurnos(request).subscribe({
        next: (resp) => {
          this.turnoTabla = resp.registros;
          this.turnoResponse = resp;
        },
        error: (error) => {
          console.error('error', error);
        },
      })
    );
  }

  exportToExcel(): void {
    let secuencia = 0;
    let excelExport: any[] = [];
    this.turnoTabla.forEach((turno, idx) => {
      secuencia = secuencia + 1;

      excelExport.push({
        secuencia: secuencia,
        vigente: turno?.vigente == '0' ? 'No vigente' : 'Vigente',
        distritoFiscal: turno?.distritoFiscal,
        dependencia: turno?.dependencia,
        despacho: turno?.despacho,
        fechaInicio: formatDateTimeTextCut(turno?.fechaInicio),
        fechaFin: formatDateTimeTextCut(turno?.fechaFin),
        ultimaModificacion: turno?.nombres
          ? turno?.paterno + ' ' + turno?.materno + ' ' + turno?.nombres + ' '
          : '' + formatDateTimeTextCut(turno.fechaModificacion),
      });
    });

    const encabezados = [
      {
        secuencia: 'N',
        vigente: 'Estado',
        distritoFiscal: 'Distrito Fiscal',
        dependencia: 'Fiscalías',
        despacho: 'Despacho',
        fechaInicio: 'Fecha de Inicio',
        fechaFin: 'Fecha Fin',
        ultimaModificacion: 'Última Modificación',
      },
    ];

    const datosParaExcel = [...encabezados, ...excelExport];

    const hojaTrabajo: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      datosParaExcel,
      { skipHeader: true }
    );
    const libroTrabajo: XLSX.WorkBook = {
      Sheets: { Datos: hojaTrabajo },
      SheetNames: ['Datos'],
    };
    const excelBuffer: any = XLSX.write(libroTrabajo, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarExcel(excelBuffer, 'Turnos Fiscales');
  }

  private guardarExcel(buffer: any, nombreArchivo: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${nombreArchivo}.xlsx`);
  }

  actualizarTabla() {
    this.actualizarTablaTurnos(this.request);
  }
}
