import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Component, EventEmitter, Output } from '@angular/core';
import { AgregarTipoDocumentoComponent } from '../components/agregar-tipo-documento/agregar-tipo-documento.component';
import { obtenerIcono } from '@utils/icon';
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';

@Component({
  selector: 'app-acciones',
  standalone: true,
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.scss'],
  imports: [
    CommonModule,
    ButtonModule,
    AgregarTipoDocumentoComponent,
    InputTextModule,
    ToastModule,
    CmpLibModule
  ],
  providers: [MessageService, DialogService],
})
export class AccionesComponent {

  public displayModalAgregar: boolean = false;
  public displayModalImportar: boolean = false;

  agregarGrupoAleatorioDialog: { isVisible: boolean; documents: any };

  @Output() actualizarLista = new EventEmitter<any>(); 
  @Output() exportar = new EventEmitter<any>();
  public refModal: DynamicDialogRef;
  public obtenerIcono = obtenerIcono;
  constructor(public messageService: MessageService,
    public dialogService: DialogService,

  ) {
    this.agregarGrupoAleatorioDialog = {
      isVisible: false,
      documents: {},
    };
  }
  /**
    onOpenAgregarGrupoModal() {
      this.agregarGrupoAleatorioDialog.documents = {
        nroDocumento: 1,
        idcedula: 2,
        nroCaso: 3,
        tipoCedula: 1,
      };
      this.agregarGrupoAleatorioDialog.isVisible = true;
  
    }
  
    onCloseAgregarGrupoModal() {
      this.agregarGrupoAleatorioDialog.isVisible = false;
    }
  **/
  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  exportarTipoDocumentoExcel() {
    this.exportar.emit();
  }

  agregarTipoDocumento() {

    this.refModal = this.dialogService.open(
      AgregarTipoDocumentoComponent,
      {
        width: '60%',
        showHeader: false,
        contentStyle: { 'padding': '0', 'border-radius': '10px' },
        data: {
          editar: false,
          tipoDocumentoSelect: null,

        },
      }
    );

    this.refModal.onClose.subscribe((response) => {
      console.log("response = ", response)
      if (response == 'LA OPERACIÓN SE REALIZÓ SATISFACTORIAMENTE') {
        console.log('Datos recibidos del modal:', response);
        this.actualizarLista.emit();
      }
    });
  }

}
