import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MessageService } from 'primeng/api';
import { ServidorBandeja } from '@interfaces/servidor/servidor';
import { ServidorService } from '@services/servidor/servidor.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
  DynamicDialogModule,
} from 'primeng/dynamicdialog';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    DynamicDialogModule,
  ],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  providers: [MessageService, DynamicDialogRef, DynamicDialogConfig],
})
export class TablaComponent {
  @Output() clicked = new EventEmitter();

  @Input() servidores: ServidorBandeja[] = [];

  error: any;

  public refModal: DynamicDialogRef;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private servidorService: ServidorService,
    private dialogService: DialogService
  ) {}

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public onClicked(): void {
    this.clicked.emit();
  }

  public eliminarServidor(data: ServidorBandeja) {
    const idGrupo: number = data.id;

    //llamo para confirmar si quiero eliminar o no
    this.confirmarEliminacionDeServidor('warning');

    // si confirma entonces paso a consumir el servicio
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.llamarServicio(idGrupo);
        }
      },
    });
  }

  public confirmarEliminacionDeServidor(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar',
        confirm: true,
        description: '¿Quiere usted eliminar el servidor?',
      },
    });
  }

  public llamarServicio(id: number): void {
    this.servidorService.eliminarServidor(id).subscribe({
      next: (response) => {
        this.informarEliminacionDeServidor('success');
        //luego paso a refrescar la bandeja

        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.onClicked();
            }
          },
        });
      },
      error: (err) => {
        this.error = err;
        console.error('Error al eliminar el servidor', err);
      },
    });
  }

  public informarEliminacionDeServidor(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar',
        description: 'Se elimino correctaente el servidor',
      },
    });
  }
}
