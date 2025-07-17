import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { AgregarTramitePorActoProcesalComponent } from '../../modal-agregar-editar/agregar-tramite-por-acto-procesal.component';

@Component({
  selector: 'app-acciones-tramite-por-acto-procesal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './acciones-tramite-por-acto-procesal.component.html',
  styleUrls: ['./acciones-tramite-por-acto-procesal.component.scss'],
  providers: [MessageService, DialogService],
})
export class AccionesTramitePorActoProcesalComponent {
  @Input() totalElementos: number = 0;
  @Output() exportar = new EventEmitter<any>();
  @Output() refrescar = new EventEmitter();

  public displayModalAgregar: boolean;

  public refModal: DynamicDialogRef;

  constructor(
    public dialogService: DialogService
  ) {
    this.displayModalAgregar = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public exportarBandeja(): void {

    this.exportar.emit();

  }

  public mostrarModalAgregar(): void {
    this.refModal = this.dialogService.open(
      AgregarTramitePorActoProcesalComponent,
      {
        width: '60%',
        showHeader: false,
        data: {
          tipo: "agregar"
        }
      }
    );
    this.refModal.onClose.subscribe((data: any) => {
      this.refrescar.emit();
    });
  }



}
