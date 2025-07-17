import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SeccionNivelEtapaComponent } from './components/seccion-nivel-etapa/seccion-nivel-etapa.component';
import { SeccionNivelTramiteComponent } from './components/seccion-nivel-tramite/seccion-nivel-tramite.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IDropdownsData } from '@interfaces/administrar-plazos/administrar-plazos';
import { AdministrarPlazosService } from '@services/administrar-plazos/administrar-plazos.service';

@Component({
  selector: 'app-modal-crear-editar-plazo',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    SeccionNivelEtapaComponent,
    SeccionNivelTramiteComponent,
    InputNumberModule,
  ],
  templateUrl: './modal-crear-editar-plazo.component.html',
  styleUrls: [
    './modal-crear-editar-plazo.component.scss',
    '../../administrar-plazos.component.scss',
    '../../../maestros/categorias/modals/modal-mensaje/modal-mensaje.component.scss',
  ],
})
export class ModalCrearEditarPlazoComponent implements OnInit, AfterViewInit {
  // @Output() crearPlazo = new EventEmitter<any>();
  // @Output() editarPlazo = new EventEmitter<any>();

  @ViewChild(SeccionNivelEtapaComponent)
  seccionNivelEtapaComponent!: SeccionNivelEtapaComponent;
  @ViewChild(SeccionNivelTramiteComponent)
  seccionNivelTramiteComponent!: SeccionNivelTramiteComponent;

  public crearEditarFormGroup: FormGroup;
  public accionPlazo: string = 'crear';
  public plazo;

  public plazoInputLength = 0;

  private readonly config: DynamicDialogConfig = inject(DynamicDialogConfig);

  public dropdownsData: IDropdownsData = {
    unidades_medida: [],
    distritos_fiscales: [],
    tipos_especialidad: [],
    preEtapas: [],
    etapas: [],
  };

  private crearEditarFormObject = {
    diasCalendario: new FormControl<string>('0', Validators.required),
    restrictivo: new FormControl<string>('0', Validators.required),
    plazo: new FormControl<number | null>(null, [
      Validators.required,
      Validators.maxLength(4),
    ]),
    tipoUnidadPlazo: new FormControl<number | null>(null, Validators.required),
    plazoAplica: new FormControl<number>(1, Validators.required), // 1: preEtapa - 2: etapa/tramite
  };

  constructor(
    private ref: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    private administrarPlazosService: AdministrarPlazosService
  ) {
    this.crearEditarFormGroup = new FormGroup(this.crearEditarFormObject);
  }

