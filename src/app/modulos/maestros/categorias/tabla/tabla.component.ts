import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { Categorias } from '@interfaces/categorias/categorias';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AplicacionesCategoriasService } from '../aplicaciones-categorias.service';
import { Subscription } from 'rxjs';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  imports: [CommonModule, TableModule, TagModule, ButtonModule, MenuModule],
})
export class TablaComponent {
  columnas: string[] = [
    'N°',
    'Logo',
    'Código',
    'Nombre',
    'Nombre Plural',
    'Padre',
    'Palabras Clave',
    'Acciones',
  ];
  @Input() dataTable: Categorias[] = [];
  @Output() editCategory = new EventEmitter();
  @Output() editLogo = new EventEmitter();
  @Input() totalRegistros: number = 0;
  @Output() lazyLoad = new EventEmitter<{
    page: number;
    rows: number;
    first: number;
  }>();
  @Input() first: number = 0;

  public subscriptions: Subscription[] = [];
  public categoria: Categorias;
  actionsitems: MenuItem[];

  @ViewChild(Menu) menu: Menu;

  constructor(
    private readonly aplicacionesCategoriasService: AplicacionesCategoriasService
  ) {}

  prepareAndShowMenu(event: MouseEvent, categoria) {
    this.actionsitems = [
      {
        label: 'Logo',
        command: () => {
          this.showOpenModalLogo(categoria);
        },
      },
      {
        label: 'Editar',
        command: () => {
          this.onEdit(categoria);
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.onDelete(categoria);
        },
      },
    ];

    this.menu.toggle(event);
  }

  onEdit(categoria: Categorias) {
    this.editCategory.emit(categoria);
  }

  onDelete(categoria: Categorias) {
    this.aplicacionesCategoriasService.notifyShowConfirmModal(
      'delete',
      categoria?.nombre,
      categoria
    );
  }

  onLazyLoad(event: any) {
    const page = event.first / event.rows + 1;
    const rows = event.rows;
    const first = event.first;
    this.lazyLoad.emit({ page, rows, first });
  }

  showOpenModalLogo(categoria: Categorias) {
    this.editLogo.emit(categoria);
  }
}
