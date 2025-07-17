import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActoProcesalBandejaDetalleResponse } from '@interfaces/admin-acto-procesal/acto-procesal';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AdminActoProcesalService } from '@services/admin-acto-procesal/admin-acto-procesal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { FormularioConfiguracionActoProcesalComponent } from '../../modal-formulario-configuracion/formulario-configuracion-acto-procesal.component';

@Component({
  standalone: true,
  selector: 'app-tabla-modal-agregar-editar-acto-procesal',
  templateUrl: './tabla-modal-agregar-editar-acto-procesal.component.html',
  styleUrls: ['./tabla-modal-agregar-editar-acto-procesal.component.scss'],
  imports: [CommonModule, TableModule, ButtonModule],
})
export class TablaModalAgregarEditarActoProcesalComponent implements OnInit {
  @Input() showActions: boolean = false;
  @Input() idActoProcesal: string = '';
  @Input() nombreActoProcesal: string = '';

  detalleActoProcesal: ActoProcesalBandejaDetalleResponse[] = [];
  totalTramites: number = 0;
  public refModal: DynamicDialogRef;
  error: any;

  constructor(
    public dialogService: DialogService,
    private readonly actoProcesalService: AdminActoProcesalService,
    private readonly spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadBandejaDetalleActosProcesales(this.idActoProcesal);
  }

  private loadBandejaDetalleActosProcesales(idActoProcesal: string): void {
    this.spinner.show();
    this.actoProcesalService
      .listarDetalleActoProcesal(idActoProcesal)
      .subscribe({
        next: (response) => {
          console.log("response getActoProcesalXId",response )
          this.detalleActoProcesal = response;
          this.spinner.hide();
        },
        error: (err) => {
          this.error = err;

          this.spinner.hide();
        },
      });
  }

  onDelete(idConfiguracion: string): void {
    this.spinner.show();
    this.actoProcesalService
      .contarTramitePorConfiguracion(idConfiguracion)
      .subscribe({
        next: (response) => {
          this.totalTramites = response.totalTramites;
          this.spinner.hide();

          this.confirmarEliminacionDeConfiguración('question', idConfiguracion);
          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.llamarServicioEliminarConfiguracion(idConfiguracion);
              }
            },
          });
        },
      });
  }

  private confirmarEliminacionDeConfiguración(
    icon: string,
    idConfiguracion: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'ELIMINAR CONFIGURACIÓN',
        confirm: true,
        description:
          'A continuación, se procederá a eliminar la configuración con <b>código "' +
          idConfiguracion +
          '”</b> del Acto Procesal "' +
          this.nombreActoProcesal +
          '". Esta configuración cuenta con <b>' +
          this.totalTramites +
          ' trámites asociados</b>.<br>¿Está seguro de realizar esta acción?',
      },
    });
  }

  private llamarServicioEliminarConfiguracion(idConfiguracion: string): void {
    this.spinner.show();
    const data = {
      idConfiguracion: idConfiguracion,
      usuarioDesactivador: '44836273',
    };

    this.actoProcesalService.eliminarConfiguracion(data).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.informarEliminacionDeConfiguracion(
          'success',
          'ELIMINACIÓN EXITOSA',
          'Se eliminó de forma exitosa, la configuración con código ' +
            idConfiguracion +
            ' del Acto Procesal "' +
            this.nombreActoProcesal +
            '".'
        );
        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.loadBandejaDetalleActosProcesales(this.idActoProcesal);
            }
          },
        });
      },
      error: (err) => {
        this.spinner.hide();
        this.error = err;
        console.error(
          'Error al eliminar el acto procesal "' +
            this.nombreActoProcesal +
            '".',
          err
        );
      },
    });
  }

  public informarEliminacionDeConfiguracion(
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

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  mostrarModalConfiguracion(): void {
    this.refModal = this.dialogService.open(
      FormularioConfiguracionActoProcesalComponent,
      {
        width: '900px',
        showHeader: false,
        data: {
          idActoProcesal: this.idActoProcesal,
          nombreActoProcesal: this.nombreActoProcesal,
        },
      }
    );
    this.refModal.onClose.subscribe((response: any) => {
      console.log("response close:",response)
      if (response == 'LA OPERACION SE REALIZO SATISFACTORIAMENTE') {
        this.loadBandejaDetalleActosProcesales(this.idActoProcesal);
      }
    });
  }
}
