import {
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeleccionPlazoConfiguradoComponent } from '../seleccion-plazo-configurado/seleccion-plazo-configurado.component';
import { IDropdownsData } from '@interfaces/administrar-plazos/administrar-plazos';

@Component({
  selector: 'app-seccion-nivel-etapa',
  standalone: true,
  imports: [CommonModule, SeleccionPlazoConfiguradoComponent],
  templateUrl: './seccion-nivel-etapa.component.html',
})
export class SeccionNivelEtapaComponent {
  @Input() dropdownsData: IDropdownsData;
  @Input() plazoAplica: 1 | 4;
  @ViewChild(SeleccionPlazoConfiguradoComponent)
  seleccionPlazoConfiguradoComponent!: SeleccionPlazoConfiguradoComponent;

  public determinarSeleccionFormulario(): any {
    return this.seleccionPlazoConfiguradoComponent;
  }
}
