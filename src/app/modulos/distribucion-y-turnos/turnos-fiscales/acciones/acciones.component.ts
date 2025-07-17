import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImportarTurnoComponent } from '../components/importar-turnos-fiscalia/importar-turno.component';
import { EditarTurnoComponent } from '../components/editar-turno-fiscalia/editar-turno.component';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { RequestFiltrarTurno } from '@interfaces/administrar-turno/administrar-turno';

@Component({
  selector: 'app-acciones',
  standalone: true,
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    CmpLibModule
  ],
  providers: [MessageService, DialogService],
})
export class AccionesComponent {

  @Input() totalElementos: number = 0;
  @Input() vigente: string = null;//'0';

  @Output() exportar = new EventEmitter<any>();
  @Output() filtraVigente = new EventEmitter<string>();
  @Output() filter = new EventEmitter<RequestFiltrarTurno>();

  turnoSelect: any
  public refModal: DynamicDialogRef;
  public obtenerIcono = obtenerIcono;
  constructor(
    public readonly messageService: MessageService,
    private readonly dialogService: DialogService) {
  }

  buscarVigente(vigente: string) {
    if (vigente === 'vigente') {
      this.vigente = '1';
    } else if (vigente === 'novigente') {
      this.vigente = '2';
    } else {
      this.vigente = null;
    }
    this.filtraVigente.emit(this.vigente);
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
  
  public logo(name: string): string {
    return `assets/images/${name}.png`;
  }

  exportarTurnosExcel() {
    this.exportar.emit();
  }

  importarTurnos() {
    this.refModal = this.dialogService.open(
      ImportarTurnoComponent,
      {
        width: '900px',
        height: 'auto',
        contentStyle: { 'padding': '10px', 'border-radius': '10px', 'top': '100px', 'left': '100px' },
        showHeader: false,
        data: null
      });
    this.refModal.onClose.subscribe((data: any) => {

      this.filter.emit();

    });
  }

  agregarTurnosFiscalia() {
    this.refModal = this.dialogService.open(
      EditarTurnoComponent,
      {
        width: '1180px',
        height: 'auto',
        contentStyle: { 'padding': '10px', 'border-radius': '10px', 'top': '100px', 'left': '100px' },
        showHeader: false,
        data: {
          turnoSelected: null,
          editar: false
        }
      });
    this.refModal.onClose.subscribe((data: any) => {
      this.filter.emit();
    });
  }
}
