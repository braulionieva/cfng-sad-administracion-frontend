import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { CalendarioNoLaborableService } from '@services/calendario-no-laborable/calendario-no-laborable.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { obtenerMesLetras } from '@utils/date';
import { EditarDiaNoLaborableComponent } from '../editar-dia-no-laborable/editar-dia-no-laborable.component';

@Component({
  selector: 'app-ver-detalle-fecha',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    DialogModule,
    CmpLibModule,
  ],
  templateUrl: './ver-detalle-fecha.component.html',
  styleUrls: ['./ver-detalle-fecha.component.scss'],
})
export class VerDetalleFechaComponent {
  fechaNoLaborable: any;
  idNoLaborable: string;
  sumillaFechas: string;
  nombre: string;
  descripcion: string;
  distritosFiscales: string = '';
  tipoDia: number = 1;

  error: any;

  public refModal: DynamicDialogRef;
  public obtenerIcono = obtenerIcono;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    public calendarioNoLaborableService: CalendarioNoLaborableService
  ) {}

  ngOnInit() {
    this.fechaNoLaborable = this.config?.data.datosDateSelect;
    // let fecha = new Date(this.fechaNoLaborable.fecha);
    // console.log('Fecha en detalle: ', this.fechaNoLaborable);

    // Tomar "yyyy-mm-dd" y armar un Date sin que pase por UTC
    const [yyyy, mm, dd] = this.fechaNoLaborable.fecha.split('-').map(Number);
    // En el constructor, month va de 0 a 11
    const fechaLocal = new Date(yyyy, mm - 1, dd);

    this.sumillaFechas = obtenerMesLetras(fechaLocal);
    this.consultarDia(this.fechaNoLaborable.fecha);
  }

  consultarDia(fecha: any) {
    /**this.formNoLaborable.get('distritoFiscal').setValue([{id:this.fechaNoLaborable?.idDistritoFiscal,nombre:this.fechaNoLaborable?.distritoFiscal}]);
    this.isRegional = this.fechaNoLaborable?.tipoAmbito=='REGIONAL'?true:false;
    **/
  }

  onEditFecha(diaNoLaborable: any) {
    this.refModal = this.dialogService.open(EditarDiaNoLaborableComponent, {
      width: '80%',
      showHeader: false,
      data: {
        editar: true,
        fechaNoLaborable: this.fechaNoLaborable,
        dataToSend: this.config?.data.dataToSend,
      },
    });
    //this.close()
  }

  onEliminarFecha(idNoLaborable: any) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'ELIMINAR DÍA FESTIVO/NO LABORABLE',
        confirm: true,
        description:
          'A continuación, se procederá a <b>eliminar los datos</b> del(los) día(s) ' +
          this.fechaNoLaborable.fecha +
          ': ' +
          this.fechaNoLaborable.nombre +
          '.<br><b>¿Esta eliminación afectará a todos los plazos que sean registrados a partir de la fecha, pero NO a los plazos registrados anteriormente</b> ¿Está seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar',
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.ref.close(this.fechaNoLaborable);
        }
      },
    });
  }
  public logo(name: string): string {
    return `assets/images/${name}.png`;
  }

  close() {
    this.ref.close();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }
}
