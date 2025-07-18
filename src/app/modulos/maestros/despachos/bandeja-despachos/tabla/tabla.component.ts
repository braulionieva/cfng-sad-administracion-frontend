import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { Despacho, DespachoBandejaResponse } from '@interfaces/admin-despacho/admin-despacho';
import { AdminDespachoService } from '@services/admin-despacho/admin-despacho.service';
import { DialogService, DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import {
  EditarDespachoModalComponent
} from "@modulos/maestros/despachos/editar-despacho-modal/editar-despacho-modal.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla',
  standalone: true,
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  imports: [
    TableModule,
    ButtonModule,
    MenuModule,
    //EditarDespachoComponent,
    DynamicDialogModule,
    CommonModule
  ],
  providers: [MessageService, DynamicDialogRef, DynamicDialogConfig],
})
export class TablaComponent {

  //@ViewChild(EditarDespachoComponent) childEditarDespachoComponent: EditarDespachoComponent;
  @Input() despachos: DespachoBandejaResponse[] = [];
  @Output() refrescarBandeja = new EventEmitter();
  @Input() totalElementos: number = 0;
  @Input() first = 0;
  @Output() firstChange: EventEmitter<number> = new EventEmitter();
  //dataModalDespacho: DataModalDespacho;
  actionItems: MenuItem[];
  selectedDespacho: Despacho;
  error: any;

  public refModal: DynamicDialogRef;

  constructor(
    private readonly despachosService: AdminDespachoService,
    private readonly dialogService: DialogService,
  ) {

    this.actionItems = [
      {
        label: 'Editar',
        command: () => {
          this.onOpenEditarDespachoDialog();
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.eliminarDespacho();
        }
      },
    ];
  }

  refrescarDespachos() {
    this.refrescarBandeja.emit();

  }

  onPageChange(event: any) {
    this.first = event.first;
    this.firstChange.emit(this.first);
  }

  llenarvariable(despacho: Despacho) {
    this.selectedDespacho = despacho;
  }

  onOpenEditarDespachoDialog() {
    //aqui hay que obtener el despacho para editarlo
    this.obtenerDespacho(this.selectedDespacho);
  }

  obtenerDespacho(despacho: Despacho) {
    this.despachosService.obtenerDespacho(despacho).subscribe(
      {
        next: (response: Despacho) => {
          this.openEditarDespacho(response);
        },
        error: (err) => {

          this.error = err;
          console.error('Error al obtener el desapcho seleccionado', err);
        }

      }
    );

  }

  openEditarDespacho(despacho: Despacho) {
    this.refModal = this.dialogService.open(EditarDespachoModalComponent, {
      width: '800px',
      showHeader: false,
      contentStyle: { overflow: 'auto' },
      data: despacho,
    });

    this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.refrescarDespachos();
        }
      }
    });
  }

  eliminarDespacho() {

    const codigoDespacho = this.selectedDespacho.codigo;

    //llamo para confirmar si quiero eliminar o no
    this.confirmarEliminacionDeDespacho('question');

    // si confirma entonces paso a consumir el servicio
    this.refModal.onClose.subscribe({
      next: resp => {
        if (resp === 'confirm') {
          this.llamarServicioEliminar(codigoDespacho);

        }
      }
    });
  }

  confirmarEliminacionDeDespacho(icon: string) {

    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        showHeader: false,
        data: {
          icon: icon,
          title: 'Eliminar Despacho',
          confirm: true,
          //A continuación, se procederá a eliminar el despacho Primer despacho de la Primera Fiscalía Provincial Penal de Lima-Jesús María-Breña-Rímac. ¿Está seguro de realizar esta acción?
          description: `A continuación, se procederá a eliminar el despacho <b>${this.selectedDespacho.nombre}</b> ` +
            `de la <b>${this.selectedDespacho.nombreDependencia}</b>. ¿Está seguro de realizar esta acción?`,
          confirmButtonText: 'Aceptar'
        }
      }
    )

  }

  llamarServicioEliminar(codigoDespacho: string) {

    this.despachosService.eliminarDespacho(codigoDespacho).subscribe(
      {
        next: (response) => {
          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Despacho eliminado',
              description: `La eliminación del despacho <b>${this.selectedDespacho.nombre}</b> de la <b>${this.selectedDespacho.nombreDependencia}</b> se realizó de forma exitosa.`,
              confirmButtonText: 'Listo'
            },
          });

          this.refModal.onClose.subscribe({
            next: resp => {
              if (resp === 'confirm') {
                //actualizar bandeja despachos
                this.refrescarDespachos();
              }
            }
          });

        },
        error: (err) => {

          this.error = err;
          console.error('Error al eliminar el grupo', err);
        }

      }
    );
  }
}
