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
import { ICargo } from '../cargos.interface';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { CargosAccionesService } from '../cargos-acciones.service';

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
    'Código',
    'Nombre',
    'Descripción',
    'Jerarquía',
    'Categoría',
    'Creación',
    'Modificación',
    'Acciones',
  ];

  actionsitems: MenuItem[];

  @Input() dataTable: ICargo[] = [];
  @Input() totalRegistros: number;
  @Output() editCharger = new EventEmitter();
  @Output() cargarDatosPaginados = new EventEmitter();

  @Input() first = 0;
  @Output() firstChange: EventEmitter<number> = new EventEmitter();

  @ViewChild(Menu) menu: Menu;

  public filasPorPagina: number = 10;
  //public totalRegistros: number;

  constructor(private cargosAccionesService: CargosAccionesService) {}

  ngOnInit(): void {
    // This is intentional
  }

  prepareAndShowMenu(event: MouseEvent, cargo: ICargo) {
    this.actionsitems = [
      {
        label: 'Editar',
        command: () => {
          this.onEdit(cargo);
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.onDelete(cargo);
        },
      },
    ];

    this.menu.toggle(event);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.firstChange.emit(this.first);
  }

  onEdit(cargo: ICargo) {
    this.editCharger.emit(cargo);
  }

  onDelete(cargo: ICargo) {
    this.cargosAccionesService.notifyShowConfirmModal(
      'delete',
      cargo.nombre,
      cargo
    );
  }

  obtenerListaCargos(event: any) {
    this.cargarDatosPaginados.emit({
      pagina: event.first / event.rows + 1,
      registrosPorPagina: event.rows,
    });
  }
}
