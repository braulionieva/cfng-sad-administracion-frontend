import { Component } from '@angular/core';
import { TablaGenericaComponent } from '@components/tabla-generica/tabla-generica.component';
import { MenuItem, MessageService } from 'primeng/api';
import { AccionesComponent } from './acciones/acciones.component';
import { FiltrosComponent } from './filtros/filtros.component';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { AdminReglaService } from '@services/admin-regla-conducta/admin-regla.service';
import { AgregarEditarReglaComponent } from '../agregar-editar-regla/agregar-editar-regla.component';
import { finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bandeja-regla',
  standalone: true,
  templateUrl: './bandeja-regla.component.html',
  styleUrls: ['./bandeja-regla.component.scss'],
  imports: [
    TablaGenericaComponent,
    AccionesComponent,
    FiltrosComponent,
    DynamicDialogModule,
    AgregarEditarReglaComponent,
  ],
  providers: [
    DialogService,
    MessageService,
    DynamicDialogRef,
    DynamicDialogConfig,
    DatePipe,
  ],
})
export class BandejaReglaComponent {
  cols: any[] = [];
  /*reglasConducta: any[] = [
    {idRegla: 42, secuencia : 1, nomRegla: "Lorem ipsum dolor sit amet.", deCreacion: "Juan Perez Cabanillas<br>08/09/2023 10:43", deModificacion: "Juan Perez Cabanillas<br>08/09/2023 10:43"},
    {idRegla: 43, secuencia : 2, nomRegla: "mi descripcion 2", deCreacion: "Juan Perez Cabanillas<br>08/09/2023 10:43", deModificacion: "Juan Perez Cabanillas<br>08/09/2023 10:43" }
  ];*/
  reglasConducta: any[] = [];
  menuActionsItems: MenuItem[] = [];
  showActionsButton: boolean = true;
  ReglaSelected: any;
  totalReglas: number = 0;
  query: any;
  error: any;
  editarReglaDialog: {
    isVisible: boolean;
    isEdit: boolean;
    titulo: string;
    regla: any;
  };

  public refModal: DynamicDialogRef;

  constructor(
    private reglaService: AdminReglaService,
    private spinner: NgxSpinnerService,
    private dialogService: DialogService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private datePipe: DatePipe
  ) {
    this.editarReglaDialog = {
      isVisible: false,
      isEdit: true,
      titulo: 'Editar Regla de conducta',
      regla: {},
    };
    this.setCols();
    this.setMenuActionItems();
  }

  setCols(): void {
    this.cols = [
      { field: 'secuencia', header: 'Nº' },
      { field: 'nomRegla', header: 'Descripción' },
      { field: 'deCreacion', header: 'Creación' },
      { field: 'deModificacion', header: 'Modificacion' },
    ];
  }

  setMenuActionItems(): void {
    this.menuActionsItems = [
      {
        label: 'Editar',
        // icon: 'pi pi-pencil',
        command: () => {
          this.onOpenEditarReglaDialog(this.ReglaSelected);
        },
      },
      {
        label: 'Eliminar',
        // icon: 'pi pi-trash',
        command: () => {
          this.eliminarRegla(this.ReglaSelected);
        },
      },
    ];
  }

  getDataToAction(data: any) {
    this.ReglaSelected = data;
  }

  onFilter(filtros: any) {
    this.query = { ...this.query, pages: 10, perPage: 1, filtros };
    this.buscarReglas();
  }

  refrescarBandeja() {
    this.buscarReglas();
  }

  buscarReglas() {
    this.reglaService.obtenerBandejaReglas(this.query).subscribe({
      next: (response) => {
        this.reglasConducta = response.registros.map((reglas, index) => ({
          ...reglas,
          secuencia: index + 1,
          deCreacion: reglas.deUsuarioCreacion
            ?.concat('<br>')
            .concat(
              this.datePipe.transform(reglas.fechaCreacion, 'dd/MM/yyyy HH:mm')
            ),
          deModificacion: reglas.deUsuarioModificacion
            ?.concat('<br>')
            .concat(
              this.datePipe.transform(
                reglas.fechaModificacion,
                'dd/MM/yyyy HH:mm'
              )
                ? this.datePipe.transform(
                    reglas.fechaModificacion,
                    'dd/MM/yyyy HH:mm'
                  )
                : ''
            ),
        }));

        this.totalReglas = response.totalElementos;
      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  eliminarRegla(regla: any) {
    const idRegla = regla.idRegla;

    //llamo para confirmar si quiero eliminar o no
    this.confirmarEliminacionDeRegla('question');

    // si confirma entonces paso a consumir el servicio
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.llamarServicioEliminar(idRegla);
        }
      },
    });
  }

  llamarServicioEliminar(idRegla: number) {
    this.reglaService.eliminarReglaConducta(idRegla).subscribe({
      next: (response) => {
        this.refrescarBandeja();
        this.informarEliminacionDeRegla('success');
        //luego paso a refrescar la bandeja

        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              //actualizar bandeja reglas
              //this.refrescarBandeja();
            }
          },
        });
      },
      error: (err) => {
        this.error = err;
        console.error('Error al eliminar la regla de conducta', err);
      },
    });
  }

  confirmarEliminacionDeRegla(icon: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar regla de conducta',
        confirm: true,
        description: '¿Está seguro de eliminar la regla de conducta: <b>'
          .concat(this.ReglaSelected.nomRegla)
          .concat('</b>?'),
        confirmButtonText: 'Eliminar',
      },
    });
  }

  informarEliminacionDeRegla(icon: string) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Regla de conducta Eliminada',
        description: 'Se eliminó correctamente la regla de conducta: <b>'
          .concat(this.ReglaSelected.nomRegla)
          .concat('<b>'),
        confirmButtonText: 'Listo',
      },
    });
  }

  onOpenEditarReglaDialog(reglaSelected: any) {
    this.editarReglaDialog.regla = {
      ...reglaSelected,
    };
    this.editarReglaDialog.isEdit = true;
    this.editarReglaDialog.titulo = 'Editar Regla de conducta';
    this.editarReglaDialog.isVisible = true;
  }

  onCloseEditarReglaDialog() {
    this.editarReglaDialog.isVisible = false;
  }

  exportarExcel() {
    this.spinner.show();

    this.reglaService
      .exportarReglas(this.query)
      .pipe(
        finalize(() => {
          this.spinner.hide(); // Ocultar spinner después de que la operación termine
        })
      )
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = 'ExcelBandejaReglas.xlsx';
          anchor.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener reglas:', err);
        },
      });
  }
}
