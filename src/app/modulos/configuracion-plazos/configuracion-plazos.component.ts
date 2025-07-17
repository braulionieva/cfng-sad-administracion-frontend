import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TablaComponent } from './tabla/tabla.component';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ConfiguracionPlazosService } from './configuracion-plazos.service';
import { action, Plazo } from './configuracion-plazos.interface';
import { FiltrosComponent } from './filtros/filtros.component';
import {
  configuresData,
  specialtiesData,
  taxDistrictsData,
  typeDeadlineDaysData,
  typeSpecialtiesData,
} from './data-dropdowns';

import { ModalCrearEditarPlazoComponent } from './modals/modal-crear-editar-plazo/modal-crear-editar-plazo.component';
import { forkJoin, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfiguracionPlazosCasosService } from '@services/configuracion-plazos-casos/configuracion-plazos-casos.service';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';
import { Auth2Service } from '@services/auth/auth2.service';

@Component({
  standalone: true,
  selector: 'app-configuracion-plazos',
  templateUrl: './configuracion-plazos.component.html',
  styleUrls: ['./configuracion-plazos.component.scss'],
  imports: [CommonModule, FiltrosComponent, TablaComponent],
  providers: [DynamicDialogConfig, DialogService],
})
export class ConfiguracionPlazosComponent implements OnInit {
  public refModal: DynamicDialogRef;
  plazos: Plazo[] = [];
  //plazosCasos: Plazo[] = [];
  numberCases: number = 6;
  dataDropdowns = [
    {
      configuresDropdown: [],
      taxDistrictsDropdown: [],
      typeSpecialtiesDropdown: [],
      specialtiesDropdown: [],
      typeDeadlineDaysDropdown: [],
    },
  ];

  private modalSuccessSubscription: Subscription;
  public subscriptions: Subscription[] = [];
  public infoUsuario;

  constructor(
    private configuracionPlazosService: ConfiguracionPlazosService,
    private dialogService: DialogService,
    private spinner: NgxSpinnerService,
    private configuracionPlazosCasosService: ConfiguracionPlazosCasosService,
    private userService: Auth2Service
  ) {}

  ngOnInit(): void {
    this.getListPlazos();
    this.getDataDropdowns();
    this.loadDropdownData();

    this.infoUsuario = this.userService.getUserInfo();

    this.configuracionPlazosService.isCompleteActionPlazo.subscribe(() =>
      this.getListPlazos()
    );

    this.configuracionPlazosService.showConfirmModal.subscribe(
      ({ setAction, setPlazo }) =>
        this.openModalConfirmAction({
          setAction,
          setPlazo,
        })
    );

    this.configuracionPlazosService.refreshPlazo.subscribe(() => {
      this.getListPlazos();
    });

    this.modalSuccessSubscription =
      this.configuracionPlazosService.successModal$.subscribe(
        ({ action, plazo, codigoPlazo }) => {
          if (action === 'create') {
            // llamada al servicio
            const request = {
              tipoConfiguracion: plazo.configurado,
              distritoFiscal: plazo.distrito_fiscal,
              tipoEspecialidad: plazo.tipo_especialidad,
              especialidad: plazo.especialidad,
              plazoEvaluar: plazo.plazo_evaluar_cantidad,
              tipoDiasEvaluar: plazo.plazo_evaluar_tipo,
              plazoAlerta: plazo.plazo_mostrar_cantidad,
              tipoDiasAlerta: plazo.plazo_mostrar_tipo,
              usuarioCreacion: this.infoUsuario?.usuario.usuario,
            };

            this.spinner.show();

            this.subscriptions.push(
              this.configuracionPlazosCasosService
                .crearPlazoCaso(request)
                .subscribe({
                  next: (resp: any) => {
                    this.spinner.hide();

                    if (resp.valCod === '0') {
                      this.openModalSuccess(action, plazo);
                    } else if (
                      (resp.valCod === '1' || resp.valCod !== '0') &&
                      resp.valMsg
                    ) {
                      this.openModalErrorSuccess(resp.valMsg);
                    }
                  },
                  error: (error) => {
                    this.spinner.hide();
                    console.error(error);
                  },
                })
            );
          }
          if (action === 'save') {
            // llamada al servicio
            const request = {
              idPlazoCaso: codigoPlazo,
              tipoConfiguracion: plazo.configurado,
              distritoFiscal: plazo.distrito_fiscal,
              tipoEspecialidad: plazo.tipo_especialidad,
              especialidad: plazo.especialidad,
              plazoEvaluar: plazo.plazo_evaluar_cantidad,
              tipoDiasEvaluar: plazo.plazo_evaluar_tipo,
              plazoAlerta: plazo.plazo_mostrar_cantidad,
              tipoDiasAlerta: plazo.plazo_mostrar_tipo,
              usuarioCreacion: this.infoUsuario?.usuario.usuario,
            };

            this.spinner.show();

            this.subscriptions.push(
              this.configuracionPlazosCasosService
                .editarPlazoCaso(request)
                .subscribe({
                  next: (resp) => {
                    this.spinner.hide();
                  },
                  error: (error) => {
                    this.spinner.hide();
                    console.error(error);
                  },
                })
            );
          }
        }
      );
  }

