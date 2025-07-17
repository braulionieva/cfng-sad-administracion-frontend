import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ModalDetalleTablaComponent } from '@components/modal-detalle-tabla/modal-detalle-tabla.component';
import { TramiteBandejaResponse } from '@interfaces/admin-tramite-por-acto-procesal/tramite-por-acto-procesal';
import { AdminTramiteActoProcesalService } from '@services/admin-tramite-acto-procesal/admin-tramite-acto-procesal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {MenuItem, MessageService} from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialog,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import {MenuModule} from "primeng/menu";

@Component({
  selector: 'app-tabla-tramite-por-acto-procesal',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DynamicDialog, MenuModule],
  templateUrl: './tabla-tramite-por-acto-procesal.component.html',
  styleUrls: ['./tabla-tramite-por-acto-procesal.component.scss'],
  providers: [MessageService, DialogService],
})
export class TablaTramitePorActoProcesalComponent {
  @Input() loading: boolean = false;
  @Input() bandejaTramitePorActoProcesal: TramiteBandejaResponse[] = [];
  @Output() clickedRefrescar = new EventEmitter();

  actionItems: MenuItem[];
  tramiteSelect:TramiteBandejaResponse;
  error: any;

  public displayModalAgregar: boolean;
  public refModal: DynamicDialogRef;
  indexRow: number = 0;
  // detallesSeleccionado: ActoProcesalBandejaDetalleResponse[] = []
  totalTramitesActoProcesalSeleccionado: number = 0;
  // nombreActoProcesalSeleccionado: string = '';
  tramiteSeleccionado: string = '';

  constructor(
    public dialogService: DialogService,
    // private actoProcesalService: AdminActoProcesalService,
    private tramiteService: AdminTramiteActoProcesalService,
    private spinner: NgxSpinnerService
  ) {
    this.actionItems = [
      {
        label: 'Editar',
        command: () => {
          this.editar();
        },
      },
      {
        label: 'Ver Detalle',
        command: () => {
          this.onDetails();
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.onDelete();
        }
      },
    ];
  }

  public onClicked(): void {
    this.clickedRefrescar.emit();
  }

  itemSelected(activeItem: any) {
    this.tramiteSelect = activeItem;
  }

  //public editar(idActoProcesal: string): void {
  public editar(): void {
    // This is intentional
    console.log("this.tramiteSelect:",this.tramiteSelect)
    console.log("por implementar")
  }

  //public verMas(idActoProcesal: string): void {
  public verMas(): void {
    // This is intentional
    console.log("this.tramiteSelect:",this.tramiteSelect)
    console.log("por implementar")
  }

  //public onDetails(idTramite: string): void {
  public onDetails(): void {
    const idTramite = this.tramiteSelect.idTramite;
    this.refModal = this.dialogService.open(ModalDetalleTablaComponent, {
      width: '1100px',
      showHeader: false,
      data: {
        title: 'Detalle del Trámite',
        cols: [
          { field: 'codigo', header: 'Código' },
          { field: 'tramite', header: 'Trámite' },
          { field: 'usuarioCrea', header: 'Fechas de creación' },
          { field: 'usuarioModifica', header: 'Última Modificación' },
        ],
        rows: this.bandejaTramitePorActoProcesal.filter(
          (item) => item.idTramite == idTramite
        ),
        showPagination: true,
        rowsPerPage: 12,
      },
    });
  }

  //public onDelete(idTramite: string, tramite: string): void {
  public onDelete(): void {
    const tramite = this.tramiteSelect.tramite;
    //this.spinner.show();
    this.tramiteSeleccionado = tramite;
    console.log("por implementar")
  }

  private confirmarEliminacionDeTramite(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'ELIMINAR TRÁMITE',
        confirm: true,
        description:
          'A continuación, se procederá a <b>eliminar</b> el <b>trámite "' +
          this.tramiteSeleccionado +
          '”</b>.<br>¿Está seguro de realizar esta acción?',
      },
    });
  }

  private llamarServicioEliminarTramite(idTramite: string): void {
    this.spinner.show();
    const data = {
      idTramite: idTramite,
      usuarioDesactivador: '44836273',
    };

    this.tramiteService.eliminarTramite(data).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.informarEliminacionDeTramite(
          'success',
          'ELIMINACIÓN EXITOSA',
          'Se eliminó el trámite "' +
            this.tramiteSeleccionado +
            '", de forma exitosa.'
        );
        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.onClicked();
            }
          },
        });
      },
      error: (err) => {
        this.spinner.hide();
        this.error = err;
        console.error(
          'Error al eliminar el acto procesal "' +
            this.tramiteSeleccionado +
            '".',
          err
        );
      },
    });
  }

  public informarEliminacionDeTramite(
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
      },
    });
  }
}
