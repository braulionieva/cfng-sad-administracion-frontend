import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TablaModalAgregarEditarActoProcesalComponent } from '../tabla/tabla-modal-agregar-editar-acto-procesal.component';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-agregar-editar-acto-procesal',
  standalone: true,
  templateUrl: './agregar-editar-acto-procesal.component.html',
  styleUrls: ['./agregar-editar-acto-procesal.component.scss'],
  imports: [
    TableModule,
    TablaModalAgregarEditarActoProcesalComponent,
    ButtonModule
  ]
})
export class AgregarEditarActoProcesalComponent {
  @Input() idActoProcesalSelected: string = '';
  @Input() nombreActoProcesalSelected: string = '';
  @Input() showActions: boolean = false;
  @Output() anterior = new EventEmitter();

  // detalleActoProcesal: ActoProcesalBandejaDetalleResponse[] = [];
  loading: boolean = false;
  error: any;

  constructor(
    public ref: DynamicDialogRef,

  ) { }


  previusPage(): void {
    this.anterior.emit();
  }

  public close(): void {
    this.ref.close();
  }

}
