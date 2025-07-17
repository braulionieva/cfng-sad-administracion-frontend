import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DESCRIPCION_LARGA_TIPO_DISTRIBUCION } from '@constants/constantes';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tabla-distribucion-aleatoria',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    CmpLibModule
  ],
  templateUrl: './tabla-distribucion-aleatoria.component.html',
  styleUrls: ['./tabla-distribucion-aleatoria.component.scss']
})
export class TablaDistribucionAleatoriaComponent {
  @Input() cols: any[] = [];
  @Input() rows: any[] = [];
  @Input() showPagination: boolean = false;
  @Input() rowsPerPage: number = 10;
  @Input() showActions: boolean = false;
  @Input() menuActionsItems: MenuItem[] = [];
  @Input() menu2ActionsItems: MenuItem[] = [];
  @Output() setDataToAction = new EventEmitter();
  @Input() gruposAleatorios: any[] = [];
  @ViewChild('menu') menu: Menu;
  @ViewChild('menu2') menu2: Menu;

  public obtenerIcono = obtenerIcono;

  showMenu(event: MouseEvent, data: any) {
    this.setDataToAction.emit(data);

    if (data.tieneAdjuntos) {
      this.menu.toggle(event);
    }

    else {
      this.menu2.toggle(event);
    }
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  getValueRow(dataRow: string): any {
    return dataRow;
  }

  getBorderStyle(rowData: any): string {
    return rowData['inNotaPeriodo'] === '1' ? '#C1292E 5px solid' : 'none';
  }

  getVence(item: any): boolean {
    return item.inNotaPeriodo === '1';
  }

  labelDistribucion(tipoDist: any): string {
    return tipoDist == 'Aleatoria Despacho' ? DESCRIPCION_LARGA_TIPO_DISTRIBUCION.POR_DESPACHO
      : DESCRIPCION_LARGA_TIPO_DISTRIBUCION.POR_FISCAL
  }
}
