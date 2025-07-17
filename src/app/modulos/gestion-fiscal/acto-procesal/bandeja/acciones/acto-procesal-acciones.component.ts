import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { AgregarActoProcesalComponent } from '../../modal-agregar-editar/agregar-acto-procesal.component';

@Component({
  selector: 'app-acto-procesal-acciones',
  standalone: true,
  providers: [MessageService, DialogService],
  templateUrl: './acto-procesal-acciones.component.html',
  styleUrls: ['./acto-procesal-acciones.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ]
})
export class ActoProcesalAccionesComponent {
  @Input() totalElementos : number = 0;
  @Output() exportar = new EventEmitter<any>();
  @Output() refrescar = new EventEmitter();

  public displayModalAgregar : boolean;

  public refModal: DynamicDialogRef;

  constructor(
    public dialogService: DialogService
  ) {
    this.displayModalAgregar = false;
   }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public exportarBandeja(): void{

    this.exportar.emit();

  }

  public mostrarModalAgregar(): void {
    this.refModal = this.dialogService.open(
      AgregarActoProcesalComponent,
      {
        width: '60%',
        showHeader: false,
        data: {
          tipo: "agregar"
        }
      }
    );
    this.refModal.onClose.subscribe((data: any) => {
        //this.refrescar.emit();
     });
  }

}
