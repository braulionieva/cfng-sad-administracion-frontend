import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tabla-generica',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule
  ],
  templateUrl: './tabla-generica.component.html',
  styleUrls: ['./tabla-generica.component.scss']
})
export class TablaGenericaComponent {
  @Input() cols: any[] = [];
  @Input() rows: any[] = [];
  @Input() showPagination: boolean = false;
  @Input() rowsPerPage: number = 10;
  @Input() showActions: boolean = false;
  @Input() menuActionsItems: MenuItem[] = [];
  @Output() setDataToAction = new EventEmitter();

  @ViewChild(Menu) menu: Menu;

  constructor() {
    // This is intentional
  }

  showMenu(event: MouseEvent, data: any) {
    this.setDataToAction.emit(data);
    this.menu.toggle(event);
  }

  getValueRow(dataRow: string): any {
    return dataRow;
  }
}

