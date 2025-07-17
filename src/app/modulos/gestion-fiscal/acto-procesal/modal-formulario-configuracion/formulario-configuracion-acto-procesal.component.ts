import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, Validators,
} from '@angular/forms';
import {AlertModalComponent} from '@components/alert-modal/alert-modal.component';
import {ConfiguracionRequest} from '@interfaces/admin-acto-procesal/acto-procesal';
import {MaestroGenerico} from '@interfaces/maestro-generico/maestro-generico';
import {AdminActoProcesalService} from '@services/admin-acto-procesal/admin-acto-procesal.service';
import {MaestroService} from '@services/maestro/maestro.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {InputSwitchModule} from 'primeng/inputswitch';

@Component({
  standalone: true,
  selector: 'app-formulario-configuracion-acto-procesal',
  templateUrl: './formulario-configuracion-acto-procesal.component.html',
  styleUrls: ['./formulario-configuracion-acto-procesal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    InputSwitchModule,
  ],
})
export class FormularioConfiguracionActoProcesalComponent implements OnInit {
  // actoProcesal: MaestroGenerico[] = [];
  carpetaCuaderno: MaestroGenerico[] = [];
  tipoEspecialidad: MaestroGenerico[] = [];
  especialidad: MaestroGenerico[] = [];
  jerarquia: MaestroGenerico[] = [];
  tipoProceso: MaestroGenerico[] = [];
  subTipoProceso: MaestroGenerico[] = [];
  etapas: MaestroGenerico[] = [];

  configuracionForm: FormGroup;
  isCuadernoChecked: boolean = false;

  public refModal: DynamicDialogRef;

  constructor(
    public ref: DynamicDialogRef,
    private readonly fb: FormBuilder,
    public readonly config: DynamicDialogConfig,
    public readonly dialogService: DialogService,
    private readonly maestroService: MaestroService,
    private readonly actoProcesalService: AdminActoProcesalService,
    private readonly spinner: NgxSpinnerService
  ) {
    this.createForm();
    this.subscribeToIdCarpetaCuaderno();
  }

  ngOnInit() {
    /** this.loadFiltroActoProcesal();**/
    this.loadFiltroCarpetaCuaderno();
    this.loadFiltroTipoEspecialidad();
    this.loadFiltroEspecialidad();
    this.loadFiltroJerarquia();
    this.loadFiltroTipoProceso();
    /** this.loadFiltroSubTipoProceso();**/
    this.loadFiltroEtapas();
  }


