import {
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SeleccionPlazoConfiguradoComponent } from '../seleccion-plazo-configurado/seleccion-plazo-configurado.component';
import { SeleccionTramiteComponent } from '../seleccion-tramite/seleccion-tramite.component';
import { IDropdownsData } from '@interfaces/administrar-plazos/administrar-plazos';

@Component({
  selector: 'app-seccion-nivel-tramite',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSwitchModule,
    SeleccionPlazoConfiguradoComponent,
    SeleccionTramiteComponent,
  ],
  templateUrl: './seccion-nivel-tramite.component.html',
  styleUrls: ['./seccion-nivel-tramite.component.scss'],
})
export class SeccionNivelTramiteComponent implements OnInit {
  @Input() dropdownsData: IDropdownsData;
  @Input() plazoAplica: 1 | 4;
  @Input() accionPlazo: string;
  @ViewChild(SeleccionPlazoConfiguradoComponent)
  seleccionPlazoConfiguradoComponent!: SeleccionPlazoConfiguradoComponent;
  @ViewChild(SeleccionTramiteComponent)
  seleccionTramiteComponent: SeleccionTramiteComponent;

  public nivelTramiteFormGroup: FormGroup;
  public isEditing;

  private grupoFormularioObjeto = {
    // false === 'nivelEtapa'
    // true === 'nivelTramite'
    nivelPlazo: new FormControl<boolean>(false),
  };

  constructor() {
    this.nivelTramiteFormGroup = new FormGroup(this.grupoFormularioObjeto);
  }

  ngOnInit(): void {
    // This is intentional
  }

  public determinarSeleccionFormulario(): any {
    if (this.campoNivelPlazo.value === false) {
      return this.seleccionPlazoConfiguradoComponent;
    } else if (this.campoNivelPlazo.value === true) {
      return this.seleccionTramiteComponent;
    }
  }

  get campoNivelPlazo(): AbstractControl {
    return this.nivelTramiteFormGroup.get('nivelPlazo')!;
  }
}
