import { Component } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup, FormsModule, ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { Auth2Service } from "@services/auth/auth2.service";
import { MenuInterface } from "@interfaces/admin-menu/admin-menu";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { NgxSpinnerService } from "ngx-spinner";
import { AdminMenusService } from "@services/admin-menu/admin-menu.service";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { NgIf } from "@angular/common";
import { ModalNotificationService } from "@services/modal-notification/modal-notification.service";

@Component({
  selector: 'app-add-edit-menu',
  templateUrl: './add-edit-menu.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./add-edit-menu.component.scss'],
  providers: [DialogService, ModalNotificationService]
})
export class AddEditMenuComponent {
  //dinamic dialog for confirm:
  refModal: DynamicDialogRef;

  //cambiado de agregarMenuForm y editarMenuForm a formGroup;
  formGroup: FormGroup;

  public originalValues: any;
  public isFormUnchanged = true;

  nodo: MenuInterface;
  title: string;//titulo del modal

  isEditModal: boolean = false;//nuevo 1, edit

  //nombre de la aplicacion actual
  nombreAplicacionActual: string;

  //siglas de la aplicacion actual
  devSiglasAplicacionActual: string;
  //si el nodo es de primer nivel
  isNodoPrimerNivel: boolean;

  //usuario session
  public usuarioSesion;

  errorMessageForm: string;

  //idAplicacion
  idMenuPadre: number;

  constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly userService: Auth2Service,
    private readonly adminMenusService: AdminMenusService,
    private readonly spinner: NgxSpinnerService,
    private readonly modalNotificationService: ModalNotificationService,
  ) {
    this.formGroup = this.formBuilder.group({
      codigoAplicacion: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^([a-zA-Z0-9])*$/),
        Validators.minLength(2),
        Validators.maxLength(20),
        this.noSoloEspacios(),
      ]),
      nombreAplicacion: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.noSoloEspacios(),
      ]),
      descripcionEnlace: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(400),
        this.noSoloEspacios(),
      ]),
      descripcionTag: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(50),
        this.noSoloEspacios(),
      ]),
    });



    this.isEditModal = this.config.data?.isEditModal;
    this.nombreAplicacionActual = this.config.data?.nombreAplicacionActual
    this.devSiglasAplicacionActual = this.config.data?.devSiglasAplicacionActual
    this.isNodoPrimerNivel = this.config.data?.isNodoPrimerNivel
    if (this.isEditModal) {
      this.title = "Editar nodo/menú"
      const nodo: MenuInterface = this.config.data?.nodo;
      this.setData(nodo)
    } else {
      if (this.isNodoPrimerNivel) {
        this.title = "Nuevo nodo de primer nivel"
      } else {
        this.title = "Nuevo nodo/menú"
      }
    }

    this.monitorFormChanges();
  }

  ngOnInit() {

    //usuario en sesion
    this.usuarioSesion = this.userService.getUserInfo();
  }


  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public confirmAction(): void {
    this.ref.close('confirm');
  }

  public cancelAction(): void {
    this.ref.close('cancel');
  }

  public closeAction(): void {
    this.ref.close('closed');
  }

  // Validador personalizado para evitar solo espacios en blanco
  noSoloEspacios(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Si no hay valor, no se valida
      }

      const trimmedValue = (control.value || '').trim();
      const isWhitespace = trimmedValue.length === 0;
      const isValid = !isWhitespace && control.value === trimmedValue;

      return isValid ? null : { noSoloEspacios: true };
    };
  }

  async onSubmit() {
    if (this.isEditModal) {
      await this.updateForm();
    } else {
      await this.insertForm();
    }
  }

  private monitorFormChanges(): void {
    this.formGroup.valueChanges.subscribe(() => {
      const currentValues = JSON.parse(JSON.stringify(this.formGroup.value));

      this.isFormUnchanged =
        JSON.stringify(this.originalValues) === JSON.stringify(currentValues);
    });
  }

  private obtenerSiglasAplicacion(nombreAplicacion: string): string {
    // Primero limpiamos los espacios múltiples y eliminamos espacios al inicio y final
    const nombreLimpio = nombreAplicacion.trim().replace(/\s+/g, ' ');

    // Si el string está vacío después de limpiar, retornamos string vacío
    if (!nombreLimpio) {
      return '';
    }

    let siglasApplicacion = '';
    const arraySiglas = nombreLimpio.split(' ');

    arraySiglas.forEach((element: string) => {
      if (siglasApplicacion.length < 30 && element) {
        // Verificamos que el elemento no esté vacío y tenga al menos un carácter
        const primerCaracter = element.charAt(0);
        if (primerCaracter) {
          siglasApplicacion += primerCaracter.toUpperCase();
        }
      }
    });

    return siglasApplicacion;
  }

  public validateFormatCodigo(event): void {
    let key;
    if (event.type === 'paste') {
      key = event.clipboardData.getData('text/plain');
    } else {
      key = event.keyCode;
      key = String.fromCharCode(key);
    }
    const regex = /[a-zA-Z0-9]|\./;
    if (!regex.test(key)) {
      event.returnValue = false;
      if (event.preventDefault) {
        event.preventDefault();
      }
    }
  }
  public close(): void {
    this.ref.close('closed');
  }

  setData(nodo: MenuInterface) {
    this.formGroup.patchValue(
      {
        codigoAplicacion: nodo.codigoAplicacion,
        nombreAplicacion: nodo.nombreAplicacion,
        descripcionEnlace: nodo.descripcionRuta,
        descripcionTag: nodo.descripcionTag
      },
      { emitEvent: false }
    );


    this.originalValues = JSON.parse(JSON.stringify(this.formGroup.value));
    this.formGroup.markAsPristine();
    this.isFormUnchanged = true;
  }

  async insertForm() {
    if (this.formGroup.valid) {
      await this.spinner.show();
      if (await this.siDuplicadoNodoCoVAplicacionNuevoRegistro()) {
        this.errorMessageForm = "Nodo o menú ya se encuentra registrado, por favor validar datos. El codigo no debe coincidir con ningun código de aplicación.";
        await this.spinner.hide();
      } else {
        await this.spinner.hide();
        this.confirmarAgregarRegistro('question');
        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.insertFormConfirm();
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

  /**
   * Valida si existe duplicidad del código de aplicación para un nuevo registro
   * @returns boolean - true si existe duplicado, false si no existe
   */
  async siDuplicadoNodoCoVAplicacionNuevoRegistro(): Promise<boolean> {
    const coVNodo = this.formGroup.get('codigoAplicacion').value;//codigo de nodo
    const idNAplicacionActual = this.config.data?.idAplicacionActual;  //id de aplicacion donde se creará el nodo
    const idNNodoActual = null; //no existe porque ES NUEVO REGISTRO

    try {
      const siDuplicado = await this.adminMenusService.siDuplicadoNodoCoVAplicacion(
        coVNodo,
        idNAplicacionActual,
        idNNodoActual
      );
      return !!siDuplicado.data;
    } catch (error) {
      console.error('Error al validar duplicidad de código de aplicación:', error);
      return false;
    }
  }

  /**
   * Valida si existe duplicidad del código de aplicación para edición
   * @returns boolean - true si existe duplicado, false si no existe
   */
  async siDuplicadoNodoCoVAplicacionEdicion(): Promise<boolean> {
    try {
      const coVNodo = this.formGroup.get('codigoAplicacion')?.value;//codigo de nodo
      const idNAplicacionActual = this.config.data?.idAplicacionActual;  //id de aplicacion donde se creará el nodo
      const idNNodoActual = this.config.data?.nodo.idMenu;                    //

      const siDuplicado = await this.adminMenusService.siDuplicadoNodoCoVAplicacion(
        coVNodo,
        idNAplicacionActual,
        idNNodoActual
      );
      return !!siDuplicado.data;

    } catch (error) {
      console.error('Error al validar duplicidad de código de aplicación:', error);
      return false;
    }
  }

  async insertFormConfirm() {
    await this.spinner.show();
    this.nodo = this.obtenerNodoMenuForNew();
    this.adminMenusService.crearNodoMenu(this.nodo).subscribe({
      next: (response) => {
        this.spinner.hide();

        if (response.code == '0') {
          this.refModal = this.dialogService.open(AlertModalComponent, {
            width: '600px',
            showHeader: false,
            data: {
              icon: 'success',
              title: this.isNodoPrimerNivel ? 'Nodo de primer nivel registrado' : 'Nodo/Menú agregado',
              description: `El registro de los datos del nuevo nodo <b>${this.nodo.nombreAplicacion}</b> ` +
                `de la aplicación <b>${this.devSiglasAplicacionActual} - ${this.nombreAplicacionActual}</b> se realizó de manera exitosa.`,
              confirmButtonText: 'Listo'
            },
          });
          this.refModal.onClose.subscribe({
            next: (resp) => {
              if (resp === 'confirm') {
                this.confirmAction();
              }
            },
          });
        } else if (response.code == '1') {
          this.modalNotificationService.dialogError('', `Error en el proceso. Intente nuevamente.`);
        } else if (response.code == '42204023') {
          this.errorMessageForm = "Nodo o menú ya se encuentra registrado, por favor validar datos.";
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error al obtener el menu:', err);
      },
    });
  }

  async updateForm() {
    if (this.formGroup.valid) {
      await this.spinner.show();
      if (await this.siDuplicadoNodoCoVAplicacionEdicion()) {
        this.errorMessageForm = "Nodo o menú ya se encuentra registrado, por favor validar datos. El codigo no debe coincidir con ningun código de aplicación.";
        await this.spinner.hide();
      } else {
        await this.spinner.hide();
        this.confirmarModificarRegistro('question');
        this.refModal.onClose.subscribe({
          next: (resp) => {
            if (resp === 'confirm') {
              this.updateFormConfirm();
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

  async updateFormConfirm() {
    await this.spinner.show();
    this.nodo = this.obtenerNodoMenuForUpd();
    this.adminMenusService.actualizarNodoMenu(this.nodo).subscribe({
      next: (response) => {
        this.spinner.hide();

        this.ref.close({
          mensaje: response.message,
          nombreAplicacion: this.nodo.nombreAplicacion,
        });
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error al obtener el menu:', err);
      },
    });
  }
  private obtenerNodoMenuForNew(): MenuInterface {
    const siglas = this.obtenerSiglasAplicacion(
      this.formGroup.value.nombreAplicacion
    );
    let idAplicacionPadre;
    if (this.isNodoPrimerNivel) {
      idAplicacionPadre = this.config.data?.idAplicacionActual;//solo para nodo de primer nivel
    } else {
      idAplicacionPadre = this.config.data?.idMenuPadre;//solo para nodos internos. no aplica a nodo de primer nivel
    }
    const nuevoNodo = {
      idAplicacionPadre: idAplicacionPadre,
      codigoAplicacion: this.formGroup.value.codigoAplicacion.toUpperCase(),
      nombreAplicacion: this.formGroup.value.nombreAplicacion,
      siglasAplicacion: siglas,
      descripcionFuncion: this.formGroup.value.nombreAplicacion,
      descripcionRuta: this.formGroup.value.descripcionEnlace,
      descripcionTag: this.formGroup.value.descripcionTag,
      codigoUsuarioCreador: this.usuarioSesion?.usuario.usuario,
    };
    return nuevoNodo;
  }

  private obtenerNodoMenuForUpd(): MenuInterface {
    const siglas = this.obtenerSiglasAplicacion(
      this.formGroup.value.nombreAplicacion
    );
    const nuevoNodo = {
      idAplicacion: this.config.data?.nodo.idMenu,
      codigoAplicacion: this.formGroup.value.codigoAplicacion.toUpperCase(),
      nombreAplicacion: this.formGroup.value.nombreAplicacion,
      siglasAplicacion: siglas,
      descripcionFuncion: this.formGroup.value.nombreAplicacion,
      descripcionRuta: this.formGroup.value.descripcionEnlace,
      descripcionTag: this.formGroup.value.descripcionTag,
      codigoUsuarioActualiza: this.usuarioSesion?.usuario.usuario,
    };
    return nuevoNodo;
  }

  private confirmarAgregarRegistro(icon: string): void {

    const nombreNodo = this.formGroup.get('nombreAplicacion').value;
    let title = 'Registrar nuevo nodo/menú';
    if (this.isNodoPrimerNivel) {
      title = "Registrar nuevo nodo de primer nivel";
    }
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: icon,
        title: title,
        confirm: true,
        description:
          'A continuación, se procederá a registrar los datos del nuevo nodo ' +
          `<b>${nombreNodo}</b> de la aplicación <b>${this.devSiglasAplicacionActual} - ${this.nombreAplicacionActual}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  private confirmarModificarRegistro(icon: string): void {

    const nombreNodo = this.formGroup.get('nombreAplicacion').value

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '50%',
      showHeader: false,
      data: {
        icon: icon,
        title: 'Modificar nodo/menú',
        confirm: true,
        description:
          'A continuación, se procederá a registrar los datos del nuevo nodo ' +
          `<b>${nombreNodo}</b> de la aplicación <b>${this.devSiglasAplicacionActual} - ${this.nombreAplicacionActual}</b>. ` +
          '¿Esta seguro de realizar esta acción?',
        confirmButtonText: 'Aceptar'
      },
    });
  }

  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

}
