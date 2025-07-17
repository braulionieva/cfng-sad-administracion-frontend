import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { CentralesNotificacionesService } from '@modulos/notificaciones/centrales-notificacion/centrales-notificacion.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  imports: [CommonModule, TableModule, ButtonModule, CmpLibModule, MenuModule],
})
export class TablaComponent {
  columnas: string[] = [
    'N°',
    'Código',
    'Nombre',
    'Distrito Fiscal',
    'Creación',
    'Última Modificación',
    'Acciones',
  ];
  @Input() dataTable = [];
  @Input() totalRegistros: number;
  @Output() editCentral = new EventEmitter();
  @Output() cargarDatosPaginados = new EventEmitter();

  @ViewChild('tablaRef') tablaRef: Table;
  @ViewChild(Menu) menu: Menu;

  @Input() first = 0;
  @Output() firstChange: EventEmitter<number> = new EventEmitter();

  public obtenerIcono = obtenerIcono;
  private readonly centralesNotificaciones: CentralesNotificacionesService =
    inject(CentralesNotificacionesService);
  public filasPorPagina: number = 10;
  actionsitems: MenuItem[];

  prepareAndShowMenu(event: MouseEvent, central) {
    this.actionsitems = [
      {
        label: 'Editar',
        command: () => {
          this.onEdit(central);
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.onDelete(central);
        },
      },
    ];

    this.menu.toggle(event);
  }

  obtenerListaCentrales(event: any) {
    this.cargarDatosPaginados.emit({
      pagina: event.first / event.rows + 1,
      registrosPorPagina: event.rowws,
    });
  }

  onEdit(central) {
    this.editCentral.emit(central);
  }

  reiniciarTabla() {
    if (this.tablaRef) {
      this.tablaRef.reset();
    }
  }

  onDelete(central) {
    this.centralesNotificaciones.notifyShowConfirmModal('delete', central);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.firstChange.emit(this.first);
  }

  public logo(name: string): string {
    return `assets/images/${name}.png`;
  }
}
