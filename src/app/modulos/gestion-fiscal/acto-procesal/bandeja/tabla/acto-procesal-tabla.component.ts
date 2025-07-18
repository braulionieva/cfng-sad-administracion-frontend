import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ActoProcesalBandejaDetalleResponse,
} from '@interfaces/admin-acto-procesal/acto-procesal';
import { AdminActoProcesalService } from '@services/admin-acto-procesal/admin-acto-procesal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { AgregarActoProcesalComponent } from '../../modal-agregar-editar/agregar-acto-procesal.component';
import { ModalDetalleTablaComponent } from '@components/modal-detalle-tabla/modal-detalle-tabla.component';

@Component({
  selector: 'app-acto-procesal-tabla',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DynamicDialogModule],
  templateUrl: './acto-procesal-tabla.component.html',
  styleUrls: ['./acto-procesal-tabla.component.scss'],
  providers: [MessageService, DialogService],
})
export class ActoProcesalTablaComponent {
  @Input() loading: boolean = false;
  @Input() detalleActoProcesal: ActoProcesalBandejaDetalleResponse[] = [];
  @Input() totalElementos: number = 0;
  @Output() clickedRefrescar = new EventEmitter();

  error: any;

  public displayModalAgregar: boolean;
  public refModal: DynamicDialogRef;
  indexRow: number = 0;
  // detallesSeleccionado: ActoProcesalBandejaDetalleResponse[] = []
  totalTramitesActoProcesalSeleccionado: number = 0;
  nombreActoProcesalSeleccionado: string = '';

  constructor(
    public dialogService: DialogService,
    private readonly actoProcesalService: AdminActoProcesalService,
    private readonly  spinner: NgxSpinnerService
  ) {}

  public onClicked(): void {
    this.clickedRefrescar.emit();
  }

  public editar(idActoProcesal: string): void {
    this.refModal = this.dialogService.open(AgregarActoProcesalComponent, {
      width: '60%',
      showHeader: false,
      data: {
        tipo: 'editar',
      },
    });
    this.refModal.onClose.subscribe((data: any) => {
      /**if( data == 'LA OPERACION SE REALIZO SATISFACTORIAMENTE') { **/
      this.onClicked();
      /** }**/
    });
  }

  // public verMas(idActoProcesal: string): void {
  //
  //   this.spinner.show();
  //   this.actoProcesalService
  //     .buscarActosProcesales(idActoProcesal)
  //     .subscribe({
  //       next: (response) => {
  //         this.detalleActoProcesal = response;
  //         this.spinner.hide();
  //       },
  //     });
  // }

  onDetails(idActoProcesal: string): void {
    this.refModal = this.dialogService.open(
      // DetalleActoProcesalComponent,
      ModalDetalleTablaComponent,
      {
        width: '1100px',
        showHeader: false,
        data: {
          title: 'Detalles del Acto Procesal',
          cols: [
            { field: 'codigo', header: 'Código' },
            { field: 'actoProcesal', header: 'Acto procesal' },
            { field: 'usuarioCrea', header: 'Fechas de creación' },
            { field: 'usuarioModifica', header: 'Última Modificación' },
          ],
          rows: this.detalleActoProcesal.filter(
            (item) => item.idActoProcesal == idActoProcesal
          ),
        },
      }
    );
  }

  onDelete(idActoProcesal: string, actopProcesal: string): void {
    this.spinner.show();
    this.nombreActoProcesalSeleccionado = actopProcesal;
    this.actoProcesalService
      .contarTramitePorActoProcesal(idActoProcesal)
      .subscribe({
        next: (response) => {
          this.totalTramitesActoProcesalSeleccionado = response.totalTramites;
          this.spinner.hide();

          this.confirmarEliminacionDeActoProcesal('question');
          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.llamarServicioEliminarActoProcesal(idActoProcesal);
              }
            },
          });
        },
      });
  }

  private confirmarEliminacionDeActoProcesal(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'ELIMINAR ACTO PROCESAL',
        confirm: true,
        description:
          'A continuación, se procederá a eliminar el <b>Acto Procesal "' +
          this.nombreActoProcesalSeleccionado +
          '”</b>. Este acto procesal cuenta con <b>' +
          this.totalTramitesActoProcesalSeleccionado +
          ' trámites asociados</b>.<br>¿Está seguro de realizar esta acción?',
      },
    });
  }

  private llamarServicioEliminarActoProcesal(idActoProcesal: string): void {
    this.spinner.show();
    const data = {
      idActoProcesal: idActoProcesal,
      usuarioDesactivador: '44836273',
    };

    this.actoProcesalService.eliminarActoProcesal(data).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.informarEliminacionDeActoProcesal(
          'success',
          'ELIMINACIÓN EXITOSA',
          'Se eliminó de forma exitosa, el Acto Procesal "' +
            this.nombreActoProcesalSeleccionado +
            '".'
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
            this.nombreActoProcesalSeleccionado +
            '".',
          err
        );
      },
    });
  }

  public informarEliminacionDeActoProcesal(
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
