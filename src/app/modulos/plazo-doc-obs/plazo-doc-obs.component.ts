import { NgIf, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuscarPlazoDocObsRes, BuscarPlazoDocObsRow, BuscarPlazoReq, TipoConfiguracionPlazo, DistritoFiscalDTOB, EspecialidadDTOB, InsertarPlazoRes, PlazoForm, TipoDias, TipoEspecialidadDTOB, ActualizarPlazoRes, EliminarPlazoRes, EliminarPlazoReq } from '@interfaces/plazo-doc-obs/BuscarPlazoDocObsRes';
import { PlazoDocObsService } from '@services/plazo-doc-obs/plazo-doc-obs.service';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Auth2Service } from "@services/auth/auth2.service";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { obtenerIcono } from "@utils/icon";
import { CmpLibModule } from "ngx-mpfn-dev-cmp-lib";

@Component({
  selector: 'app-plazo-doc-obs',
  standalone: true,
  templateUrl: './plazo-doc-obs.component.html',
  styleUrls: ['./plazo-doc-obs.component.scss'],
  imports: [
    TableModule, ToastModule, DialogModule, ConfirmDialogModule,
    MenuModule, NgIf, CalendarModule,
    DialogModule, FormsModule, ReactiveFormsModule, InputTextModule,
    DropdownModule, InputNumberModule, CommonModule, CmpLibModule
  ],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class PlazoDocObsComponent {
  //formulario para el filtro de busqueda
  formFiltroBuscar: FormGroup;

  buscarPlazoReq: BuscarPlazoReq;
  buscarPlazoRes: BuscarPlazoDocObsRes;
  buscarPlazoResLst: BuscarPlazoDocObsRow[];
  buscarPlazoResLstTotal: number = 0
  plazoSelected: BuscarPlazoDocObsRow;

  distritoFiscalLst: DistritoFiscalDTOB[] = [];
  tipoEspecialidadLst: TipoEspecialidadDTOB[] = [];
  especialidadLst: EspecialidadDTOB[] = [];

  //NUEVO REGISTRO
  //flag de la ventana modal donde se muestra el formulario de nuevo registro
  isVisibleModalNewForm: boolean;
  //formulario para los campos de nuevo registro y edicion
  formGroup: FormGroup;
  //flag para actualizar true para editar y false para nuevo registro
  isEditForm: boolean = false;

  plazoForm: PlazoForm;

  //constantes dado que necesitamos sus valores para poder mostrar u ocultar dependiendo de la elección
  idNTipoConfiguracion_Seleccione: number;
  //idNTipoConfiguracion_Nacional: number;//no es parte
  idNTipoConfiguracion_DistritoFiscal: number;
  idNTipoConfiguracion_TipoDeEspecialidad: number;
  idNTipoConfiguracion_Especialidad: number;

  //flag para mostrar u ocultar los filtros
  show_filtro_DistritoFiscal: boolean = false;
  show_filtro_TipoDeEspecialidad: boolean = false;
  show_filtro_Especialidad: boolean = false;

  tipoConfiguracionPlazoLst: TipoConfiguracionPlazo[] = []
  // tipoConfiguracionPlazoLst: TipoConfiguracionPlazo[] = [
  //   { idNTipoConfiguracion: this.idNTipoConfiguracion_Nacional, noVDescripcion: "Nacional" },
  //   { idNTipoConfiguracion: this.idNTipoConfiguracion_DistritoFiscal, noVDescripcion: "Distrito Fiscal" },
  //   { idNTipoConfiguracion: this.idNTipoConfiguracion_TipoDeEspecialidad, noVDescripcion: "Tipo de Especialidad" },
  //   { idNTipoConfiguracion: this.idNTipoConfiguracion_Especialidad, noVDescripcion: "Especialidad" }
  // ]

  tipoDiasLst: TipoDias[];

  //variables para items
  actionItems: MenuItem[];

  //Datos para modal notificaciones
  isVisibleModalNotification: boolean;
  modalNotificationTitle: string;
  modalNotificationMsg: string;
  modalNotificationType: string = 'success';//success, danger, warning,

  //dinamic dialog for confirm:
  public refModal: DynamicDialogRef;

  //información del usuario en sesion
  public usuarioSesion;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly messageService: MessageService,
    private readonly plazoDocObsService: PlazoDocObsService,
    private readonly userService: Auth2Service,
    public readonly dialogService: DialogService,
  ) {

  }
  ngOnInit() {
    //obligatorio crear objeto
    this.cleanForm();

    this.limpiarFiltrosBusqueda();
    this.getTipoConfiguracionLst();
    this.getDistritoFiscalLst();
    this.getTipoEspecialidadLst();
    this.buscarPlazoFormFiltro();
    this.actionItems = [
      {
        label: 'Editar',
         command: () => {
          this.editPlazoForm(this.plazoSelected)
        }
      },
      {
        label: 'Eliminar',
       
        command: () => {
          this.deletePlazoForm(this.plazoSelected)
        }
      },
    ];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }

  itemSelected(activeItem: any) {
    this.plazoSelected = activeItem;
  }

  limpiarFiltrosBusqueda() {
    this.formFiltroBuscar = this.formBuilder.group({
      idNTipoConfiguracion: new FormControl(null,),
      idNDistritoFiscal: new FormControl(null,),
      idNTipoEspecialidad: new FormControl(null,),
      idVEspecialidad: new FormControl(null,),
    });

    this.buscarPlazoFormFiltro();
  }

  //retorna tipo de configuración y traslada a las variables cuyos valores ya no deberán cambiarse.
  getTipoConfiguracionLst() {
    this.plazoDocObsService.getTipoConfiguracionLst().subscribe({
      next: (response) => {

        response.sort((a, b) => 
          a.noVDescripcion.localeCompare(b.noVDescripcion)
        );

        this.tipoConfiguracionPlazoLst = response;

        //validacion de retorno de 3 registros, 4 incluido "Configurado Por"
        if (this.tipoConfiguracionPlazoLst.length != 3) {
          const noVDescripcionesConComas: string = this.tipoConfiguracionPlazoLst
            .map(configuracion => configuracion.noVDescripcion)
            .join(', ');

          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Faltan datos',
              description: `Faltan datos para "Tipo de Configuración" donde se esperaba: Nivel Nacional, Distrito Fiscal, Tipo de Especialidad, Especialidad y sólo se ha encontrado: ${noVDescripcionesConComas}.
              Debido a ello, es posible que se presenten problemas.`,
              confirmButtonText: 'Listo'
            },
          });

          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.onCloseModal()
              }
            },
            error: (err) => {
              console.error('Error.', err);
              throw new Error('Error');
            },
          });

        } else {
          this.idNTipoConfiguracion_DistritoFiscal = this.tipoConfiguracionPlazoLst[0].idNTipoConfiguracion;
          this.idNTipoConfiguracion_TipoDeEspecialidad = this.tipoConfiguracionPlazoLst[1].idNTipoConfiguracion;
          this.idNTipoConfiguracion_Especialidad = this.tipoConfiguracionPlazoLst[2].idNTipoConfiguracion;
        }

      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getDistritoFiscalLst() {
    this.plazoDocObsService.getDistritoFiscalLst().subscribe({
      next: (response) => {

        response.sort((a, b) => 
          a.noVDistritoFiscal.localeCompare(b.noVDistritoFiscal)
        );

        this.distritoFiscalLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getEspecialidadLst(idTipoEspecialidad: number) {
    this.plazoDocObsService.getEspecialidadLst(idTipoEspecialidad).subscribe({
      next: (response) => {
        response.sort((a, b) => 
          a.noVEspecialidad.localeCompare(b.noVEspecialidad)
        );
        this.especialidadLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getTipoEspecialidadLst() {
    this.plazoDocObsService.getTipoEspecialidadLst().subscribe({
      next: (response) => {

        response.sort((a, b) => 
          a.noVTipoEspecialidad.localeCompare(b.noVTipoEspecialidad)
        );
        this.tipoEspecialidadLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  getTipoEspecialidadLstPorDF(idNDistritoFiscal: number) {
    this.plazoDocObsService.getTipoEspecialidadLstPorDF(idNDistritoFiscal).subscribe({
      next: (response) => {
        response.sort((a, b) =>
          a.noVTipoEspecialidad.localeCompare(b.noVTipoEspecialidad)
        );
        this.tipoEspecialidadLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  buscarPlazoFormFiltro() {
    this.buscarPlazoReq = { pages: 5, perPage: 1, filtros: { ...this.formFiltroBuscar.value } };
    this.plazoDocObsService.buscarPlazoFormFiltro(this.buscarPlazoReq).subscribe({
      next: (response) => {
        this.buscarPlazoRes = response;
        this.buscarPlazoResLst = response.registros;
        this.buscarPlazoResLstTotal = response.totalElementos;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error al consultar datos.' });
      }
      
    });
  }

  openModalFormNew() {
    this.cleanForm()
    this.isVisibleModalNewForm = true;
    this.isEditForm = false;
    this.getDistritoFiscalLst();
    this.getTipoEspecialidadLst();
    this.getTipoDias();

  }

  exportarExcelForm() {
    this.buscarPlazoReq = { pages: 5, perPage: 1, filtros: { ...this.formFiltroBuscar.value } };
    this.plazoDocObsService.exportarexcel(this.buscarPlazoReq).subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'ListadoPlazoDocObs.xlsx';
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: '', detail: 'Error al consultar datos.' });
      }
    });
  }

  onCloseModal() {
    this.isVisibleModalNewForm = false;
  }

  cleanForm() {
    this.plazoForm = Object.create(null)
    this.plazoForm.idNTipoConfiguracion = this.idNTipoConfiguracion_DistritoFiscal;
    this.asignarPlazoForm(this.plazoForm)
  }

  asignarPlazoForm(plazoForm: PlazoForm) {
    this.formGroup = this.formBuilder.group({
      idVPlazoCaso: new FormControl(plazoForm.idVPlazoCaso,),
      idNTipoConfiguracion: new FormControl('' + plazoForm.idNTipoConfiguracion, [Validators.required]),
      idNDistritoFiscal: new FormControl(plazoForm.idNDistritoFiscal),
      idNTipoEspecialidad: new FormControl(plazoForm.idNTipoEspecialidad,),
      idVEspecialidad: new FormControl(plazoForm.idVEspecialidad,),
      nuNPlazoEvaluar: new FormControl(plazoForm.nuNPlazoEvaluar, [Validators.required]),
      nuNPlazoAlerta: new FormControl(plazoForm.nuNPlazoAlerta, [Validators.required]),
      idNTipoDiasEvaluar: new FormControl(plazoForm.idNTipoDiasEvaluar, [Validators.required]),
      idNTipoDiasAlerta: new FormControl(plazoForm.idNTipoDiasAlerta, [Validators.required]),
    })
  }

  cancelarForm() {
    this.onCloseModal();
  }

  getTipoDias() {
    this.plazoDocObsService.getTipoDias().subscribe({
      next: (response) => {
        response.sort((a, b) => 
          a.noVDescripcion.localeCompare(b.noVDescripcion)
        );
        this.tipoDiasLst = response;
      },
      error: (err) => {
        console.error("error al leer datos del servidor. ", err);
      }
    })
  }

  async validarUnicidadTipoConfigXEspecialidad(): Promise<boolean> {

    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    const idNDistritoFiscal: number = this.formGroup.get('idNDistritoFiscal').value;
    const idNTipoEspecialidad: number = this.formGroup.get('idNTipoEspecialidad').value;
    const idVEspecialidad: string = this.formGroup.get('idVEspecialidad').value;

    if (idNTipoConfiguracion == null || idNDistritoFiscal == null || idNTipoEspecialidad == null || idVEspecialidad == null) {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Complete Distrito Fiscal, Tipo de Especialidad y Especialidad' });
      return false;
    } else {

      try {
        const isValid = await this.plazoDocObsService.validarUnicidadTipoConfigXEspecialidad(
          idNTipoConfiguracion, idNDistritoFiscal, idNTipoEspecialidad, idVEspecialidad
        );
        if (!isValid) {
          this.messageService.add({ severity: 'warn', summary: '', detail: 'Ya tiene registrada una configuración con Distrito Fiscal, Tipo de Especialidad y Especialidad indicados' });
        }

        return isValid;

      } catch (error) {
        console.error('Error during validation:', error);
        return false;
      }
    }

  }

  async validarUnicidadTipoConfigXTipEspecialidad(): Promise<boolean> {

    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    const idNDistritoFiscal: number = this.formGroup.get('idNDistritoFiscal').value;
    const idNTipoEspecialidad: number = this.formGroup.get('idNTipoEspecialidad').value;
    /**const idVEspecialidad: string = this.formGroup.get('idVEspecialidad').value;**/

    if (idNTipoConfiguracion == null || idNDistritoFiscal == null || idNTipoEspecialidad == null) {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Complete Distrito Fiscal y Tipo de Especialidad' });
      return false;
    } else {

      try {
        const isValid = await this.plazoDocObsService.validarUnicidadTipoConfigXTipEspecialidad(
          idNTipoConfiguracion, idNDistritoFiscal, idNTipoEspecialidad
        );
        if (!isValid) {
          this.messageService.add({ severity: 'warn', summary: '', detail: 'Ya tiene registrada una configuración con Distrito Fiscal y Tipo de Especialidad indicados' });
        }

        return isValid;

      } catch (error) {
        console.error('Error during validation:', error);
        return false;
      }
    }

  }

  async validarUnicidadTipoConfigXDistritoFiscal(): Promise<boolean> {

    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    const idNDistritoFiscal: number = this.formGroup.get('idNDistritoFiscal').value;
    /**const idNTipoEspecialidad: number = this.formGroup.get('idNTipoEspecialidad').value;
    const idVEspecialidad: string = this.formGroup.get('idVEspecialidad').value;**/

    if (idNTipoConfiguracion == null || idNDistritoFiscal == null) {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Complete Distrito Fiscal' });
      return false;
    } else {
      try {
        const isValid = await this.plazoDocObsService.validarUnicidadTipoConfigXDistritoFiscal(idNTipoConfiguracion, idNDistritoFiscal);
        if (!isValid) {
          this.messageService.add({ severity: 'warn', summary: '', detail: 'Ya tiene registrada una configuración con Distrito Fiscal  indicado' });
        }

        return isValid;

      } catch (error) {
        console.error('Error during validation:', error);
        return false;
      }
    }
  }

  async validarUnicidadTipoConfigXEspecialidadUpd(): Promise<boolean> {
    const idVPlazoCaso: string = this.formGroup.get('idVPlazoCaso').value;
    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    const idNDistritoFiscal: number = this.formGroup.get('idNDistritoFiscal').value;
    const idNTipoEspecialidad: number = this.formGroup.get('idNTipoEspecialidad').value;
    const idVEspecialidad: string = this.formGroup.get('idVEspecialidad').value;

    if (idNTipoConfiguracion == null || idNDistritoFiscal == null || idNTipoEspecialidad == null || idVEspecialidad == null) {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos' });
      return false;
    } else {

      try {
        const isValid = await this.plazoDocObsService.validarUnicidadTipoConfigXEspecialidadUpd(
          idVPlazoCaso, idNTipoConfiguracion, idNDistritoFiscal, idNTipoEspecialidad, idVEspecialidad
        );
        if (!isValid) {
          this.messageService.add({ severity: 'warn', summary: '', detail: 'Ya tiene registrada una configuración con Distrito Fiscal, Tipo de Especialidad y Especialidad indicados' });
        }

        return isValid;

      } catch (error) {
        console.error('Error during validation:', error);
        return false;
      }
    }

  }

  async validarUnicidadTipoConfigXTipEspecialidadUpd(): Promise<boolean> {
    const idVPlazoCaso: string = this.formGroup.get('idVPlazoCaso').value;
    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    const idNDistritoFiscal: number = this.formGroup.get('idNDistritoFiscal').value;
    const idNTipoEspecialidad: number = this.formGroup.get('idNTipoEspecialidad').value;
    /**const idVEspecialidad: string = this.formGroup.get('idVEspecialidad').value;**/

    if (idNTipoConfiguracion == null || idNDistritoFiscal == null || idNTipoEspecialidad == null) {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos' });
      return false;
    } else {

      try {
        const isValid = await this.plazoDocObsService.validarUnicidadTipoConfigXTipEspecialidadUpd(
          idVPlazoCaso, idNTipoConfiguracion, idNDistritoFiscal, idNTipoEspecialidad
        );
        if (!isValid) {
          this.messageService.add({ severity: 'warn', summary: '', detail: 'Ya tiene registrada una configuración con Distrito Fiscal y Tipo de Especialidad indicados' });
        }

        return isValid;

      } catch (error) {
        console.error('Error during validation:', error);
        return false;
      }
    }

  }

  async validarUnicidadTipoConfigXDistritoFiscalUpd(): Promise<boolean> {
    const idVPlazoCaso: string = this.formGroup.get('idVPlazoCaso').value;
    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    const idNDistritoFiscal: number = this.formGroup.get('idNDistritoFiscal').value;
    /**const idNTipoEspecialidad: number = this.formGroup.get('idNTipoEspecialidad').value;
    const idVEspecialidad: string = this.formGroup.get('idVEspecialidad').value;**/

    if (idNTipoConfiguracion == null || idNDistritoFiscal == null) {
      this.messageService.add({ severity: 'warn', summary: '', detail: 'Campos sin completar o inválidos' });
      return false;
    } else {
      try {
        const isValid = await this.plazoDocObsService.validarUnicidadTipoConfigXDistritoFiscalUpd(idVPlazoCaso, idNTipoConfiguracion, idNDistritoFiscal);
        if (!isValid) {
          this.messageService.add({ severity: 'warn', summary: '', detail: 'Ya tiene registrada una configuración con Distrito Fiscal  indicado' });
        }

        return isValid;

      } catch (error) {
        console.error('Error during validation:', error);
        return false;
      }
    }
  }

  async addForm() {

    //validacion del formulario
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const nuNPlazoEvaluar: number = this.formGroup.get('nuNPlazoEvaluar').value;
    const nuNPlazoAlerta: number = this.formGroup.get('nuNPlazoAlerta').value;
    if (nuNPlazoAlerta > nuNPlazoEvaluar) {
      this.messageService.add({ severity: 'error', summary: '', detail: '"Plazo para subsanar documento observado" debe ser mayor a "Plazo para mostrar alerta de vencimiento".' });
      return;
    }

    //validacion de unicidad de tipo de configuración de los 3 casos
    const isValid_TipconfigServer: boolean = await this.validacionUnicidadTipoConfiguracion();
    if (!isValid_TipconfigServer) {
      return;
    }

    /**
    // this.confirmarAgregarRegistro('question');
    // this.refModal.onClose.subscribe({
    //   next: (resp) => {
    //     if (resp === 'confirm') {
    //       this._addForm();
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error al agregar registro.', err);
    //     throw new Error('Error al agregar registro');
    //   },
    // });**/

    this._addForm();

  }

  async _addForm() {

    this.plazoForm = {
      ...this.formGroup.value,
      flCTipoBandeja: 2,//siempre es 2 para este cus
      coVUsCreacion: this.usuarioSesion?.usuario.usuario,
    }

    const insertarPlazoRes: InsertarPlazoRes = await this.plazoDocObsService.insertarPlazo(this.plazoForm);

    if (insertarPlazoRes.PO_V_ERR_COD == '0') {

      const noNTipoConfiguracion: string = this.buscarNoTipoConfiguracionPorId(+this.plazoForm.idNTipoConfiguracion)

      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'success',
          title: 'Plazo para subsanar documento observado guardado',
          description: `Se guardó el plazo de <b>"${this.plazoForm.nuNPlazoEvaluar}"</b> días para subsanar un documento observado, configurado por ${noNTipoConfiguracion}`,
          confirmButtonText: 'Listo'
        },
      });

      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.limpiarFiltrosBusqueda()
            this.onCloseModal()
            this.buscarPlazoFormFiltro();
          }
        },
        error: (err) => {
          console.error('Error al agregar registro.', err);
          throw new Error('Error al agregar registro');
        },
      });

    } else {
      this.messageService.add({ severity: 'error', summary: 'Rejected', detail: insertarPlazoRes.PO_V_ERR_MSG });
    }
  }

  /*
  onOpenModalNotificationWarning(title: string, msg: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationType = 'warning';
    this.isVisibleModalNotification = true;

  }

  onOpenModalNotificationError(title: string, msg: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationType = 'danger';
    this.isVisibleModalNotification = true;
  }

  //default success
  onOpenModalNotificationSuccess(title: string, msg: string) {
    this.modalNotificationTitle = title;
    this.modalNotificationMsg = msg;
    this.modalNotificationType = 'success';
    this.isVisibleModalNotification = true;
  }

  onCloseModalNotification() {
    this.isVisibleModalNotification = false;
    this.onCloseModal();
  }
  */

  //función que me permita encontrar el noConfiguradoPor a partir del idNTipoConfiguracion
  buscarNoTipoConfiguracionPorId(id: number): string | undefined {
    const resultado = this.tipoConfiguracionPlazoLst.find(config => config.idNTipoConfiguracion === id);
    return resultado ? resultado.noVDescripcion : undefined;
  }

  async editPlazoForm(plazoSelected: BuscarPlazoDocObsRow) {
    const plazoFormEdit: PlazoForm = await this.plazoDocObsService.getPlazoDocObs(plazoSelected.idVPlazoCaso)
    const idNTipoConfiguracion: number = plazoFormEdit.idNTipoConfiguracion;
    this.isEditForm = true;
    this.isVisibleModalNewForm = true;
    this.plazoForm = plazoFormEdit;
    this.asignarPlazoForm(this.plazoForm)
    this.getDistritoFiscalLst();
    this.getTipoEspecialidadLst();
    this.getTipoDias();

    //caso 3. //validación para especialidad
    if (idNTipoConfiguracion == this.idNTipoConfiguracion_Especialidad) {

      this.getEspecialidadLst(plazoFormEdit.idNTipoEspecialidad);
    }
  }

  deletePlazoForm(plazoSelected: BuscarPlazoDocObsRow) {

    this.confirmarEliminarRegistro('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this._deletePlazoForm(plazoSelected);
        }
      },
      error: (err) => {
        console.error('Error al actualizar registro.', err);
        throw new Error('Error al actualizar registro');
      },
    });
  }

  async _deletePlazoForm(plazoSelected: BuscarPlazoDocObsRow) {
    const eliminarPlazoReq: EliminarPlazoReq = {
      idVPlazoCaso: this.plazoForm.idVPlazoCaso,
      esCPlazoCaso: '1',
      coVUsModificacion: this.usuarioSesion?.usuario.usuario,
      coVUsDesactivacion: this.usuarioSesion?.usuario.usuario,
    }

    const eliminarPlazoRes: EliminarPlazoRes = await this.plazoDocObsService.eliminarPlazo(eliminarPlazoReq);

    if (eliminarPlazoRes.PO_V_ERR_COD == '0') {
      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'success',
          title: 'Plazo para subsanar documento observado eliminado',
          description: `Se eliminó el plazo para subsanar un documento observado correctamente.`,
          confirmButtonText: 'Listo'
        },
      });

      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.limpiarFiltrosBusqueda()
            this.onCloseModal()
            this.buscarPlazoFormFiltro();
          }
        },
        error: (err) => {
          console.error('Error.', err);
          throw new Error('Error');
        },
      });

    } else {
      this.messageService.add({ severity: 'error', summary: 'Rejected', detail: eliminarPlazoRes.PO_V_ERR_MSG });
    }
  }

  //validacion de unicidad de tipo de configuración de los 3 casos
  async validacionUnicidadTipoConfiguracion() {
    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    let isValid_TipconfigServer: boolean = false;

    //caso 3. //validación para especialidad
    if (idNTipoConfiguracion == this.idNTipoConfiguracion_Especialidad) {
      isValid_TipconfigServer = await this.validarUnicidadTipoConfigXEspecialidad();
    }

    //caso 2. //validacion para tipo de especialidad
    else if (idNTipoConfiguracion == this.idNTipoConfiguracion_TipoDeEspecialidad) {
      isValid_TipconfigServer = await this.validarUnicidadTipoConfigXTipEspecialidad();
    }

    //caso 1. //validacion para DF
    else if (idNTipoConfiguracion == this.idNTipoConfiguracion_DistritoFiscal) {
      isValid_TipconfigServer = await this.validarUnicidadTipoConfigXDistritoFiscal();
    }
    return isValid_TipconfigServer;
  }

  //validacion de unicidad de tipo de configuración de los 3 casos
  async validUnicidadTipoConfiguracionUpd() {
    const idNTipoConfiguracion: number = this.formGroup.get('idNTipoConfiguracion').value;
    let isValid_TipconfigServer: boolean = false;

    //caso 3. //validación para especialidad
    if (idNTipoConfiguracion == this.idNTipoConfiguracion_DistritoFiscal) {
      isValid_TipconfigServer = await this.validarUnicidadTipoConfigXDistritoFiscalUpd();

    }

    //caso 2. //validacion para tipo de especialidad
    else if (idNTipoConfiguracion == this.idNTipoConfiguracion_TipoDeEspecialidad) {
      isValid_TipconfigServer = await this.validarUnicidadTipoConfigXTipEspecialidadUpd();

    }

    //caso 1. //validacion para DF
    else if (idNTipoConfiguracion == this.idNTipoConfiguracion_Especialidad) {
      isValid_TipconfigServer = await this.validarUnicidadTipoConfigXEspecialidadUpd();
    }
    return isValid_TipconfigServer;
  }

  onChangeTipoEspecialidad(idNTipoEspecialidad: number) {
    this.getEspecialidadLst(idNTipoEspecialidad);

  }

  async updForm() {

    //validacion del formulario
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const nuNPlazoEvaluar: number = this.formGroup.get('nuNPlazoEvaluar').value;
    const nuNPlazoAlerta: number = this.formGroup.get('nuNPlazoAlerta').value;
    if (nuNPlazoAlerta > nuNPlazoEvaluar) {
      this.messageService.add({ severity: 'error', summary: '', detail: '"Plazo para subsanar documento observado" debe ser mayor a "Plazo para mostrar alerta de vencimiento".' });
      return;
    }

    //validacion de unicidad de tipo de configuración de los 3 casos
    const isValid_TipconfigServer: boolean = await this.validUnicidadTipoConfiguracionUpd();
    if (!isValid_TipconfigServer) {
      return;
    }

    this.confirmarActualizarRegistro('question');
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this._updForm();
        }
      },
      error: (err) => {
        console.error('Error al actualizar registro.', err);
        throw new Error('Error al actualizar registro');
      },
    });

  }
  async _updForm() {

    this.plazoForm = {
      ...this.formGroup.value,
      usrModifica: this.usuarioSesion?.usuario.usuario,
    }

    const noNTipoConfiguracion: string = this.buscarNoTipoConfiguracionPorId(+this.plazoForm.idNTipoConfiguracion)

    /**
    // this.confirmationService.confirm({
    //   message: `¿Estás seguro de cambiar el plazo para todas las fiscalías a la opción configurado por ${noNTipoConfiguracion}?.
    //   Esta acción DESACTIVARÁ de manera automática todas las configuraciones registradas (por Distritos Fiscales, Tipo de Especialidades y/o Especialidades)
    //   dejando solo la configuracion por ${noNTipoConfiguracion} para todas las fiscalías, esta acción no se podrá revertir ¿Desea continuar?`,
    //   header: 'Confirmación',
    //   icon: 'pi pi-exclamation-triangle',
    //   acceptLabel: 'Aceptar',
    //   rejectLabel: 'Cancelar',
    //   accept: async () => {
    //
    //   },
    //   reject: (type) => {
    //     switch (type) {
    //       case ConfirmEventType.REJECT:
    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Rechazaste la acción' });
    //         break;
    //       case ConfirmEventType.CANCEL:
    //         this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'Cancelaste la acción' });
    //         break;
    //     }
    //   }
    // });**/

    const actualizarPlazoRes: ActualizarPlazoRes = await this.plazoDocObsService.actualizarPlazo(this.plazoForm);

    if (actualizarPlazoRes.PO_V_ERR_COD == '0') {
      this.refModal = this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'success',
          title: 'Plazo para subsanar documento observado editado',
          description: `Se guardó los cambios en el plazo para subsanar un documento observado, configurado por <b>${noNTipoConfiguracion}</b>`,
          confirmButtonText: 'Listo'
        },
      });

      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.limpiarFiltrosBusqueda()
            this.onCloseModal()
            this.buscarPlazoFormFiltro();
          }
        },
        error: (err) => {
          console.error('Error.', err);
          throw new Error('Error');
        },
      });

    } else {
      this.messageService.add({ severity: 'error', summary: 'Rejected', detail: actualizarPlazoRes.PO_V_ERR_MSG });
    }
  }

  onChangeTipoConfiguracionFilter(idNTipoConfiguracion: number) {
    if (idNTipoConfiguracion == this.idNTipoConfiguracion_Seleccione) {
      //para Seleccione
      this.show_filtro_DistritoFiscal = false
      this.show_filtro_TipoDeEspecialidad = false
      this.show_filtro_Especialidad = false
    }
    // else if (idNTipoConfiguracion == this.idNTipoConfiguracion_Nacional) {
    //   //para nivel nacional
    //   this.show_filtro_DistritoFiscal = false
    //   this.show_filtro_TipoDeEspecialidad = false
    //   this.show_filtro_Especialidad = false
    // }
    else if (idNTipoConfiguracion == this.idNTipoConfiguracion_DistritoFiscal) {
      //para DF
      this.show_filtro_DistritoFiscal = true
      this.show_filtro_TipoDeEspecialidad = false
      this.show_filtro_Especialidad = false
    } else if (idNTipoConfiguracion == this.idNTipoConfiguracion_TipoDeEspecialidad) {
      //para tipo de especialidad
      this.show_filtro_DistritoFiscal = true
      this.show_filtro_TipoDeEspecialidad = true
      this.show_filtro_Especialidad = false
    } else if (idNTipoConfiguracion == this.idNTipoConfiguracion_Especialidad) {
      //para especialidad
      this.show_filtro_DistritoFiscal = true
      this.show_filtro_TipoDeEspecialidad = true
      this.show_filtro_Especialidad = true
    }

    this.buscarPlazoFormFiltro();
  }

  onChangeBuscarXFiltro() {
    this.buscarPlazoFormFiltro();
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  // private confirmarAgregarRegistro(icon: string): void {
  //
  //   //const noVEntidad=this.formGroup.get('noVEntidad').value
  //   const noVEntidad="Entidad"
  //
  //   this.refModal = this.dialogService.open(AlertModalAComponent, {
  //     width: '750px',
  //     showHeader: false,
  //     data: {
  //       icon: icon,
  //       title: 'REGISTRAR FISCALÍA',
  //       confirm: true,
  //       description:
  //         'A continuación, se procederá a registrar los datos de la fiscalía ' +
  //         `<b>"${noVEntidad}"</b>` +
  //         '¿Esta seguro de realizar esta acción?',
  //       confirmButtonText: 'Aceptar'
  //     },
  //   });
  // }

  private confirmarActualizarRegistro(icon: string): void {
    const noNTipoConfiguracion: string = this.buscarNoTipoConfiguracionPorId(+this.plazoForm.idNTipoConfiguracion)

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Editar Plazo para subsanar un documento observado',
        confirm: true,
        description:
          `¿Está seguro de cambiar el plazo para todas las fiscalías a la opción configurado por <b>${noNTipoConfiguracion}</b>?` +
          `<br>` +
          `<br> Esta acción <b>DESACTIVARÁ</b> de manera automática todas las configuraciones registradas
            (por Distritos Fiscales, Tipos de Especialidades y/o Especialidades) dejando sólo la configuración
            por Nivel Nacional para todas las Fiscalías, esta acción no se podrá revertir ¿Desea continuar?`,
        confirmButtonText: 'Aceptar'
      },
    });
  }

  private confirmarEliminarRegistro(icon: string): void {
    const noNTipoConfiguracion: string = this.plazoSelected.noVDescripcion;

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Eliminar Plazo para subsanar un documento observado',
        confirm: true,
        description:
          `¿Está seguro de eliminar el plazo configurado por <b>${noNTipoConfiguracion}</b>?`,
        confirmButtonText: 'Aceptar'
      },
    });
  }

  protected readonly obtenerIcono = obtenerIcono;
}
