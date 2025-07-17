import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AdministrarPlazosService } from '@services/administrar-plazos/administrar-plazos.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-modal-detalle-plazo-tramites',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './modal-detalle-plazo-tramites.component.html',
  styleUrls: [
    '../../administrar-plazos.component.scss',
    '../../../maestros/categorias/modals/modal-mensaje/modal-mensaje.component.scss',
  ],
  providers: [DialogService],
})
export class ModalDetallePlazoTramitesComponent implements OnInit {
  public plazo?: any;
  public tramites?: any;
  public nombreTramite: string = '';

  private readonly config: DynamicDialogConfig = inject(DynamicDialogConfig);

  @Output() cargarDatosPaginados = new EventEmitter();

  columnas: string[] = [
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

  constructor(private readonly administrarPlazosService: AdministrarPlazosService) { }

  ngOnInit(): void {
    this.establecerDatos();
  }

  private establecerDatos(): void {
    if (!this.config.data) return;
    if (!this.config.data.plazoDetail) return;
    this.plazo = this.config.data.plazoDetail;
  }

  public obtenerListaDetallePlazosActosTramitesEtapas(event?: any): void {
    const datosSolicitud = {
      idConfiguraPlazo: this.plazo.idConfiguraPlazo,
      pagina: event?.pagina ? event.first : 1,
      registrosPorPagina: event?.registrosPorPagina ? event.rows : 10,
    };

    this.cargandoTabla = true;
    this.administrarPlazosService
      .obtenerListaDetallePlazosActosTramitesEtapas(datosSolicitud)
      .subscribe({
        next: (res: any) => {
          this.cargandoTabla = false;
          if (!res) return;
          this.tramites = res.registros;
          this.totalRegistros = res.totalElementos;
        },
        error: (err) => {
          this.cargandoTabla = false;
          console.error(
            'Error en la solicitud [obtenerListaDetallePlazosActosTramitesEtapas]: ',
            err
          );
        },
      });
  }
}
