import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { Table, TableModule } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ModalDetallePlazoTramitesComponent } from '../modales/modal-detalle-plazo-tramites/modal-detalle-plazo-tramites.component';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, MenuModule],
  templateUrl: './tabla.component.html',
  styleUrls: ['../administrar-plazos.component.scss'],
  providers: [DynamicDialogConfig, DialogService, MessageService],
})
export class TablaComponent {
  public refModal: DynamicDialogRef;
  columnas: string[] = [
    'N°',
    'Tipo',
    'Distrito Fiscal',
    'Tipo Especialidad',
    'Especialidad',
    'Pre-etapa/etapa',
    'Código del trámite',
    'Trámite',
    'Plazo',
    '¿Días calendario?',
    '¿Es restrictivo?',
    'Acciones',
  ];

  actionsitems: MenuItem[];

  @Input() dataTable: any[];
  @Input() totalRegistros: number;
  @Output() eventoEditar = new EventEmitter();
  @Output() eventoEliminar = new EventEmitter();
  @Output() cargarDatosPaginados = new EventEmitter();

  @ViewChild(Menu) menu: Menu;
  @ViewChild('tablaRef') tablaRef: Table;

  @Input() first = 0;
  @Output() firstChange: EventEmitter<number> = new EventEmitter();

  public filasPorPagina: number = 10;

  constructor(private readonly dialogService: DialogService) { }

  onPageChange(event: any) {
    this.first = event.first;
    this.firstChange.emit(this.first);
  }

  public mostrarMenuAcciones(event: MouseEvent, plazo: any) {
    this.actionsitems = [
      {
        label: 'Editar Plazo',
       
        command: () => {
          this.accionEditar(plazo);
        },
      },
      {
        label: 'Eliminar plazo',
        
        command: () => {
          this.accionEliminar(plazo);
        },
      },
    ];

    this.menu.toggle(event);
  }

  public accionEditar(plazo: any) {
    if (!plazo) return;
    this.eventoEditar.emit(plazo);
  }

  /**
  // const descripcionModal = {
  //   tipoDePlazo: tipoDePlazo,
  //   nombrePreEtapa_Etapa: preEtapaEtapaFiltrado
  //     ? preEtapaEtapaFiltrado[0].Descripcion
  //     : null,
  // }; **/

  //refactorizado
  public accionEliminar(data: any) {
    if (!data) return;

    const descripcionModal: any = {};

    if (data.idPreEtapa) {
      descripcionModal.tipoDePlazo = 'pre-etapa';
    } else if (data.idEtapa) {
      descripcionModal.tipoDePlazo = 'etapa';
    } else if (data.idTramite) {
      descripcionModal.tipoDePlazo = 'tramite';
    } else {
      descripcionModal.tipoDePlazo = '';
    }

    descripcionModal.periodoDePlazo = data.plazoUnidad;

    if (data.preEtapa) {
      descripcionModal.nombrePreEtapa_Etapa = data.preEtapa;
    } else if (data.etapa) {
      descripcionModal.nombrePreEtapa_Etapa = data.etapa;
    } else {
      descripcionModal.nombrePreEtapa_Etapa = null;
    }

    descripcionModal.nombreTramite = data.tramite;
    descripcionModal.codigoTramite = data.idConfiguraPlazo;

    this.eventoEliminar.emit({ accion: 'eliminar', data, descripcionModal });
  }
  //

  /**public accionEliminar(data: any) {
    if (!data) return;
    const descripcionModal = {
      tipoDePlazo: data?.idPreEtapa
        ? 'pre-etapa'
        : data?.idEtapa
        ? 'etapa'
        : data?.idTramite
        ? 'tramite'
        : '',
      periodoDePlazo: data?.plazoUnidad,
      nombrePreEtapa_Etapa: data?.preEtapa
        ? data?.preEtapa
        : data?.etapa
        ? data?.etapa
        : null,
      nombreTramite: data?.tramite,
      codigoTramite: data?.idConfiguraPlazo,
    };
    this.eventoEliminar.emit({ accion: 'eliminar', data, descripcionModal });
  }**/

  public obtenerListaPlazos(event: any) {
    this.cargarDatosPaginados.emit({
      pagina: event.first / event.rows + 1,
      registrosPorPagina: event.rows,
    });
  }

  public reiniciarTabla(): void {
    if (this.tablaRef) {
      this.tablaRef.reset();
    }
  }

  public abrirModalDetallePlazoTramites(plazo) {
    this.refModal = this.dialogService.open(
      ModalDetallePlazoTramitesComponent,
      {
        header: 'Ver Detalle',
        width: '80vw',
        contentStyle: { overflow: 'auto' },
        style: { minWidth: '768px' },
        data: {
          plazoDetail: plazo || null,
        },
      }
    );
  }
}
