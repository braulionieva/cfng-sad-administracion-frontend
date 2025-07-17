import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { InputNumberModule } from "primeng/inputnumber";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { NgIf } from "@angular/common";
import { PanelModule } from "primeng/panel";
import { RadioButtonModule } from "primeng/radiobutton";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ConfirmationService, MessageService, SharedModule } from "primeng/api";
import { TabViewModule } from "primeng/tabview";
import { TableModule } from "primeng/table";
import {
  AplicacionDTOB, AplicacionForm, AgregarAplicacionReq, BuscarAplicacioRes, CategoriaResponse, DataModal, DisponibilidadResponse
} from '@interfaces/aplicacion-bandeja/aplicacionBean';
import { FormGettersAplicacion } from './form-getters-aplicacion';
import { AdminAplicacionService } from "@services/aplicacion-bandeja/admin-aplicacion.service";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { NgxSpinnerService } from "ngx-spinner";
import { Auth2Service } from "@services/auth/auth2.service";
import {ModalNotificationService} from "@services/modal-notification/modal-notification.service";

@Component({
  selector: 'app-add-edit-aplicacion',
  standalone: true,
  templateUrl: './add-edit-aplicacion.component.html',
  imports: [
    ButtonModule,
    CalendarModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    InputSwitchModule,
    InputTextModule,
    NgIf,
    PanelModule,
    RadioButtonModule,
    ReactiveFormsModule,
    SharedModule,
    TabViewModule,
    TableModule,
  ],
  styleUrls: ['./add-edit-aplicacion.component.scss'],
  providers: [MessageService, ConfirmationService, DialogService,ModalNotificationService]
})

export class AddEditAplicacionComponent implements OnInit {
  @Input() dataModal: DataModal;
  @Output() closeModal = new EventEmitter<any>();
  @Output() closeModalResponse: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeModalAndUpdate = new EventEmitter<any>();

  //flag para nuevo o editar
  isEditForm: boolean;

  formGroup: FormGroup
  formGetters: FormGettersAplicacion;

  originalValues: any;
  isFormUnchanged = true;

  //opciones para el listado de aplicaciones
  aplicacionSelected: BuscarAplicacioRes;

  aplicacionPadreLst: AplicacionDTOB[];
  disponibilidadLst: DisponibilidadResponse[];
  categoriaLst: CategoriaResponse[];

  // Mensajes de error
  errorMessages = {
    coVAplicacion: {
      required: 'El código es requerido.',
      maxlength: 'El código no puede exceder 10 caracteres.',
      pattern: 'No debe tener espacios consecutivos.'
    },
    noVAplicacion: {
      required: 'El nombre de la aplicación es requerido.',
      maxlength: 'El nombre no puede exceder 90 caracteres.',
      pattern: 'No debe tener espacios consecutivos.'
    },
    deVSiglas: {
      required: 'Las siglas son requeridas.',
      maxlength: 'Las siglas no pueden exceder 20 caracteres.',
      pattern: 'No debe tener espacios consecutivos.'
    },
    deVRuta: {
      required: 'La ruta es requerida.',
      maxlength: 'La ruta no puede exceder 400 caracteres.',
      pattern: 'No debe tener espacios consecutivos.'
    },
    deVClaseColor: {
      required: 'El color es requerido.',
      pattern: 'El color debe ser un valor hexadecimal válido (por ejemplo, #FF0000).'
    },
    feDLanzto: {
      required: 'La fecha de lanzamiento es requerida.'
    },
    deVVersion: {
      required: 'La versión es requerida.',
      maxlength: 'La versión no puede exceder 12 caracteres.',
      pattern: 'La versión debe contener solo números y puntos.'
    },
    feDVersion: {
      required: 'La fecha de versión es requerida.'
    },
    flCVer: {
      required: 'El estado es requerido.'
    },
    idNCategoria: {
      required: 'La categoría es requerida.'
    }
  };

  //dinamic dialog for confirm:
  refModal: DynamicDialogRef;

