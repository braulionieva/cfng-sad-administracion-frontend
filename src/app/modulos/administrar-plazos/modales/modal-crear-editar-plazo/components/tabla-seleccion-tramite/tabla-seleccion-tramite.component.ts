import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TreeTableModule } from 'primeng/treetable';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { AdministrarPlazosService } from '@services/administrar-plazos/administrar-plazos.service';

@Component({
  selector: 'app-tabla-seleccion-tramite',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    CardModule,
    TreeTableModule,
    CheckboxModule,
    FormsModule,
  ],
  templateUrl: './tabla-seleccion-tramite.component.html',
  styleUrls: ['./tabla-seleccion-tramite.component.scss'],
})
export class TablaSeleccionTramiteComponent {
  @Input() accionPlazo: string;
  @Input() idConfiguraPlazo: string;
  @Output() envioTramitesSeleccionados = new EventEmitter<any>();
  public tramites: any;
  public detalleTramites: any;

  dataTable: any;

  tramitesSeleccionados: any[] = [];
  grupoSeleccionado: string | null = null; // Almacena el grupo seleccionado

  campoTramite: string;

  columnasDetalle: string[] = [
    'Código del trámite',
    'Carpeta/cuaderno',
    'Tipo especialidad',
    'Especialidad',
    'Jerarquía',
    'Tipo proceso',
    'Subtipo proceso',
    'Etapa',
    'Acto procesal relacionado',
    'Estado',
  ];

  public filasPorPagina: number = 10;
  public totalRegistros: number;
  public cargandoTabla: boolean;

  constructor(private administrarPlazosService: AdministrarPlazosService) {}

  public obtenerListaTramites(event?: any): void {
    if (!this.campoTramite) return;
    const datosSolicitud = {
      tramite: this.campoTramite,
      pagina: event?.pagina ? event.first : 1,
      registrosPorPagina: event?.registrosPorPagina ? event.rows : 10,
    };
    this.cargandoTabla = true;
    this.administrarPlazosService
      .obtenerListaTramites(datosSolicitud)
      .subscribe({
        next: (res: any) => {
          this.cargandoTabla = false;
          this.tramites = this.agrupacionTramites(res.registros);
          this.campoTramite = '';
          this.totalRegistros = res.totalElementos;
        },
        error: (err: string | any) => {
          this.cargandoTabla = false;
          console.error('Error en la solicitud [obtenerListaTramites]: ', err);
          this.campoTramite = '';
        },
      });
  }

  public obtenerListaDetallePlazosActosTramitesEtapas(event?): void {
    if (!this.idConfiguraPlazo) return;
    const datosSolicitud = {
      idConfiguraPlazo: this.idConfiguraPlazo,
      pagina: event?.pagina ? event.first : 1,
      registrosPorPagina: event?.registrosPorPagina ? event.rows : 10,
    };
    this.cargandoTabla = true;
    this.administrarPlazosService
      .obtenerListaDetallePlazosActosTramitesEtapas(datosSolicitud)
      .subscribe({
        next: (res: any) => {
          this.cargandoTabla = false;
          this.detalleTramites = res.registros;
          this.totalRegistros = res.totalElementos;
        },
        error: (err: string | any) => {
          this.cargandoTabla = false;
          console.error(
            'Error en la solicitud [obtenerListaDetallePlazosActosTramitesEtapas]: ',
            err
          );
        },
      });
  }

  agrupacionTramites(tramites) {
    const agrupado = tramites.reduce((acc, current) => {
      const { idTramite, tramite, ...rest } = current;

      let existente = acc.find((item) => item.idTramite === idTramite);

      if (!existente) {
        existente = {
          idTramite,
          tramite,
          numeracion: acc.length + 1,
          items: [],
        };
        acc.push(existente);
      }

      existente.items.push(rest);

      return acc;
    }, []);

    return agrupado;
  }

  isAllSelected(tramite): boolean {
    return tramite.items.every((item) =>
      this.tramitesSeleccionados.includes(item.codigoTramite)
    );
  }

  onCheckboxChange(codigoTramite: string, tramiteId: string, event: any) {
    if (event.checked) {
      this.tramitesSeleccionados.push(codigoTramite);
      this.grupoSeleccionado = tramiteId; // Establece el grupo seleccionado
    } else {
      this.tramitesSeleccionados = this.tramitesSeleccionados.filter(
        (codigo) => codigo !== codigoTramite
      );

      if (this.tramitesSeleccionados.length === 0) {
        this.grupoSeleccionado = null;
      }
    }

    // Emitir los datos al componente padre
    this.envioTramitesSeleccionados.emit({
      tramitesSeleccionados: this.tramitesSeleccionados,
      idTramite: this.grupoSeleccionado,
    });
  }

  onSelectAllChange(tramite, event: any) {
    if (event.checked) {
      tramite.items.forEach((item) => {
        if (!this.tramitesSeleccionados.includes(item.codigoTramite)) {
          this.tramitesSeleccionados.push(item.codigoTramite);
        }
      });
      this.grupoSeleccionado = tramite.idTramite;
    } else {
      tramite.items.forEach((item) => {
        this.tramitesSeleccionados = this.tramitesSeleccionados.filter(
          (codigo) => codigo !== item.codigoTramite
        );
      });
      this.grupoSeleccionado = null;
    }

    // Emitir los datos al componente padre
    this.envioTramitesSeleccionados.emit({
      tramitesSeleccionados: this.tramitesSeleccionados,
      idTramite: this.grupoSeleccionado,
    });
  }

  // Verifica si el grupo está bloqueado (no es el seleccionado)
  isGrupoDisabled(tramiteId: string): boolean {
    return (
      this.grupoSeleccionado !== null && this.grupoSeleccionado !== tramiteId
    );
  }
}