  getListPlazos(selectedValue?: any) {
    // opciones seleccionadas
    let request = null;
    if (selectedValue) {
      request = {
        pages: 1,
        perPage: 10,
        filtros: {
          tipoConfiguracion: selectedValue.configurado
            ? selectedValue.configurado
            : null,
          distritoFiscal: selectedValue.distrito_fiscal
            ? selectedValue.distrito_fiscal
            : null,
          tipoEspecialidad: selectedValue.tipo_especiliadad
            ? selectedValue.tipo_especiliadad
            : null,
          especialidad: selectedValue.especiliadad
            ? selectedValue.especiliadad
            : null,
        },
      };
    } else {
      request = {
        pages: 1,
        perPage: 10,
        filtros: {
          tipoConfiguracion: null, //selectedValue.configurado,
          distritoFiscal: null, //selectedValue.distrito_fiscal,
          tipoEspecialidad: null, //selectedValue.tipo_especiliadad,
          especialidad: null, //selectedValue.especiliadad,
        },
      };
    }

    this.spinner.show();

    this.subscriptions.push(
      this.configuracionPlazosCasosService
        .obtenerPlazoCasos(request)
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            this.plazos = resp.registros;
            this.numberCases = resp.totalElementos;
          },
          error: (error) => {
            this.spinner.hide();
            console.error(error);
          },
        })
    );
  }

  loadDropdownData() {
    const observables = [
      this.configuracionPlazosCasosService.obtenerTipoConfiguracion(),
      this.configuracionPlazosCasosService.obtenerDistritoFiscal(),
      this.configuracionPlazosCasosService.obtenerTipoEspecialidad(),
    ];

    this.spinner.show();
    forkJoin(observables).subscribe({
      next: ([configures, districts, specialties]) => {
        this.spinner.hide();
        //carga de la data async en esta sección
        this.dataDropdowns = [
          {
            configuresDropdown: configures as any[],
            taxDistrictsDropdown: districts as any[],
            typeSpecialtiesDropdown: specialties as any[],
            specialtiesDropdown: [], // Se cargará dinámicamente cuando se seleccione un tipo especialidad
            typeDeadlineDaysDropdown: [], // Si hay más datos dinámicos, aquí se gestionan
          },
        ];
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
      },
    });
  }

  onTipoEspecialidadChange(tipoEspecialidad: number) {
    this.spinner.show();
    this.configuracionPlazosCasosService
      .obtenerEspecialidadPorId(tipoEspecialidad)
      .subscribe({
        next: (especialidades) => {
          this.spinner.hide();
          this.dataDropdowns[0].specialtiesDropdown = especialidades as any[];
        },
        error: (err) => {
          this.spinner.hide();
          console.error(err);
        },
      });
  }

  getDataDropdowns() {
    console.log("this.dataDropdowns antes del getData:",this.dataDropdowns)
    this.dataDropdowns = [
      {
        configuresDropdown: configuresData,
        taxDistrictsDropdown: taxDistrictsData,
        typeSpecialtiesDropdown: typeSpecialtiesData,
        specialtiesDropdown: specialtiesData,
        typeDeadlineDaysDropdown: typeDeadlineDaysData,
      },
    ];
    console.log("this.dataDropdowns después:",this.dataDropdowns)
  }

  getDataByTypeAndValue(type, value) {
    let dataArray;

    switch (type) {
      case 'distrito_fiscal':
        dataArray = taxDistrictsData;
        break;
      case 'tipo_especialidad':
        dataArray = typeSpecialtiesData;
        break;
      case 'especialidad':
        dataArray = specialtiesData;
        break;
      default:
        return null; // Retorna null si el tipo no es reconocido
    }

    return (
      dataArray.find((item) => item.value.toString() === value.toString()) ||
      null
    );
  }

  cleanFilters() {
    // simulando peticion
    this.plazos = [];
    this.getListPlazos();
  }

  actionPlazoConfiguracion(plazo?: any) {
    this.refModal = this.dialogService.open(ModalCrearEditarPlazoComponent, {
      header: plazo
        ? 'Editar Plazo para recibir caso derivado/acumulado'
        : 'Agregar Plazo para recibir caso derivado/acumulado',
      width: '768px',
      contentStyle: { overflow: 'auto' },
      data: {
        dropdownsData: {
          distritosFiscales: this.dataDropdowns[0].taxDistrictsDropdown,
          tiposEspecialidades: this.dataDropdowns[0].typeSpecialtiesDropdown,
          especialidades: this.dataDropdowns[0].specialtiesDropdown,
          tiposPlazosDias: this.dataDropdowns[0].typeDeadlineDaysDropdown,
        },
        plazoDetail: plazo ? plazo : null,
      },
    });
  }

  deletePlazo(plazo) {
    const request = {
      idPlazoCaso: plazo.codigoPlazo,
      usuariaDesactivacion: this.infoUsuario?.usuario.usuario,
    };

    this.spinner.show();

    this.subscriptions.push(
      this.configuracionPlazosCasosService
        .eliminarPlazoCaso(request)
        .subscribe({
          next: (resp) => {
            this.spinner.hide();
            if (resp.code == '0') {
              this.openModalSuccess('delete', plazo);
              this.getListPlazos();
            }
          },
          error: (error) => {
            this.spinner.hide();
            console.error(error);
          },
        })
    );
  }

  //refactorizado
  openModalConfirmAction(data) {
    if (!data) return;

    const { setAction, setPlazo } = data;
    const plazoEvaluarDias = setPlazo?.plazoEvaluar || null;
    const plazoEvaluarTipo = this.getPlazoEvaluarTipo(
      setPlazo?.tipoDiasEvaluar
    );
    const plazoConfigurado = setPlazo?.configuradoPor || null;

    const plazoDistritoFiscal = this.getDataIfExists(
      'distrito_fiscal',
      setPlazo?.idDistrito
    );
    const plazoTipoEspecialidad = this.getDataIfExists(
      'tipo_especialidad',
      setPlazo?.idTipoEspecialidad
    );
    const plazoEspecialidad = this.getDataIfExists(
      'especialidad',
      setPlazo?.idEspecialidad
    );

    const subTitle = this.buildSubTitle(
      setAction,
      plazoEvaluarDias,
      plazoEvaluarTipo,
      plazoConfigurado,
      plazoDistritoFiscal,
      plazoTipoEspecialidad,
      plazoEspecialidad
    );

    this.refModal = this.dialogService.open(ModalMensajeComponent, {
      width: '576px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning',
        title:
          setAction === 'delete'
            ? 'Eliminar Plazo para recibir caso derivado/acumulado '
            : '',
        subTitle,
        textButton: 'Aceptar',
        textButtonSecondary: 'Cancelar',
        onConfirm: () =>
          setAction === 'delete' && setPlazo
            ? this.deletePlazo(setPlazo)
            : null,
      },
    });
  }

  private getPlazoEvaluarTipo(tipoDiasEvaluar: number): string | null {
    return tipoDiasEvaluar === 925 || tipoDiasEvaluar === 926
      ? 'dias habiles'
      : null;
  }

  private getDataIfExists(type: string, value: any): any {
    return value ? this.getDataByTypeAndValue(type, value) : null;
  }

  private buildSubTitle(
    setAction: string,
    plazoEvaluarDias: any,
    plazoEvaluarTipo: string | null,
    plazoConfigurado: any,
    plazoDistritoFiscal: any,
    plazoTipoEspecialidad: any,
    plazoEspecialidad: any
  ): string {
    if (setAction !== 'delete') return '';

    let resultado = `Se guardó el plazo de ${plazoEvaluarDias} ${plazoEvaluarTipo} para recibir un caso, configurado por ${plazoConfigurado}`;

    if (plazoDistritoFiscal) {
      resultado += ` del distrito fiscal de ${plazoDistritoFiscal.name}`;
    }

    if (plazoTipoEspecialidad) {
      resultado += ` y Tipo de especialidad ${plazoTipoEspecialidad.name}`;
    }

    if (plazoEspecialidad) {
      resultado += ` y Especialidad ${plazoEspecialidad.name}`;
    }

    return resultado;
  }

  //refactorizado
  openModalSuccess(setAction: action, setPlazo: any) {
    if (!setPlazo) return;

    const plazoEvaluarDias = setPlazo.plazo_evaluar_cantidad || null;
    const plazoEvaluarTipo = this.getPlazoEvaluarTipoo(
      setPlazo.plazo_evaluar_tipo
    );
    const plazoConfigurado = setPlazo.configurado || null;

    const plazoDistritoFiscal = this.getDataIfExistss(
      'distrito_fiscal',
      setPlazo.distrito_fiscal
    );
    const plazoTipoEspecialidad = this.getDataIfExistss(
      'tipo_especialidad',
      setPlazo.tipo_especialidad
    );
    const plazoEspecialidad = this.getDataIfExistss(
      'especialidad',
      setPlazo.especialidad
    );

    const title = this.getModalTitle(setAction);
    const subTitle = this.buildSubTitlee(
      setAction,
      plazoEvaluarDias,
      plazoEvaluarTipo,
      plazoConfigurado,
      plazoDistritoFiscal,
      plazoTipoEspecialidad,
      plazoEspecialidad
    );

    this.refModal = this.dialogService.open(ModalMensajeComponent, {
      width: '576px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'success',
        title,
        subTitle,
        textButton: 'Listo',
      },
    });
  }

  private getPlazoEvaluarTipoo(plazoEvaluarTipo: number): string | null {
    return plazoEvaluarTipo === 925 || plazoEvaluarTipo === 926
      ? 'dias habiles'
      : null;
  }

  private getDataIfExistss(type: string, value: any): any {
    return value ? this.getDataByTypeAndValue(type, value) : null;
  }

  private getModalTitle(setAction: 'create' | 'save' | 'delete'): string {
    switch (setAction) {
      case 'create':
        return 'Plazo para recibir caso derivado/acumulado guardado';
      case 'save':
        return 'Plazo para recibir caso derivado/acumulado editado';
      case 'delete':
        return 'Plazo para recibir caso derivado/acumulado eliminado';
      default:
        return '';
    }
  }

  private buildSubTitlee(
    setAction: 'create' | 'save' | 'delete',
    plazoEvaluarDias: any,
    plazoEvaluarTipo: string | null,
    plazoConfigurado: any,
    plazoDistritoFiscal: any,
    plazoTipoEspecialidad: any,
    plazoEspecialidad: any
  ): string {
    switch (setAction) {
      case 'create':
        return `Se guardó el plazo de ${plazoEvaluarDias} ${plazoEvaluarTipo} para recibir un caso, ${this.construirDescripcionComun(
          plazoConfigurado,
          plazoDistritoFiscal,
          plazoTipoEspecialidad,
          plazoEspecialidad
        )}`;
      case 'save':
        return `Se guardaron los cambios en el plazo para recibir un caso, ${this.construirDescripcionComun(
          plazoConfigurado,
          plazoDistritoFiscal,
          plazoTipoEspecialidad,
          plazoEspecialidad
        )}`;
      case 'delete':
        return 'Se eliminó el plazo de documento recibido por derivación correctamente';
      default:
        return '';
    }
  }

  private construirDescripcionComun(
    plazoConfigurado: any,
    plazoDistritoFiscal: any,
    plazoTipoEspecialidad: any,
    plazoEspecialidad: any
  ): string {
    let resultado = `configurado por ${plazoConfigurado}`;

    if (plazoDistritoFiscal) {
      resultado += ` del distrito fiscal de ${plazoDistritoFiscal.name}`;
    }

    if (plazoTipoEspecialidad) {
      resultado += ` y Tipo de especialidad ${plazoTipoEspecialidad.name}`;
    }

    if (plazoEspecialidad) {
      resultado += ` y Especialidad ${plazoEspecialidad.name}`;
    }

    return resultado;
  }

  openModalErrorSuccess(messageError: string) {
    if (!messageError) return;
    this.refModal = this.dialogService.open(ModalMensajeComponent, {
      width: '576px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning',
        subTitle: messageError,
        textButton: 'Listo',
      },
    });
  }

  ngOnDestroy(): void {
    if (this.modalSuccessSubscription)
      this.modalSuccessSubscription.unsubscribe();
  }
}
