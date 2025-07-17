import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CargaMasivaComponent } from '../components/carga-masiva/carga-masiva.component';
import { EditarDiaNoLaborableComponent } from '../components/editar-dia-no-laborable/editar-dia-no-laborable.component';
import { AgregarEditarDistribucionAleatoriaComponent } from '@modulos/distribucion-y-turnos/distribucion-aleatoria/agregar-editar/agregar-editar-distribucion-aleatoria.component';

@Component({
  selector: 'app-acciones',
  standalone: true,
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.scss'],
  providers: [MessageService, DialogService],
  imports: [
    CommonModule,
    ButtonModule,
    AgregarEditarDistribucionAleatoriaComponent,
    CargaMasivaComponent,
    InputTextModule,
    ToastModule,
  ],
})
export class AccionesComponent {
  //VARIABLE PARA EL VISOR DE DOCUMENTO
  agregarGrupoAleatorioDialog: { isVisible: boolean; documents: any };

  @Input() totalElementos: number = 0;
  @Output() exportar = new EventEmitter<any>();
  @Output() onFeriadoRegistrado = new EventEmitter<void>();

  public refModal: DynamicDialogRef;
  displayAgregar: boolean = false;
  constructor(
    public messageService: MessageService,
    public dialogService: DialogService
  ) {
    this.agregarGrupoAleatorioDialog = {
      isVisible: false,
      documents: {},
    };
  }

  openAgregarDiaNoLaborable() {
    this.refModal = this.dialogService.open(EditarDiaNoLaborableComponent, {
      width: '70%',
      showHeader: false,
      contentStyle: { padding: '0', 'border-radius': '10px' },
      data: { editar: false, idNoLaborable: null },
    });

    // Suscripción al cerrar el modal
    this.refModal.onClose.subscribe((resultado) => {
      // Si el registro fue exitoso, notifica al padre
      if (resultado === 'exito') {
        // Emitimos un evento que el padre "CalendarioNoLaborableComponent" escuche
        this.onFeriadoRegistrado.emit();
      }
    });
  }

  openCargaMasiva() {
    this.refModal = this.dialogService.open(CargaMasivaComponent, {
      width: '55%',
      showHeader: false,
      data: {},
    });

    /** 

    this.agregarGrupoAleatorioDialog.documents = {
      nroDocumento: 1,
      idcedula: 2,
      nroCaso: 3,
      tipoCedula: 1,
    };
    this.agregarGrupoAleatorioDialog.isVisible = true;
    this.displayAgregar = true;

    **/
  }

  cargaExcel(data: any) {
    // This is intentional
  }
  onOpenAgregarGrupoModal() {
    this.agregarGrupoAleatorioDialog.documents = {
      nroDocumento: 1,
      idcedula: 2,
      nroCaso: 3,
      tipoCedula: 1,
    };

    this.agregarGrupoAleatorioDialog.isVisible = true;
    this.displayAgregar = true;
  }

  onCloseAgregarGrupoModal() {
    this.agregarGrupoAleatorioDialog.isVisible = false;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  exportarBandeja() {
    this.exportar.emit();
  }
}
