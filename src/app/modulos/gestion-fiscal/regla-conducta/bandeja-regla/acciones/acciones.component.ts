import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AgregarEditarReglaComponent } from '../../agregar-editar-regla/agregar-editar-regla.component';

@Component({
  selector: 'app-acciones',
  standalone: true,
  imports: [
    ButtonModule,
    AgregarEditarReglaComponent
  ],
  templateUrl: './acciones.component.html',
  styleUrls: ['./acciones.component.scss']
})
export class AccionesComponent {

  @Output() exportar = new EventEmitter<any>();
  @Output() clicked = new EventEmitter();
  agregarReglaDialog: { isVisible: boolean, isEdit: boolean, titulo: string; regla: any };

  constructor(){
    this.agregarReglaDialog = {
      isVisible: false,
      isEdit: false,
      titulo: "Agregar Regla de conducta",
      regla: {}
    };
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  onOpenAgregarReglaDialog() {
    /**this.agregarReglaDialog.regla = {
      ...reglaSelected
    };**/
    this.agregarReglaDialog.isVisible = true;
    this.agregarReglaDialog.isEdit = false;
    this.agregarReglaDialog.titulo = "Agregar Regla de conducta";
  }

  onCloseAgregarReglaDialog() {
    this.agregarReglaDialog.isVisible = false;
  }

  onClicked() {
    this.clicked.emit();
  }

  exportarBandeja(){
    this.exportar.emit();
  }
}