  ngOnInit(): void {
    this.establecerDatos();

    this.crearEditarFormGroup.get('plazo')?.valueChanges.subscribe((val) => {
      if (!val) {
        this.plazoInputLength = 0;
      } else {
        this.plazoInputLength = val.toString().length;
      }
    });
    
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  cierraAddAppModal() {
    this.closeModal();
  }

  ngAfterViewInit(): void {
    this.establecerDatosSecciones();
  }

  closeModal() {
    /**event.preventDefault();**/
    this.ref.close();
  }

  private establecerDatos(): void {
    if (!this.config.data) return;
    this.dropdownsData = this.config.data.dropdownsData;
    if (!this.config.data?.plazoDetail) return;
    this.accionPlazo = 'editar';
    this.plazo = this.config.data.plazoDetail;
    // desactivando plazo aplica
    this.campoPlazoAplica.disable();
    // estableciendo datos en formulario
    this.crearEditarFormGroup.patchValue({
      diasCalendario: this.plazo?.flagDiasCalendarios,
      restrictivo: this.plazo?.flagRestrictivo,
      plazo: this.plazo?.plazo,
      tipoUnidadPlazo: this.plazo?.tipoUnidadPlazo,
      plazoAplica: this.plazo?.idTipoPlazo,
    });
  }

  private establecerDatosSecciones() {
    if (!this.plazo) return;

    // Determinar tipo de plazo y aplicar configuración
    if (this.plazo.idTipoPlazo === 1) {
      this.configurarSeccionPlazoConfigurado();
    } else if (this.plazo.idTipoPlazo === 4) {
      this.configurarSeccionNivelTramite();
    }

    this.cd.detectChanges();
  }

  private configurarSeccionPlazoConfigurado(): void {
    const tipoEspecialidad = this.plazo?.idTipoEspecialidad;
    const especialidad = this.plazo?.idEspecialidad;

    this.seccionNivelEtapaComponent
      .determinarSeleccionFormulario()
      .formGroup.patchValue({
        plazoConfigurado: this.getValue(this.plazo?.idTipoConfiguracion),
        distritoFiscal: this.getValue(this.plazo?.idDistritoFiscal),
        tipoEspecialidad: this.getValue(tipoEspecialidad),
        preEtapa: this.getStringValue(this.plazo?.idPreEtapa),
      });

    if (tipoEspecialidad && especialidad) {
      this.seccionNivelEtapaComponent
        .determinarSeleccionFormulario()
        .obtenerEspecialidadesDropdown(tipoEspecialidad, especialidad);
    }
  }

  private configurarSeccionNivelTramite(): void {
    this.seccionNivelTramiteComponent.campoNivelPlazo.disable();

    if (this.plazo.idNivelPlazo === 1) {
      this.setNivelPlazo(false);
      this.setDatosTramite();
    } else if (this.plazo.idNivelPlazo === 2) {
      this.setNivelPlazo(true);
      this.setDatosAlerta();
    }
  }

  private setNivelPlazo(valor: boolean): void {
    this.seccionNivelTramiteComponent.campoNivelPlazo.patchValue(valor);
  }

  private setDatosTramite(): void {
    const tipoEspecialidad = this.plazo?.idTipoEspecialidad;
    const especialidad = this.plazo?.idEspecialidad;

    setTimeout(() => {
      this.seccionNivelTramiteComponent
        .determinarSeleccionFormulario()
        .formGroup.patchValue({
          plazoConfigurado: this.getValue(this.plazo?.idTipoConfiguracion),
          distritoFiscal: this.getValue(this.plazo?.idDistritoFiscal),
          tipoEspecialidad: this.getValue(tipoEspecialidad),
          etapa: this.getValue(this.plazo?.idEtapa),
        });

      if (tipoEspecialidad && especialidad) {
        this.seccionNivelTramiteComponent
          .determinarSeleccionFormulario()
          .obtenerEspecialidadesDropdown(tipoEspecialidad, especialidad);
      }
    }, 100);
  }

  private setDatosAlerta(): void {
    setTimeout(() => {
      this.seccionNivelTramiteComponent
        .determinarSeleccionFormulario()
        .formGroup.patchValue({
          tienePlazoAlerta: this.plazo?.flagPlazoAlerta,
          plazoAlerta: this.plazo?.plazoAlerta,
          tipoUnidadPlazoAlerta: this.plazo?.tipoUnidadPlazoAlerta,
          complejidad: this.plazo?.idTipoComplejidad,
        });

      const formulario = this.seccionNivelTramiteComponent.determinarSeleccionFormulario();
      formulario.codigoConfiguraPlazo = this.plazo.idConfiguraPlazo;
      formulario.accionPlazo = 'editar';
    }, 100);
  }

  private getValue(value: any): any {
    return value ? value : null;
  }

  private getStringValue(value: any): string | null {
    return value ? value.toString() : null;
  }

  /**private establecerDatosSecciones() {
    if (!this.plazo) return;
    // estableciendo datos en seccion plazo configurado
    if (this.plazo.idTipoPlazo === 1) {
      const tipoEspecialidad = this.plazo?.idTipoEspecialidad;
      const especialidad = this.plazo?.idEspecialidad;

      this.seccionNivelEtapaComponent
        .determinarSeleccionFormulario()
        .formGroup.patchValue({
          plazoConfigurado: this.plazo?.idTipoConfiguracion
            ? this.plazo.idTipoConfiguracion
            : null,
          distritoFiscal: this.plazo?.idDistritoFiscal
            ? this.plazo.idDistritoFiscal
            : null,
          tipoEspecialidad: tipoEspecialidad ? tipoEspecialidad : null,
          preEtapa: this.plazo?.idPreEtapa
            ? this.plazo.idPreEtapa.toString()
            : null,
        });
      // estableciendo especialidad
      if (tipoEspecialidad && especialidad)
        this.seccionNivelEtapaComponent
          .determinarSeleccionFormulario()
          .obtenerEspecialidadesDropdown(tipoEspecialidad, especialidad);
    }
    // estableciendo datos en seccion nivel tramite
    if (this.plazo.idTipoPlazo === 4) {
      // desactivando  el nivel del plazo
      this.seccionNivelTramiteComponent.campoNivelPlazo.disable();
      // obteniendo el nivel del plazo
      if (this.plazo.idNivelPlazo === 1) {
        // estableciendo nivel del plazo
        this.seccionNivelTramiteComponent.campoNivelPlazo.patchValue(false);
        // estableciendo los demas datos
        const tipoEspecialidad = this.plazo?.idTipoEspecialidad;
        const especialidad = this.plazo?.idEspecialidad;

        setTimeout(() => {
          this.seccionNivelTramiteComponent
            .determinarSeleccionFormulario()
            .formGroup.patchValue({
              plazoConfigurado: this.plazo?.idTipoConfiguracion
                ? this.plazo.idTipoConfiguracion
                : null,
              distritoFiscal: this.plazo?.idDistritoFiscal
                ? this.plazo.idDistritoFiscal
                : null,
              tipoEspecialidad: tipoEspecialidad ? tipoEspecialidad : null,
              etapa: this.plazo?.idEtapa ? this.plazo.idEtapa : null,
            });

          // estableciendo especialidad
          if (tipoEspecialidad && especialidad)
            this.seccionNivelTramiteComponent
              .determinarSeleccionFormulario()
              .obtenerEspecialidadesDropdown(tipoEspecialidad, especialidad);
        }, 100);
      } else if (this.plazo.idNivelPlazo === 2) {
        // estableciendo nivel del plazo
        this.seccionNivelTramiteComponent.campoNivelPlazo.patchValue(true);
        // estableciendo los demas datos
        setTimeout(() => {
          this.seccionNivelTramiteComponent
            .determinarSeleccionFormulario()
            .formGroup.patchValue({
              tienePlazoAlerta: this.plazo?.flagPlazoAlerta,
              plazoAlerta: this.plazo?.plazoAlerta,
              tipoUnidadPlazoAlerta: this.plazo?.tipoUnidadPlazoAlerta,
              complejidad: this.plazo?.idTipoComplejidad,
            });
          // detalle tramites
          this.seccionNivelTramiteComponent.determinarSeleccionFormulario().codigoConfiguraPlazo =
            this.plazo.idConfiguraPlazo;
          this.seccionNivelTramiteComponent.determinarSeleccionFormulario().accionPlazo =
            'editar';
        }, 100);
      }
    }

    this.cd.detectChanges();
  }**/

  public cerrarModal(): void {
    this.ref.close();
  }

  //refactorizado
  public evaluacionCampos(): void {
    debugger;
    const formularioSeleccionado = this.obtenerFormularioSeleccionado();
    const { nivelTramiteSeleccionado, tramitesSeleccionadosRecibidos, idtramiteRecibido, nivelDelPlazo } =
      this.obtenerDatosTramite(formularioSeleccionado);

    if (!this.verificarFormularioValido(formularioSeleccionado, nivelTramiteSeleccionado, tramitesSeleccionadosRecibidos)) {
      this.marcarCamposComoTocados(formularioSeleccionado);
      return;
    }

    if (this.config.data.confirmarAccion) {
      const descripcionModal = this.crearDescripcionModal(formularioSeleccionado);
      const data = this.prepararDatosParaAccion(
        formularioSeleccionado,
        nivelTramiteSeleccionado,
        tramitesSeleccionadosRecibidos,
        idtramiteRecibido,
        nivelDelPlazo
      );
      this.enviarAccion(data, descripcionModal);
    }
  }

  private obtenerFormularioSeleccionado(): any {
    if (this.campoPlazoAplica.value === 1) {
      return this.seccionNivelEtapaComponent.determinarSeleccionFormulario().formGroup;
    } else if (this.campoPlazoAplica.value === 4) {
      return this.seccionNivelTramiteComponent.determinarSeleccionFormulario().formGroup;
    }
    return null;
  }

  private obtenerDatosTramite(formularioSeleccionado: any): any {
    let nivelTramiteSeleccionado = false;
    let tramitesSeleccionadosRecibidos;
    let idtramiteRecibido;
    let nivelDelPlazo = null;

    if (this.campoPlazoAplica.value === 4) {
      nivelDelPlazo = this.seccionNivelTramiteComponent.campoNivelPlazo.value ? 2 : 1;
      if (this.seccionNivelTramiteComponent.campoNivelPlazo.value === true) {
        nivelTramiteSeleccionado = true;
        tramitesSeleccionadosRecibidos = formularioSeleccionado.tramitesRecibidos?.tramitesSeleccionados;
        idtramiteRecibido = formularioSeleccionado.tramitesRecibidos?.idTramite;
      }
    }
    return { nivelTramiteSeleccionado, tramitesSeleccionadosRecibidos, idtramiteRecibido, nivelDelPlazo };
  }

  private verificarFormularioValido(formularioSeleccionado: any, nivelTramiteSeleccionado: boolean, tramitesSeleccionadosRecibidos: any): boolean {
    return this.crearEditarFormGroup.valid &&
      formularioSeleccionado?.valid &&
      (!nivelTramiteSeleccionado || this.accionPlazo !== 'crear' || (tramitesSeleccionadosRecibidos && tramitesSeleccionadosRecibidos.length > 0));
  }

  private marcarCamposComoTocados(formularioSeleccionado: any): void {
    this.crearEditarFormGroup.markAllAsTouched();
    formularioSeleccionado?.markAllAsTouched();
  }

  private crearDescripcionModal(formularioSeleccionado: any): any {
    const tipoDePlazo = this.determinarTipoDePlazo();
    const valorPreEtapaEtapa = this.obtenerValorPreEtapaEtapa(formularioSeleccionado);
    const preEtapaEtapaFiltrado = valorPreEtapaEtapa
      ? this.dropdownsData.preEtapas_etapas.find(preEtapa_etapa => preEtapa_etapa.idItem === valorPreEtapaEtapa)
      : null;

    return {
      tipoDePlazo: tipoDePlazo,
      nombrePreEtapa_Etapa: preEtapaEtapaFiltrado ? preEtapaEtapaFiltrado.Descripcion : null,
      nombreTramite: this.plazo?.tramite,
      codigoTramite: this.plazo?.idConfiguraPlazo,
    };
  }

  private determinarTipoDePlazo(): string {
    if (this.campoPlazoAplica.value === 1) return 'pre-etapa';
    if (this.campoPlazoAplica.value === 4) {
      return this.seccionNivelTramiteComponent.campoNivelPlazo.value ? 'tramite' : 'etapa';
    }
    return '';
  }

  //refactorizado
  private obtenerValorPreEtapaEtapa(formularioSeleccionado: any): any {
    const valorPlazo = this.campoPlazoAplica.value;

    if (valorPlazo === 1) {
      return formularioSeleccionado.value.preEtapa;
    } else if (valorPlazo === 4) {
      return formularioSeleccionado.value.etapa;
    } else {
      return null;
    }
  }


  /**private obtenerValorPreEtapaEtapa(formularioSeleccionado: any): any {
    return this.campoPlazoAplica.value === 1
      ? formularioSeleccionado.value.preEtapa
      : this.campoPlazoAplica.value === 4
      ? formularioSeleccionado.value.etapa
      : null;
  }**/

  private prepararDatosParaAccion(
    formularioSeleccionado: any,
    nivelTramiteSeleccionado: boolean,
    tramitesSeleccionadosRecibidos: any,
    idtramiteRecibido: any,
    nivelDelPlazo: any
  ): any {
    const commonData = nivelTramiteSeleccionado
      ? {
          listaIdActosTramitesEtapas: tramitesSeleccionadosRecibidos,
          idTramite: idtramiteRecibido,
        }
      : {};

    return {
      accion: this.accionPlazo,
      data: {
        ...(this.accionPlazo === 'crear' ? this.crearEditarFormGroup.value : this.crearEditarFormGroup.getRawValue()),
        ...formularioSeleccionado.value,
        nivelDelPlazo: nivelDelPlazo,
        ...commonData,
        ...(this.accionPlazo === 'editar' && { idConfiguraPlazo: this.plazo.idConfiguraPlazo }),
      },
    };
  }

  private enviarAccion(data: any, descripcionModal: any): void {
    this.config.data.confirmarAccion({
      accion: data.accion,
      data: data.data,
      descripcionModal,
    });
  }
  //

  /**public evaluacionCampos(): void {
    let formularioSeleccionado;
    let nivelTramiteSeleccionado = false;
    let tramitesSeleccionadosRecibidos;
    let idtramiteRecibido;
    let nivelDelPlazo = null;

    if (this.campoPlazoAplica.value === 1) {
      formularioSeleccionado =
        this.seccionNivelEtapaComponent.determinarSeleccionFormulario()
          .formGroup;
    } else if (this.campoPlazoAplica.value === 4) {
      formularioSeleccionado =
        this.seccionNivelTramiteComponent.determinarSeleccionFormulario()
          .formGroup;
      // obteniendo el nivel del plazo
      if (this.seccionNivelTramiteComponent.campoNivelPlazo.value === true) {
        nivelDelPlazo = 2;
      } else if (
        this.seccionNivelTramiteComponent.campoNivelPlazo.value === false
      ) {
        nivelDelPlazo = 1;
      }

      // verificar si el usuario ha seleccionado Nivel de Tramite
      if (this.seccionNivelTramiteComponent.campoNivelPlazo.value === true) {
        nivelTramiteSeleccionado = true;
        tramitesSeleccionadosRecibidos =
          this.seccionNivelTramiteComponent.determinarSeleccionFormulario()
            .tramitesRecibidos?.tramitesSeleccionados;
        idtramiteRecibido =
          this.seccionNivelTramiteComponent.determinarSeleccionFormulario()
            .tramitesRecibidos?.idTramite;
      }
    }

    if (this.crearEditarFormGroup.valid && formularioSeleccionado?.valid) {
      // verificar que hayan elementos en la tabla de tramites seleccionados en caso se haya seleccionado Nivel de tramite
      if (
        nivelTramiteSeleccionado === true &&
        this.accionPlazo === 'crear' &&
        (!tramitesSeleccionadosRecibidos ||
          tramitesSeleccionadosRecibidos?.length <= 0)
      )
        return;
      // crear plazo
      // if (this.config.data.crearPlazo && this.accionPlazo === 'crear') {
      //   // envio de data para crear nuevo plazo
      //   this.config.data.crearPlazo({
      //     ...this.crearEditarFormGroup.value,
      //     ...formularioSeleccionado.value,
      //     ...(nivelTramiteSeleccionado
      //       ? {
      //           listaIdActosTramitesEtapas: tramitesSeleccionadosRecibidos,
      //           idTramite: idtramiteRecibido, // Aquí se añade idtramiteRecibido
      //         }
      //       : {}),
      //     nivelDelPlazo: nivelDelPlazo, // Aquí se añade nivelDelPlazo
      //   });
      // }
      // // editar plazo
      // if (this.config.data.editarPlazo && this.accionPlazo === 'editar') {
      //   this.config.data.editarPlazo({
      //     ...this.crearEditarFormGroup.getRawValue(),
      //     ...formularioSeleccionado.value,
      //     idConfiguraPlazo: this.plazo.idConfiguraPlazo,
      //     nivelDelPlazo: nivelDelPlazo, // Aquí se añade nivelDelPlazo
      //   });
      // }

      if (this.config.data.confirmarAccion) {
        // moldear data descripcion modal
        let tipoDePlazo;
        if (this.campoPlazoAplica.value === 1) {
          tipoDePlazo = 'pre-etapa';
        } else if (this.campoPlazoAplica.value === 4) {
          if (
            this.seccionNivelTramiteComponent.campoNivelPlazo.value === false
          ) {
            tipoDePlazo = 'etapa';
          }
          if (
            this.seccionNivelTramiteComponent.campoNivelPlazo.value === true
          ) {
            tipoDePlazo = 'tramite';
          }
        }
        const valorPreEtapaEtapa =
          this.campoPlazoAplica.value === 1
            ? formularioSeleccionado.value.preEtapa
            : this.campoPlazoAplica.value === 4
            ? formularioSeleccionado.value.etapa
            : null;

        const preEtapaEtapaFiltrado = valorPreEtapaEtapa
          ? this.dropdownsData.preEtapas_etapas.filter(
              (preEtapa_etapa) => preEtapa_etapa.idItem === valorPreEtapaEtapa
            )
          : null;

        const descripcionModal = {
          tipoDePlazo: tipoDePlazo,
          nombrePreEtapa_Etapa: preEtapaEtapaFiltrado
            ? preEtapaEtapaFiltrado[0].Descripcion
            : null,
          nombreTramite: this.plazo?.tramite,
          codigoTramite: this.plazo?.idConfiguraPlazo,
        };

        if (this.accionPlazo === 'crear') {
          this.config.data.confirmarAccion({
            accion: this.accionPlazo,
            data: {
              ...this.crearEditarFormGroup.value,
              ...formularioSeleccionado.value,
              ...(nivelTramiteSeleccionado
                ? {
                    listaIdActosTramitesEtapas: tramitesSeleccionadosRecibidos,
                    idTramite: idtramiteRecibido, // Aquí se añade idtramiteRecibido
                  }
                : {}),
              nivelDelPlazo: nivelDelPlazo, // Aquí se añade nivelDelPlazo
            },
            descripcionModal,
          });
        }
        if (this.accionPlazo === 'editar') {
          this.config.data.confirmarAccion({
            accion: this.accionPlazo,
            data: {
              ...this.crearEditarFormGroup.getRawValue(),
              ...formularioSeleccionado.value,
              idConfiguraPlazo: this.plazo.idConfiguraPlazo,
              nivelDelPlazo: nivelDelPlazo, // Aquí se añade nivelDelPlazo
            },
            descripcionModal,
          });
        }
      }
    } else {
      this.crearEditarFormGroup.markAllAsTouched();
      formularioSeleccionado?.markAllAsTouched();
    }
  }**/

  get campoPlazo(): AbstractControl {
    return this.crearEditarFormGroup.get('plazo')!;
  }
  get campoTipoUnidadPlazo(): AbstractControl {
    return this.crearEditarFormGroup.get('tipoUnidadPlazo')!;
  }
  get campoPlazoAplica(): AbstractControl {
    return this.crearEditarFormGroup.get('plazoAplica')!;
  }
}
