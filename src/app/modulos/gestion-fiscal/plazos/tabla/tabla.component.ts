import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PlazosDetencionService } from '../plazos-detencion.service';
import { IListPlazoDetencionFlagrancia } from '@interfaces/plazo-detencion-flagrancia/plazo-detencion-flagrancia';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  imports: [CommonModule, TableModule, ButtonModule, MenuModule],
})
export class TablaComponent implements OnInit {
  columnas: string[] = [
    'N°',
    'Categoría',
    'Especialidad',
    'Plazo det. (hrs)',
    'Plazo det. (dias)',
    'Creación',
    'Modificación',
    'Acciones',
  ];

  actionsitems: MenuItem[];
  @ViewChild(Menu) menu: Menu;

  @Input() dataTable: IListPlazoDetencionFlagrancia[] = [];
  @Output() editPlazo = new EventEmitter();

  public filasPorPagina: number = 10;
  @Output() cargarDatosPaginados = new EventEmitter();
  @Input() totalRegistros: number;

  @Input() first = 0;
  @Output() firstChange: EventEmitter<number> = new EventEmitter();

  constructor(private plazosDetencionService: PlazosDetencionService) {}

  ngOnInit(): void {
    // This is intentional
  }

  prepareAndShowMenu(event: MouseEvent, plazo) {
    this.actionsitems = [
      {
        label: 'Editar',
        command: () => {
          this.onEdit(plazo);
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.onDelete(plazo);
        },
      },
    ];

    this.menu.toggle(event);
  }

  onEdit(plazo) {
    this.editPlazo.emit(plazo);
  }

  onDelete(plazo) {
    this.plazosDetencionService.notifyShowConfirmModal(
      'delete',
      plazo.especialidad,
      plazo
    );
  }

  obtenerListaPlazos(event: any) {
    this.cargarDatosPaginados.emit({
      pagina: event.first / event.rows + 1,
      registrosPorPagina: event.rows,
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.firstChange.emit(this.first);
  }
}
