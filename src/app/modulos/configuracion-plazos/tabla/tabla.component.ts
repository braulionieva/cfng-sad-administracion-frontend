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
import { IPlazo, Plazo } from '../configuracion-plazos.interface';
import { ConfiguracionPlazosService } from '../configuracion-plazos.service';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';

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
    'Configurado por',
    'Distrito Fiscal',
    'Tipo Especialidad',
    'Especialidad',
    'Plazo para evaluar (días)',
    'Plazo para mostrar alerta (días)',
    'Creación',
    'Modificación',
    'Acciones',
  ];

  actionsitems: MenuItem[];

  @Input() dataTable: Plazo[] = []; //IPlazo[] = [];
  @Output() editPlazo = new EventEmitter();

  @ViewChild(Menu) menu: Menu;

  constructor(private configuracionPlazosService: ConfiguracionPlazosService) {}

  ngOnInit(): void {
    // This is intentional
  }

  prepareAndShowMenu(event: MouseEvent, plazo: IPlazo) {
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

  onEdit(plazo: IPlazo) {
    this.editPlazo.emit(plazo);
  }

  onDelete(plazo) {
    this.configuracionPlazosService.notifyShowConfirmModal('delete', plazo);
  }

  // deadlineDays(days: number, type: number): string {
  //   if (type === 1) {
  //     return days === 1 ? `${days} día hábil` : `${days} días hábiles`;
  //   } else if (type === 2) {
  //     return days === 1 ? `${days} día calendario` : `${days} días calendario`;
  //   } else return '';
  // }
}
