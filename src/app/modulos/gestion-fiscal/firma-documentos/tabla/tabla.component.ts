import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef, DynamicDialog } from 'primeng/dynamicdialog';

import { BuscarDependenciaResRow } from '@interfaces/administrar-dependencia/administrar-dependencia';

import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';
import { CheckboxModule } from 'primeng/checkbox';
import { FirmaDocumentoService } from '@services/firma-documento/firma-documento.service';
import { AgregarTipoDocumentoComponent } from '../components/agregar-tipo-documento/agregar-tipo-documento.component';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    MenuModule,
    CmpLibModule,
    DynamicDialog,
    AgregarTipoDocumentoComponent],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
  providers: [MessageService, DynamicDialogRef, DynamicDialogConfig],
})
export class TablaComponent {

  @Input() firmaDocumentoLista: any;

  @Output() clicked = new EventEmitter();

  public obtenerIcono = obtenerIcono;

  dependenciaSeleted: BuscarDependenciaResRow;
  buscarDependenciaResLst: BuscarDependenciaResRow[];

  tipoDocumentoActivo: any;

  listaTipoDocumentoFirma: any = []
  listaTipoDocumento: any = []
  listaFirmaDocumentoPerfil: any = []
  listaCargos: any = []
  listaCargosGeneral: any = []
  listaCargosAdicional: any = []
  actionItems: MenuItem[];
  activeItem: any;
  error: any;

  public refModal: DynamicDialogRef;

  constructor(public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private firmaDocumentoService: FirmaDocumentoService
  ) {
    this.recargalistas()
  }

  recargalistas() {
    this.loadTipoDocumento();
    this.loadcargos();
    this.loadFirmaDocumentoPerfil()
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public img(name: string): string {
    return `assets/images/${name}.png`;
  }

  public cargarModalAcciones() {
    // This is intentional
  }

  onClicked() {
    this.clicked.emit();
  }

  llenarvariable(grupo: any) {
    this.activeItem = grupo;
  }

  confirmaEliminarTipoDocumento(item: any, i: any) {
    this.tipoDocumentoActivo = item;
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '800px',
      showHeader: false,
      data: {
        icon: 'warning',
        title: 'Eliminar Tipo de Documento para Firmas',
        confirm: true,
        description: 'A continuación, se procederá a eliminar el tipo de documento <b>' + this.tipoDocumentoActivo.tipoDocumento + '</b><br><b>Este cambio eliminará también la relación con todos los cargos</b><br>¿Está seguro de realizar esta acción?',
        confirmButtonText: 'Eliminar'
      },
    });

    this.refModal.onClose.subscribe({
      next: resp => {
        console.log('resp = ', resp)
        if (resp === 'confirm') {
          this.eliminarFirma(i);
        }
      }
    });
  }

  private eliminarFirma(i: any): void {
    let usuario = "32920589"
    this.firmaDocumentoService.eliminarFirmaDocumento(this.tipoDocumentoActivo.idTipoDocumento, usuario).subscribe({
      next: (response) => {
        this.listaTipoDocumentoFirma.splice(i, 1)
        this.informarEliminacionRegistro();
      },
      error: (err) => {
        this.error = err;
        console.error('Error al eliminar tipo de documento.', err);
      },
    });
  }

  public informarEliminacionRegistro(): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Tipo de documento para firmas eliminado',
        description: 'La eliminación del tipo de documento <b>' + this.tipoDocumentoActivo.tipoDocumento + '</b> se realizó de forma exitosa. Este documento ya no será considerado para firmas en los sistemas',
        confirmButtonText: 'Listo'
      },
    });
  }


  itemSelected(activeItem: any) {
    this.dependenciaSeleted = activeItem;
  }
  firmaDocumentoCargo(tipoDocumento: any, cargo: any): boolean {

    return this.listaFirmaDocumentoPerfil?.find((f) => (f.idTipoDocumento == tipoDocumento &&
      f.idCargo == cargo)) ? true : false

  }

  onEditarFirmaDocumento(item: any) {
    this.refModal = this.dialogService.open(
      AgregarTipoDocumentoComponent,
      {
        width: '60%',
        showHeader: false,
        contentStyle: { 'padding': '0', 'border-radius': '10px' },
        // style: {'width': '80vw', 'height': '80vh' },
        data: {
          editar: true,
          tipoDocumentoSelect: item,
          listaFirma: this.listaFirmaDocumentoPerfil
        },
      }
    );

    this.refModal.onClose.subscribe((response) => {
      console.log("response = ", response)
      if (response == 'LA OPERACIÓN SE REALIZÓ SATISFACTORIAMENTE') {
        console.log('Datos recibidos del modal:', response);
        this.recargalistas(); // Llamar a la función para actualizar la lista
      }
    });
  }

  loadFirmaDocumentoPerfil(): void {
    this.firmaDocumentoService.listarFirmaDocumentoPerfil().subscribe({
      next: (response) => {
        this.listaFirmaDocumentoPerfil = response;
      },
    });
  }

  private loadTipoDocumento(): void {
    this.firmaDocumentoService.listarTipoDocumento().subscribe({
      next: (response) => {
        this.listaTipoDocumento = response;
        /**this.listaTipoDocumentoFirma = this.listaTipoDocumento.filter((f) => (f.tipoAmbito==2||f.tipoAmbito==3));**/
        this.listaTipoDocumentoFirma = this.listaTipoDocumento;
      },
    });

  }
  private loadcargos(): void {

    this.firmaDocumentoService.listarCargoActivo().subscribe({
      next: (response) => {

        this.listaCargosGeneral = response;//temporal
        /**this.listaCargos = this.listaCargosGeneral?.filter((f) => (f.jerarquia > 0));
        this.listaCargosAdicional = response?.filter((f) => (f.jerarquia != 2 && f.jerarquia != 3));**/
        this.listaCargos = this.listaCargosGeneral;
        this.listaCargosAdicional = this.listaCargosGeneral;
      },
    });
  }
}
