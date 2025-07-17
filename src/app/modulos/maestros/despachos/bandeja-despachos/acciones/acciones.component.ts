import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import {AgregarDespachoComponent} from "@modulos/maestros/despachos/agregar-despacho/agregar-despacho.component";
import { CmpLibModule } from 'ngx-mpfn-dev-cmp-lib';
import { obtenerIcono } from '@utils/icon';

@Component({
  selector: 'app-acciones',
  standalone: true,
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.scss'],
  imports: [
    ButtonModule,
    AgregarDespachoComponent,
    CmpLibModule
  ],
  providers: [MessageService, DialogService]
})
export class AccionesComponent {

  @ViewChild(AgregarDespachoComponent) childAgregarDespachoComponent:AgregarDespachoComponent;

  @Output() exportar = new EventEmitter<any>();
  @Output() clicked = new EventEmitter();
  agregarDespachoDialog: { isVisible: boolean; documents: any };
  public obtenerIcono = obtenerIcono;
  @Input() exportarExcelDisabled: boolean = true;

  constructor(public messageService: MessageService, private dialogService: DialogService) {
    this.agregarDespachoDialog = {
      isVisible: false,
      documents: {},
    };
  }

  onOpenAgregarDespachoDialog() {
    this.agregarDespachoDialog.isVisible = true;
    this.childAgregarDespachoComponent.initData();

  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  exportarBandeja(){
    this.exportar.emit();
  }

  onCloseAgregarDespachoDialog() {
    this.agregarDespachoDialog.isVisible = false;
  }

  onClicked() {
    this.clicked.emit();
  }
}
