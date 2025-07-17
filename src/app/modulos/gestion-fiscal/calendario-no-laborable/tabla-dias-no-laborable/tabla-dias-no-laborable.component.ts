import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { CalendarioNoLaborableService } from '@services/calendario-no-laborable/calendario-no-laborable.service';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Menu, MenuModule } from 'primeng/menu';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { EditarDiaNoLaborableComponent } from '../components/editar-dia-no-laborable/editar-dia-no-laborable.component';
import { formatDateString } from '@utils/utils';
import { obtenerMesLetras } from '@utils/date';

@Component({
  selector: 'app-tabla-dias-no-laborable',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    DropdownModule,
    RadioButtonModule,
    CmpLibModule,
  ],
  templateUrl: './tabla-dias-no-laborable.component.html',
  styleUrls: ['./tabla-dias-no-laborable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaDiasNoLaborableComponent {
  @Output() clicked = new EventEmitter();
  @Output() deleted = new EventEmitter<any>();
  @Output() setDataToAction = new EventEmitter();

  @Input() calendarioNoLaborable: any[] = [];

  @ViewChild(Menu) menu: Menu;

  error: any;
  valueToAction: any;
  public obtenerIcono = obtenerIcono;
  public refModal: DynamicDialogRef;

  constructor(
    public dialogService: DialogService,
    public calendarioNoLaborableService: CalendarioNoLaborableService
  ) {}

  public trackByCalendarioNoLaborable(
    index: number,
    item: any
  ): number | string {
    return item.idCalendario; // o la propiedad única que tengas
  }

  quitarDiaNoLaborable(idx: any, item: any): any {
    this.valueToAction = item;
    this.confirmarEliminacionRegistro('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          // this.calendarioNoLaborable.splice(idx, 1);
          this.calendarioNoLaborable = [
            ...this.calendarioNoLaborable.slice(0, idx),
            ...this.calendarioNoLaborable.slice(idx + 1),
          ];

          this.deleted.emit(item);
        }
      },
    });
  }

  private confirmarEliminacionRegistro(icon: string): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'ELIMINAR DÍA FESTIVO/NO LABORABLE',
        confirm: true,
        description:
          '<p>A continuación, se procederá a <b>eliminar los datos</b> del(los) día(s) ' +
          formatDateString(this.valueToAction.fecha) +
          ': ' +
          this.valueToAction.nombre +
          '.</p><p><b>¿Esta eliminación afectará a todos los plazos que sean registrados a partir de la fecha, pero NO a los plazos registrados anteriormente</b> ¿Está seguro de realizar esta acción?</p>',
        confirmButtonText: 'Aceptar',
      },
    });
  }

  public logo(name: string): string {
    return `assets/images/${name}.png`;
  }

  onClicked() {
    this.clicked.emit();
  }

  editarDiaNoLaborable(diaNoLaborable: any) {
    this.refModal = this.dialogService.open(EditarDiaNoLaborableComponent, {
      width: '70%',
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '10px' },
      data: { editar: true, fechaNoLaborable: diaNoLaborable },
    });
  }

  formatDateString(value: any): string {
    return formatDateString(value);
  }
  obtenerMesLetras(value: any): string {
    if (!value) return '';

    let dateValue = new Date(value);

    return obtenerMesLetras(dateValue);
  }
}
