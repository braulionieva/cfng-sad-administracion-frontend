import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DistritoFiscal,
  SedeBandeja,
} from '@interfaces/admin-sedes/admin-sedes';
import { AdminSedeService } from '@services/admin-sede/admin-sede.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Menu, MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { EditarSedeComponent } from '../../editar-sede/editar-sede.component';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { Auth2Service } from '@services/auth/auth2.service';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';

@Component({
  selector: 'app-tabla-sede',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    MenuModule,
    DynamicDialogModule,
  ],
  templateUrl: './tabla-sede.component.html',
  styleUrls: ['./tabla-sede.component.scss'],
  providers: [MessageService, DialogService],
})
export class TablaSedeComponent {
  @Output() clickedRefrescar = new EventEmitter();
  @Input() sedes: SedeBandeja[] = [];
  @Input() distritos: DistritoFiscal[] = [];
  @Input() totalElementos: number = 0;
  @Input() first = 0;
  @Output() firstChange: EventEmitter<number> = new EventEmitter();

  error: any;

  actionsitems: MenuItem[];

  @ViewChild(Menu) menu: Menu;

  public displayModalAgregar: boolean;
  public existeSede;

  public refModal: DynamicDialogRef;
  refModalMensaje: DynamicDialogRef;

  infoUsuario;

  constructor(
    public dialogService: DialogService,
    private sedeService: AdminSedeService,
    private userService: Auth2Service
  ) {}

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public onClicked(): void {
    this.clickedRefrescar.emit();
  }

  prepareAndShowMenu(event: MouseEvent, sede: SedeBandeja) {
    this.actionsitems = [
      {
        label: 'Editar',
        command: () => {
          this.onEdit(sede);
        },
      },
      {
        label: 'Eliminar',
        command: () => {
          this.onDelete(sede);
        },
      },
    ];
    this.menu.toggle(event);
  }

  onEdit(sede: SedeBandeja) {
    this.refModal = this.dialogService.open(EditarSedeComponent, {
      width: '768px',
      showHeader: false,
      data: {
        distritos: this.distritos,
        sede: sede,
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'LA OPERACION SE REALIZO SATISFACTORIAMENTE') {
          this.onClicked();
        }
      },
    });
  }

  onDelete(data: SedeBandeja) {
    const sedeToDelete = this.obtenerSede(data);

    this.confirmarEliminacionDeSede(sedeToDelete);

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.llamarServicioEliminarSede(sedeToDelete);
        }
      },
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.firstChange.emit(this.first);
  }

  public confirmarEliminacionDeSede(sede: SedeBandeja): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '828px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Eliminar sede',
        confirm: true,
        description: `A continuación, se procederá a eliminar la sede <strong>${sede.nombreSede}</strong>. ¿Está seguro de realizar esta acción?`,
        confirmButtonText: 'Aceptar',
      },
    });
  }

  public llamarServicioEliminarSede(sede: SedeBandeja): void {
    this.sedeService.eliminarSede(sede).subscribe({
      next: (response) => {
        if (response.existe === '1') {
          this.existeSede = true;
          this.openModalSedeConFiscalia();
        } else {
          this.existeSede = false;

          this.informarEliminacionDeSede(
            'success',
            'Sede eliminada',
            `La eliminación de la sede <strong>${sede.nombreSede}</strong> se realizó de forma exitosa.`,
            'Listo'
          );

          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.onClicked();
              }
            },
          });
        }
      },
      error: (err) => {
        console.error('Error al crear la sede:', err);

        let errorMessage =
          'Ocurrió un error al crear la sede. Por favor, inténtelo nuevamente.';

        // Si el error tiene una estructura conocida
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }

        // Mostrar modal con el mensaje de error
        this.dialogService.open(AlertModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'error',
            title: 'Error',
            description: errorMessage,
            confirmButtonText: 'Listo',
          },
        });
      },
    });
  }

  openModalSedeConFiscalia() {
    this.refModalMensaje = this.dialogService.open(ModalMensajeComponent, {
      width: '800px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning-red',
        title: 'NO SE PUEDE ELIMINAR',
        subTitle:
          'La Sede tiene Fiscalía(s) asociada(s), por favor validar los datos.',
        textButtonSecondary: 'Cerrar',
        showOnlySecondaryButton: false,
      },
    });
  }

  public informarEliminacionDeSede(
    icon: string,
    title: string,
    description: string,
    boton: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
        confirmButtonText: boton,
      },
    });
  }

  private obtenerSede(data: SedeBandeja): SedeBandeja {
    this.infoUsuario = this.userService.getUserInfo();
    const sedeSeleccionada = {
      codSede: data.codSede,
      nombreSede: data.nombreSede,
      usuarioModificador: this.infoUsuario?.usuario.usuario,
    };

    return sedeSeleccionada;
  }
}
