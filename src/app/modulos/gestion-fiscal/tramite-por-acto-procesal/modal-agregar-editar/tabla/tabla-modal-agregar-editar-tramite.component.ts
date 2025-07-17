import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import {
  ConfiguracionesResponse,
} from '@interfaces/admin-tramite-por-acto-procesal/tramite-por-acto-procesal';
import { AdminTramiteActoProcesalService } from '@services/admin-tramite-acto-procesal/admin-tramite-acto-procesal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ModalFormularioConfiguracionTramiteComponent } from '../../modal-formulario-configuracion/modal-formulario-configuracion-tramite.component';

@Component({
  selector: 'app-tabla-modal-agregar-editar-tramite',
  standalone: true,
  templateUrl: './tabla-modal-agregar-editar-tramite.component.html',
  styleUrls: ['./tabla-modal-agregar-editar-tramite.component.scss'],
  imports: [CommonModule, TableModule, ButtonModule],
})
export class TablaModalAgregarEditarTramiteComponent implements OnInit {
  @Input() showActions: boolean = false;
  @Input() idTramite: string = '';
  @Input() nombreTramite: string = '';

  configuraciones: ConfiguracionesResponse[] = [];
  totalTramites: number = 0;
  public refModal: DynamicDialogRef;
  error: any;

  constructor(
    public dialogService: DialogService,
    private tramiteService: AdminTramiteActoProcesalService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.loadConfiguraciones(this.idTramite);
  }

  private loadConfiguraciones(idTramite: string): void {
    this.spinner.show();
    this.tramiteService.listarConfiguracionesPorIdTramite(idTramite).subscribe({
      next: (response) => {
        this.configuraciones = response;
        this.spinner.hide();
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener el detalle de actos procesales:', err);
        this.spinner.hide();
      },
    });
  }

  onEdit(idConfiguracion: string): void { }

  onDelete(idConfiguracion: string): void {
    //this.spinner.show();

    this.confirmarEliminacionDeConfiguración('question', idConfiguracion);
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {

          this.llamarServicioEliminarConfiguracion(idConfiguracion);
        }
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
          'A continuación, se procederá a <b>eliminar</b> la configuración del <b>Trámite "' +
          this.nombreTramite +
          '"</b>.<br>¿Está seguro de realizar esta acción?',
      },
    });
  }

  private llamarServicioEliminarConfiguracion(idConfiguracion: string): void {
    this.spinner.show();
    const data = {
      idConfiguracion: idConfiguracion,
      usuarioDesactivador: '44836273',
    };

    this.tramiteService.eliminarConfiguracion(data).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.informarEliminacionDeConfiguracion(
          'success',
          'ELIMINACIÓN EXITOSA',
          'Se eliminó de forma exitosa, la configuración del Trámite "' +
          this.nombreTramite +
          '".'
        );
        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.loadConfiguraciones(this.idTramite);
            }
          },
        });
      },
      error: (err) => {
        this.spinner.hide();
        this.error = err;
        console.error(
          'Error al eliminar el acto procesal "' + this.nombreTramite + '".',
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
      ModalFormularioConfiguracionTramiteComponent,
      {
        width: '800px',
        showHeader: false,
        data: {
          idTramite: this.idTramite,
          nombreTRamite: this.nombreTramite,
        },
      }
    );
  }
}
