import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { EditarGrupoAleatorio } from './components/modal/editar-grupo-aleatorio/editar-grupo-aleatorio.component';

@Component({
  selector: 'app-denuncias-turno',
  standalone: true,
  templateUrl: './denuncias-turno.component.html',
  imports: [CommonModule, MenuModule, ButtonModule, DialogModule, TableModule],
  providers: [DialogService],
})
export class DenunciasTurnoComponent implements OnInit {
  itemsMenu: MenuItem[];

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.itemsMenu = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar Grupo Aleatorio',
            icon: 'pi pi-pencil',
            command: () => {
              this.showModalEditRandomGroup();
            },
          },
        ],
      },
    ];
  }

  showModalEditRandomGroup() {
    this.dialogService.open(EditarGrupoAleatorio, {
      header: 'Editar Grupo Aleatorio',
      width: '70%',
      contentStyle: { overflow: 'auto' },
    });
  }
}
