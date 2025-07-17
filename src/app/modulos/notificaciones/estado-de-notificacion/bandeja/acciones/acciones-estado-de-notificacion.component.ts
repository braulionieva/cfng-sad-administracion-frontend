import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { AgregarEstadoDeNotificacionComponent } from '../../modal-agregar/agregar-estado-de-notificacion.component';

@Component({
  selector: 'app-acciones-estado-de-notificacion',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, ToastModule],
  templateUrl: './acciones-estado-de-notificacion.component.html',
  styleUrls: ['./acciones-estado-de-notificacion.component.scss'],
  providers: [MessageService, DialogService],
})
export class AccionesEstadoDeNotificacionComponent {
  @Input() totalElementos: number = 0;
  @Output() exportar = new EventEmitter<any>();
  @Output() refrescar = new EventEmitter();

  public refModal: DynamicDialogRef;

  constructor(public dialogService: DialogService) {}

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public exportarBandeja(): void {
    this.exportar.emit();
  }

  public mostrarModalAgregar(): void {
    this.refModal = this.dialogService.open(
      AgregarEstadoDeNotificacionComponent,
      {
        width: '60%',
        showHeader: false,
        data: {
          tipo: 'agregar',
        },
      }
    );
    this.refModal.onClose.subscribe((data: any) => {
      if (data == 'LA OPERACION SE REALIZO SATISFACTORIAMENTE') {
        this.refrescar.emit();
      }
    });
  }
}
