import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TablaSeleccionTramiteComponent } from '../tabla-seleccion-tramite/tabla-seleccion-tramite.component';
import { IDropdownsData } from '@interfaces/administrar-plazos/administrar-plazos';

@Component({
  selector: 'app-seleccion-tramite',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RadioButtonModule,
    DropdownModule,
    InputNumberModule,
    TablaSeleccionTramiteComponent,
  ],
  templateUrl: './seleccion-tramite.component.html',
  styleUrls: ['./seleccion-tramite.component.scss'],
})
export class SeleccionTramiteComponent implements OnInit {
  public formGroup: FormGroup;

  @Input() dropdownsData: IDropdownsData;

  public tramitesRecibidos: any;
  public accionPlazo: string = 'crear';
  public codigoConfiguraPlazo: string;

  private tramiteFormularioObjeto = {
    tienePlazoAlerta: new FormControl<string>('0', Validators.required),
    plazoAlerta: new FormControl<number | null>(null),
    tipoUnidadPlazoAlerta: new FormControl<number | null>(null),
    complejidad: new FormControl<number | null>(null, Validators.required),
  };

  constructor() {
    this.formGroup = new FormGroup(this.tramiteFormularioObjeto);
  }

  ngOnInit(): void {
    this.evaluarSeleccionPlazoAlerta();
    this.campoTienePlazoAlerta.valueChanges.subscribe(() => {
      this.evaluarSeleccionPlazoAlerta();
    });
  }

  private evaluarSeleccionPlazoAlerta() {
    const configuracionSeccion = {
      // si
      '1': {
        plazoAlertaValidator: [Validators.required],
        unidadMedidaValidator: [Validators.required],
      },
      // no
      '0': {
        plazoAlertaValidator: [],
        unidadMedidaValidator: [],
      },
    };

    const plazoAlertaSeleccionado =
      configuracionSeccion[this.campoTienePlazoAlerta.value];
    // Configurando validadores
    this.campoPlazoAlerta.setValidators(
      plazoAlertaSeleccionado.plazoAlertaValidator
    );
    this.campoTipoUnidadPlazoAlerta.setValidators(
      plazoAlertaSeleccionado.unidadMedidaValidator
    );

    // Forzando la actualización del estado de los controles
    this.campoPlazoAlerta.updateValueAndValidity();
    this.campoTipoUnidadPlazoAlerta.updateValueAndValidity();
  }

  onTramitesRecibidos(event: any) {
    // Transformar tramitesSeleccionados a la estructura deseada
    this.tramitesRecibidos = {
      ...event, // Mantenemos el resto del objeto igual
      tramitesSeleccionados: event.tramitesSeleccionados.map(
        (tramite: string) => ({
          id: tramite, // Convertimos cada string a un objeto con `id`
        })
      ),
    };
  }

  get campoTienePlazoAlerta(): AbstractControl {
    return this.formGroup.get('tienePlazoAlerta')!;
  }
  get campoPlazoAlerta(): AbstractControl {
    return this.formGroup.get('plazoAlerta')!;
  }
  get campoTipoUnidadPlazoAlerta(): AbstractControl {
    return this.formGroup.get('tipoUnidadPlazoAlerta')!;
  }
  get campoComplejidad(): AbstractControl {
    return this.formGroup.get('complejidad')!;
  }
}
