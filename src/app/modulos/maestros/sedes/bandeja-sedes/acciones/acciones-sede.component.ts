import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { AgregarSedeComponent } from '../../agregar-sede/agregar-sede.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DistritoFiscal } from '@interfaces/admin-sedes/admin-sedes';

@Component({
  selector: 'app-acciones-sede',
  standalone: true,
  providers: [MessageService, DialogService],
  templateUrl: './acciones-sede.component.html',
  styleUrls: ['./acciones-sede.component.scss'],
  imports: [CommonModule, ButtonModule, InputTextModule, ToastModule],
})
export class AccionesSedeComponent {
  @Input() distritos: DistritoFiscal[] = [];
  @Output() exportar = new EventEmitter<any>();
  @Output() refrescar = new EventEmitter();
  @Input() puedeExportar: boolean = false; // Propiedad de entrada para controlar el botón

  public displayModalAgregar: boolean;

  public refModal: DynamicDialogRef;

  constructor(public dialogService: DialogService) {
    this.displayModalAgregar = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public exportarBandeja(): void {
    this.exportar.emit();
  }

  public mostrarModalAgregar(): void {
    this.refModal = this.dialogService.open(AgregarSedeComponent, {
      width: '768px',
      showHeader: false,
      data: {
        distritos: this.distritos,
      },
    });

    this.refModal.onClose.subscribe((data: any) => {
      if (data == 'LA OPERACION SE REALIZO SATISFACTORIAMENTE') {
        this.refrescar.emit();
      }
    });
  }
}