  public close(): void {
    this.ref.close();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  onChangeCuaderno(event: any): void {
    this.isCuadernoChecked = event.checked;
  }

  private loadFiltroCarpetaCuaderno(): void {
    this.spinner.show();
    this.maestroService.listarCarpetaCuadernos().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.carpetaCuaderno = response.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
    });
  }

  private loadFiltroTipoEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarTipoEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.tipoEspecialidad = response.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
    });
  }


  private loadFiltroEspecialidad(): void {
    this.spinner.show();
    this.maestroService.listarEspecialidad().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.especialidad = response.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
    });
  }

  private loadFiltroJerarquia(): void {
    this.spinner.show();
    this.maestroService.listarJerarquia().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.jerarquia = response.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
    });
  }

  private loadFiltroTipoProceso(): void {
    this.spinner.show();
    this.maestroService.listarTipoProceso().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.tipoProceso = response.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
    });
  }

  onChangeTipoProceso(event: any): void {
    this.loadFiltroSubTipoProceso(event.value);
  }

  private loadFiltroSubTipoProceso(idTipoProceso: number): void {
    this.spinner.show();
    this.maestroService.listarSubTipoProceso(idTipoProceso).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.subTipoProceso = response.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
    });
  }

  private loadFiltroEtapas(): void {
    this.spinner.show();
    this.maestroService.listarEtapas().subscribe({
      next: (response) => {
        this.spinner.hide();
        this.etapas = response.data.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
      },
    });
  }

  onSubmit() {
    this.confirmarCreacionDeConfiguracion(
      'question',
      this.config.data?.nombreActoProcesal
    );
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.llamarServicioAgregarConfiguración(
            this.config.data?.nombreActoProcesal
          );
        }
      },
    });
  }

  llamarServicioAgregarConfiguración(nombreActoProcesal: string): void {
    const configuracion = this.obtenerConfiguracion();

    this.actoProcesalService.agregarConfiguracion(configuracion).subscribe({
      next: (response) => {
        this.informarNuevoRegistro(
          'success',
          'REGISTRO REALIZADO CORRECTAMENTE',
          'Se registraron los nuevos datos del Acto Procesal “' +
          nombreActoProcesal +
          '”, de forma exitosa.'
        );
        this.ref.close(response.message);
      },
      error: (err) => {
        console.error('Error al crear la configuración del acto procesal', err);
      },
    });
  }

  public informarNuevoRegistro(
    icon: string,
    title: string,
    description: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        description: description,
      },
    });
  }

  private obtenerConfiguracion(): ConfiguracionRequest {
    const nuevaConfiguracion = {
      usuarioCreador: '44836273',
      flagCarpetaPrincipal: this.isCuadernoChecked ? '0' : '1',
      idActoProcesal: this.config.data?.idActoProcesal,
      idTipoCuaderno: this.isCuadernoChecked
        ? this.configuracionForm.value.idCarpetaCuaderno
        : 0,
      idTipoEspecialidad: this.configuracionForm.value.idTipoEspecialidad,
      idEspecialidad: this.configuracionForm.value.idEspecialidad,
      idJerarquia: this.configuracionForm.value.idJerarquia,
      idTipoProceso: this.configuracionForm.value.idTipoProceso,
      idSubTipoProceso: this.configuracionForm.value.idSubTipoProceso,
      idEtapa: this.configuracionForm.value.idEtapa,
    };

    return nuevaConfiguracion;
  }

  public confirmarCreacionDeConfiguracion(
    icon: string,
    nombreActoProcesal: string
  ): void {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'REGISTRAR NUEVOS DATOS',
        confirm: true,
        description:
          'A continuación, se procederá a <b>registrar</b> los nuevos datos del <b>Acto Procesal ' +
          nombreActoProcesal +
          '.</b><br>Antes de realizar el registro, por favor asegurarse que:<br>El nombre del acto procesal esté escrito correctamente.<br>Las tildes estan correctas, evitando su uso indebido.<br><b><span style="text-transform: uppercase;">Recuerde que la información ingresada aquí se verá reflejado en los reportes</span>.</b><br>¿Está seguro de realizar esta acción? ',
      },
    });
  }

  private createForm(): void {
    this.configuracionForm = this.fb.group({
      // Switch obligatorio
      cuadernoChecked: [false, [Validators.required]],
      // Campo tipo cuaderno, inicialmente deshabilitado
      idCarpetaCuaderno: [{value: null, disabled: true}],
      // Solo Tipo especialidad es obligatorio según la documentación
      idTipoEspecialidad: [null, [Validators.required]],
      // Campos no obligatorios
      idEspecialidad: [null, [Validators.required]],
      idJerarquia: [null, [Validators.required]],
      idTipoProceso: [null, [Validators.required]],
      idSubTipoProceso: [null, [Validators.required]],
      idEtapa: [null, [Validators.required]]
    });
  }

  private subscribeToIdCarpetaCuaderno(): void {
    this.configuracionForm.get('cuadernoChecked')?.valueChanges
      .subscribe({
        next: (checked: boolean) => {
          const carpetaCuadernoControl = this.configuracionForm.get('idCarpetaCuaderno');

          if (checked) {
            // Si se selecciona "Cuaderno", el campo de tipo cuaderno es obligatorio
            carpetaCuadernoControl?.setValidators([Validators.required]);
            carpetaCuadernoControl?.enable();
          } else {
            // Si se selecciona "Carpeta principal", se deshabilita el campo
            carpetaCuadernoControl?.clearValidators();
            carpetaCuadernoControl?.disable();
            carpetaCuadernoControl?.setValue(null);
          }

          carpetaCuadernoControl?.updateValueAndValidity();
        },
        error: (error) => {
          console.error('Error en la suscripción de idCarpetaCuaderno:', error);
        }
      });
  }
}
