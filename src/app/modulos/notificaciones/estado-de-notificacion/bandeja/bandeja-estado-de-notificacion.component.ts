import { Component, OnInit } from '@angular/core';
//import { FiltroGenericoComponent } from '@components/filtro-generico/filtro-generico.component';
import { AccionesEstadoDeNotificacionComponent } from './acciones/acciones-estado-de-notificacion.component';
import { MaestroGenerico } from '@interfaces/maestro-generico/maestro-generico';
import { Filtros } from '@interfaces/shared/shared';
import {
  BandejaEstadoDeNotificacionResponse,
  FiltroEstadoNotificacion, FiltroEstadoNotificacionRequest
} from '@interfaces/admin-estado-de-notificacion/estado-de-notificacion';
import { EstadoDeNotificacionService } from '@services/admin-estado-de-notificacion/estado-de-notificacion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TablaGenericaComponent } from '@components/tabla-generica/tabla-generica.component';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AgregarEstadoDeNotificacionComponent } from '../modal-agregar/agregar-estado-de-notificacion.component';
import {FiltrosComponent} from "@modulos/notificaciones/estado-de-notificacion/bandeja/filtros/filtros.component";

@Component({
  selector: 'app-bandeja-estado-de-notificacion',
  standalone: true,
  imports: [
    //FiltroGenericoComponent,
    AccionesEstadoDeNotificacionComponent,
    TablaGenericaComponent,
    FiltrosComponent,
  ],
  templateUrl: './bandeja-estado-de-notificacion.component.html',
  styleUrls: ['./bandeja-estado-de-notificacion.component.scss'],
  providers: [MessageService, DialogService],
})
export class BandejaEstadoDeNotificacionComponent implements OnInit {
  etapas: MaestroGenerico[] = [];
  bandeja: BandejaEstadoDeNotificacionResponse[] = [];
  loading: boolean = false;
  contadorEstados: number = 0;
  colsTable: any[] = [];
  showActionsButton: boolean = true;
  menuActionsItems: MenuItem[] = [];
  valueToAction: any;

  public refModal: DynamicDialogRef;

  private currentFilters: FiltroEstadoNotificacion | null = null;

  query: FiltroEstadoNotificacionRequest;

  constructor(
    public dialogService: DialogService,
    private estadoNotificacion: EstadoDeNotificacionService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.colsTable = [
      { field: 'idRow', header: 'Nro.' },
      { field: 'esGeneral', header: 'Estado Cédula' },
      { field: 'notificacion', header: 'Notificación' },
      { field: 'citacion', header: 'Citación' },
      { field: 'esGenNotificaciones', header: 'Filtro GN' },
      { field: 'esGenCitaciones', header: 'Filtro GC' },
      { field: 'esCenNotificaciones', header: 'Filtro CN' },
      { field: 'esApp', header: 'Filtro APP' },
      { field: 'usuarioCreador', header: 'Fecha Creación' },
      { field: 'usuarioModificador', header: 'Última modificación' },
    ];

    this.menuActionsItems = [
      {
        label: 'Modificar',
        command: () => {
          this.onEdit();
        },
      },
    ];
  }

  getDataToAction(data: any) {
    this.valueToAction = data;
  }

  public onFilter(filtros: FiltroEstadoNotificacion): void {
    console.log("filtros:",filtros)
    this.currentFilters = filtros;
    this.query = { ...this.query, pages: 1, perPage: 10, filtros };
    this.buscarEstadosCeduNotificacion(filtros);
  }

  private buscarEstadosCeduNotificacion(filtros: FiltroEstadoNotificacion): void {
    if (!filtros) {
      console.error('Filtros no definidos');
      this.spinner.hide();
      return;
    }

    this.spinner.show();
    this.estadoNotificacion.buscarEstadosCeduNotificacion(filtros).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.bandeja = response;
        this.contadorEstados = this.bandeja.length;
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error al listar la bandeja:', err);
        this.spinner.hide();
      },
    });
  }

  public refrescarBandeja(): void {
    // let filtros: Filtros;
    const filtros: FiltroEstadoNotificacion = this.currentFilters || this.getFiltrosDefault();
    console.log('Filtros enviados al refrescar:', filtros);
    this.buscarEstadosCeduNotificacion(filtros);
  }

  private getFiltrosDefault(): FiltroEstadoNotificacion {
    return {
      codigo: null,
      filtroGn: null,
      filtroGc: null,
      filtroCn: null,
      filtroApp: null,
      dCreacionInicio: null,
      dCreacionFin: null,
      dModificacionInicio: null,
      dModificacionFin: null,
    };
  }

  private onEdit(): void {
    const data = { ...this.valueToAction };
    this.refModal = this.dialogService.open(
      AgregarEstadoDeNotificacionComponent,
      {
        width: '60%',
        showHeader: false,
        data: {
          tipo: 'editar',
          idEstadoCedula: data.idEstadoCedula,
          nombreEstado: data.esGeneral,
          esCenNotificaciones: data.esCenNotificaciones,
          esGenNotificaciones: data.esGenNotificaciones,
          esGenCitaciones: data.esGenCitaciones,
          esApp: data.esApp,
          flagEditarApp: data.flagEditarApp,
          observacion: data.observacion,
        },
      }
    );
    this.refModal.onClose.subscribe((data: any) => {
      if (data == '0') {
        this.refrescarBandeja();
      }
    });
  }

  exportarExcelBtn() {
    const filtros: FiltroEstadoNotificacion = this.query.filtros;
    console.log("exportarExcel filtros:",filtros)
    this.estadoNotificacion.exportarexcel(filtros).subscribe({
      next: (response) => {
        this.spinner.hide();
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'estado-notificacion.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al consultar datos")
      }
    });
  }
}