  //usuario session
  public usuarioSesion;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly aplicacionService: AdminAplicacionService,
    public readonly dialogService: DialogService,
    private readonly spinner: NgxSpinnerService,
    private readonly userService: Auth2Service,
    private readonly cdr: ChangeDetectorRef,
    private readonly modalNotificationService: ModalNotificationService,
  ) {
  }

  ngOnInit() {
    this.initForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }

  initForm(){
    let aplicacionForm: AplicacionForm = Object.create(null);
    this.setDataForm(aplicacionForm);
  }

  initFormNewModal() {
    this.isEditForm = false;
    let aplicacionForm: AplicacionForm = Object.create(null);
    aplicacionForm.flCVer = "1";
    this.setDataForm(aplicacionForm);

    this.getAplicacionPadreList();
    this.getDisponibilidadLst();
    this.getCategoriaLst();

  }

  initFormEditModal(aplicacionSelected: BuscarAplicacioRes) {
    this.isEditForm = true;
    this.aplicacionSelected = aplicacionSelected;
  
    // 1) Crear form vacío (sin datos)
    this.buildEmptyForm();
  
    // 2) Llamar al servicio
    this.aplicacionService.getAplicacion(aplicacionSelected.idNAplicacion)
      .subscribe({
        next: (aplicacionForm) => {
          // 3) Pegar los datos sin disparar valueChanges
          this.formGroup.patchValue(aplicacionForm, { emitEvent: false });
  
          // Ajustar fechas y otros (también con { emitEvent: false } si reasignas .setValue)
          if (aplicacionForm.feDLanzto) {
            this.formGroup.get('feDLanzto')
              ?.setValue(new Date(aplicacionForm.feDLanzto), { emitEvent: false });
          }
          if (aplicacionForm.feDVersion) {
            this.formGroup.get('feDVersion')
              ?.setValue(new Date(aplicacionForm.feDVersion), { emitEvent: false });
          }
  
          // 4) Guardar los valores finales en originalValues
          this.originalValues = JSON.parse(JSON.stringify(this.formGroup.getRawValue()));
          // Marcar como “no modificado” (opcional pero recomendado)
          this.formGroup.markAsPristine();
          this.isFormUnchanged = true;
  
          // Bloquear algún control
          this.formGroup.get('coVAplicacion')?.disable();
        },
        error: (e) => console.error(e)
      });
  
    // Llamar a las listas
    this.getAplicacionPadreList();
    this.getDisponibilidadLst();
    this.getCategoriaLst();
  }

  private buildEmptyForm() {
    this.formGroup = this.formBuilder.group({
      coVAplicacion: [ '' ],
      noVAplicacion: [ '' ],
      deVSiglas:     [ '' ],
      idNAplicacionPadre: [ null ],
      deVRuta:       [ '' ],
      deVClaseColor: [ '' ],
      feDLanzto:     [ null ],
      deVVersion:    [ '' ],
      feDVersion:    [ null ],
      idNDisponibilidad: [ null ],
      flCVer:        [ '' ],
      idNCategoria:  [ null ]
    });
  
     this.monitorFormChanges();
  }

  async initFormEditModalAsync(aplicacionSelected: BuscarAplicacioRes) {
    this.isEditForm = true;

    this.aplicacionSelected = aplicacionSelected;

    const response: AplicacionForm = await this.aplicacionService.getAplicacionAsync(this.aplicacionSelected.idNAplicacion);
    this.setDataForm(response);

    // Forzar la detección de cambios
    this.cdr.detectChanges();


    //bloqueamos input
    this.formGroup.get('coVAplicacion').disable();

    if (response) {
      if (response.feDLanzto) {
        let feDLanzto = new Date(response?.feDLanzto);
        feDLanzto = new Date(
          feDLanzto.getTime() +
          feDLanzto.getTimezoneOffset() * 60 * 1000
        );
        this.formGroup.get("feDLanzto").setValue(feDLanzto);
      }

      if (response.feDVersion) {
        let feDVersion = new Date(response?.feDVersion);
        feDVersion = new Date(
          feDVersion.getTime() +
          feDVersion.getTimezoneOffset() * 60 * 1000
        );
        this.formGroup.get("feDVersion").setValue(feDVersion);
      }
    }

    this.getAplicacionPadreList();
    this.getDisponibilidadLst();
    this.getCategoriaLst();

  }

  icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  closeModalForm() {
    this.closeModal.emit()
  }

  closeModalResponseForm() {
    this.closeModalResponse.emit("closeModalResponseForm")
  }

  closeModalAndUpdateForm() {
    this.closeModalAndUpdate.emit()
  }

  toString(value: number): string {
    return value.toString();
  }

  //insertar o actualizar aplicación
  saveModalForm() {
    if (this.isEditForm) {
      this.updForm()
    } else {
      this.insertForm()
    }
  }

  //inicializa los datos
  initData() {
    this.initFormNewModal()
  }

  initDataEdit(aplicacionSelected: BuscarAplicacioRes) {
    this.initFormEditModal(aplicacionSelected);
  }

  // async initDataEdit(aplicacionSelected: BuscarAplicacioRes) {
  //   await this.initFormEditModal(aplicacionSelected);
  // }

  setDataForm(aplicacionForm: AplicacionForm) {
    this.formGroup = this.formBuilder.group({
      coVAplicacion: new FormControl<string>(aplicacionForm.coVAplicacion, [
        Validators.required,
        Validators.maxLength(10),// Nombre de la aplicación (obligatorio)
        Validators.pattern('^(?!.*\\s{2,})[\\s\\S]*$') // Permite cualquier carácter pero sin espacios consecutivos
      ]),
      noVAplicacion: new FormControl(aplicacionForm.noVAplicacion, [
        Validators.required,
        Validators.maxLength(90),// Nombre de la aplicación (obligatorio)
        Validators.pattern('^(?!.*\\s{2,})[\\s\\S]*$')// Permite cualquier carácter pero sin espacios consecutivos
      ]),
      deVSiglas: new FormControl(aplicacionForm.deVSiglas, [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern('^(?!.*\\s{2,})[\\s\\S]*$')
      ]),
      idNAplicacionPadre: new FormControl(aplicacionForm.idNAplicacionPadre), 
      deVRuta: new FormControl(aplicacionForm.deVRuta, [
        Validators.required,
        Validators.maxLength(400),
        Validators.pattern('^(?!.*\\s{2,})[\\s\\S]*$')
      ]), 
      deVClaseColor: new FormControl(aplicacionForm.deVClaseColor, [
        Validators.required,
        Validators.pattern(/^#([A-Fa-f0-9]{6})$/)]), 
      feDLanzto: new FormControl(aplicacionForm.feDLanzto, [
        Validators.required]), 
      deVVersion: new FormControl(aplicacionForm.deVVersion, [
        Validators.required,
        Validators.maxLength(12),
        Validators.pattern(/^[0-9.]+$/)]), 
      feDVersion: new FormControl(aplicacionForm.feDVersion, [
        Validators.required]),
      idNDisponibilidad: new FormControl(aplicacionForm.idNDisponibilidad), 
      flCVer: new FormControl(aplicacionForm.flCVer, [
        Validators.required]),
      idNCategoria: new FormControl(aplicacionForm.idNCategoria, [
        Validators.required]),
    });

    this.formGetters = new FormGettersAplicacion(this.formGroup);

    // 2) Arranca la suscripción a valueChanges o prepara el monitorFormChanges
    this.monitorFormChanges();

    // 3) Cuando llegan datos del servicio, pégalos al form, pero sin disparar valueChanges
    this.formGroup.patchValue(aplicacionForm, { emitEvent: false });

    // 4) Ahora sí, guarda los valores originales y marca pristine
    this.originalValues = JSON.parse(JSON.stringify(this.formGroup.getRawValue()));
    this.formGroup.markAsPristine();
    this.isFormUnchanged = true; // Indicas que no hay cambios reales
  }

  private monitorFormChanges(): void {
    this.formGroup.valueChanges.subscribe(() => {
      const currentValues = JSON.parse(JSON.stringify(this.formGroup.getRawValue()));
  
  
      Object.keys(currentValues).forEach(key => {
        if (this.originalValues[key] !== currentValues[key]) {
          console.log(`\tCampo distinto: '${key}' | original='${this.originalValues[key]}' vs actual='${currentValues[key]}'`);
        }
      });
  
      this.isFormUnchanged = 
        JSON.stringify(this.originalValues) === JSON.stringify(currentValues);
  
    });
  }

  // Getters para acceder a los controles del formulario
  get coVAplicacion() { return this.formGetters.coVAplicacion; }
  get noVAplicacion() { return this.formGetters.noVAplicacion; }
  get deVSiglas() { return this.formGetters.deVSiglas; }
  get idNAplicacionPadre() { return this.formGetters.idNAplicacionPadre; }
  get deVRuta() { return this.formGetters.deVRuta; }
  get deVClaseColor() { return this.formGetters.deVClaseColor; }
  get feDLanzto() { return this.formGetters.feDLanzto; }
  get deVVersion() { return this.formGetters.deVVersion; }
  get feDVersion() { return this.formGetters.feDVersion; }
  get idNDisponibilidad() { return this.formGetters.idNDisponibilidad; }
  get flCVer() { return this.formGetters.flCVer; }
  get idNCategoria() { return this.formGetters.idNCategoria; }

  // Método auxiliar para verificar si un control tiene un error específico
  hasError(controlName: string, errorName: string): boolean {
    const control = this.formGroup.get(controlName);
    return control.touched && control.hasError(errorName);
  }

  getErrorMessage(controlName: string, errorType: string): string {
    return this.errorMessages?.[controlName]?.[errorType] ?? 'Error en el campo';
  }

  // Método para obtener la longitud del valor de un control
  getLength(controlName: string): number {
    const control = this.formGroup.get(controlName);
    return control.value ? control.value.length : 0;
  }

  getAplicacionPadreList() {
    this.aplicacionService.getAplicacionDropDownLst().subscribe({
      next: (response) => {
        this.aplicacionPadreLst = response;
      },
      error: (err) => {
        console.error("error al consultar datos")
      }
    });
  }

  getDisponibilidadLst() {
    this.aplicacionService.getDisponibilidadLst().subscribe({
      next: (response) => {
        this.disponibilidadLst = response;
      },
      error: (err) => {
        console.error("error al consultar datos")
      }
    });
  }

  getCategoriaLst() {
    this.aplicacionService.getCategoriaLst().subscribe({
      next: (response) => {
        this.categoriaLst = response;
      },
      error: (err) => {
        console.error("error al consultar datos")
      }
    });
  }

  //antes marcarCamposComoTocados
  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  async insertForm() {
    if (this.formGroup.valid) {
      await this.spinner.show();
      if (await this.siDuplicadoCoVAplicacion()) {
        this.modalNotificationService.dialogError('Código Duplicado', "La aplicación ya se encuentra registrada, por favor validar los datos.");
        console.error("aplicacion duplicada")
        await this.spinner.hide();
      }else{
        await this.spinner.hide();
        this.confirmarAgregarRegistro('question');
        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this._insertForm();
            }
          },
          error: (err) => {
            console.error('Error al agregar registro.', err);
            throw new Error('Error al agregar registro');
          },
        });
      }

    } else {
      this.marcarCamposComoTocados(this.formGroup);
    }
  }

  _insertForm() {
    this.spinner.show();
    const aplicacionFormReq: AgregarAplicacionReq = {
      ...this.formGroup.value,
      coVUsCreacion: this.usuarioSesion?.usuario.usuario,
    }

    this.aplicacionService.agregarAplicacion(aplicacionFormReq).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.insertFormOkMessage();

      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al consultar datos")
      }
    });

  }

  insertFormOkMessage() {
    const noVAplicacion = this.formGroup.get('noVAplicacion').value

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Aplicación registrada',
        description: `El registro de los datos de la nueva aplicación <b>${noVAplicacion}</b> se realizó de forma exitosa.`,
        confirmButtonText: 'Listo'
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.closeModalForm()
          this.closeModalAndUpdateForm()
        }
      },
      error: (err) => {
        console.error('Error al actualizar registro.', err);
        throw new Error('Error al actualizar registro');
      },
    });
  }

  async updForm() {
    if (this.formGroup.valid) {
      await this.spinner.show();
      if (await this.siDuplicadoCoVAplicacion()) {
        this.modalNotificationService.dialogError('Código Duplicado', "La aplicación ya se encuentra registrada, por favor validar los datos.");
        console.error("aplicacion duplicada")
        await this.spinner.hide();
      } else {
        await this.spinner.hide();
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

    } else {
      this.marcarCamposComoTocados(this.formGroup);
    }
  }

  private _updForm() {
    this.spinner.show();
    const aplicacionFormReq: AgregarAplicacionReq = {
      ...this.formGroup.value,
      idNAplicacion: this.aplicacionSelected.idNAplicacion,
      coVUsModificacion: this.usuarioSesion?.usuario.usuario,
    }

    this.aplicacionService.actualizarAplicacion(aplicacionFormReq).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.updateFormOkMessage();

      },
      error: (err) => {
        this.spinner.hide();
        console.error("error al consultar datos")
      }
    });

  }

  updateFormOkMessage() {
    const noVAplicacion = this.formGroup.get('noVAplicacion').value

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Aplicación editada',
        description: `La actualización de los datos de la aplicación <b>${noVAplicacion}</b> se realizó de forma exitosa.`,
        confirmButtonText: 'Listo'
      },
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.closeModalAndUpdateForm()
        }
      },
      error: (err) => {
        console.error('Error al actualizar registro.', err);
        throw new Error('Error al actualizar registro');
      },
    });
  }

  private confirmarAgregarRegistro(icon: string): void {

    const noVAplicacion = this.formGroup.get('noVAplicacion').value

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Registrar nueva aplicación',
        confirm: true,
        description:
          'A continuación, se procederá a registrar los datos de la nueva aplicación ' +
          `<b>${noVAplicacion}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  private confirmarActualizarRegistro(icon: string): void {
    const noVAplicacion = this.formGroup.get('noVAplicacion').value

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Editar datos de la aplicación',
        confirm: true,
        description:
          'A continuación, se procederá a modificar los datos de la aplicación ' +
          `<b>${noVAplicacion}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  async siDuplicadoCoVAplicacion(): Promise<boolean> {
    try {
      const coVAplicacion = this.formGroup.get('coVAplicacion')?.value;//codigo de nodo
      const idNAplicacionActual= this.aplicacionSelected?.idNAplicacion ? this.aplicacionSelected?.idNAplicacion: null

      const siDuplicado = await this.aplicacionService.siDuplicadoCoVAplicacion(
        coVAplicacion,
        idNAplicacionActual
      );
      return !!siDuplicado.data;

    } catch (error) {
      console.error('Error al validar duplicidad de código de aplicación:', error);
      return false;
    }
  }
}
