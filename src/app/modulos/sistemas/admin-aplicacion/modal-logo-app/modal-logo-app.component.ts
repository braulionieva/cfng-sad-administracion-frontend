import { NgForOf, NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormControl, AbstractControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { AlertModalComponent } from "@components/alert-modal/alert-modal.component";
import { AgregarLogoAppReq, EliminarLogoAplicacioReq } from "@interfaces/aplicacion-bandeja/aplicacionBean";
import { IDatosLogo } from "@interfaces/categorias/categorias";
import { MyImageCropperComponent } from "@modulos/maestros/categorias/image-cropper/image-cropper.component";
import { AdminAplicacionService } from "@services/aplicacion-bandeja/admin-aplicacion.service";
import { ModalNotificationService } from "@services/modal-notification/modal-notification.service";
import { AngularCropperjsModule } from "angular-cropperjs";
import { ImageTransform, ImageCroppedEvent, Dimensions } from "ngx-image-cropper";
import { NgxSpinnerService } from "ngx-spinner";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from "primeng/dynamicdialog";
import { FileUploadModule } from "primeng/fileupload";
import { RadioButtonModule } from "primeng/radiobutton";
import { finalize } from "rxjs";

@Component({
  standalone: true,
  selector: 'app-modal-logo-app',
  templateUrl: './modal-logo-app.component.html',
  styleUrls: ['./modal-logo-app.component.scss'],
  imports: [
    AngularCropperjsModule,
    ButtonModule,
    FileUploadModule,
    MyImageCropperComponent,
    NgForOf,
    NgIf,
    RadioButtonModule,
    ReactiveFormsModule,
  ],
  providers: [ModalNotificationService],
})
export class ModalLogoAppComponent {
  formGroup: FormGroup;
  options = [
    { key: 'agregar', name: 'Agregar el logo' },
    { key: 'eliminar', name: 'Eliminar el logo' },
  ];

  refModal: DynamicDialogRef;

  //////////////////////////////
  imageChangedEvent: any = '';
  croppedImage: any;
  canvasRotation = 0;
  rotation?: number;
  translateH = 0;
  translateV = 0;
  scale = 1;
  aspectRatio = 4 / 3;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {
    translateUnit: 'px',
  };
  loading = false;
  allowMoveImage = false;
  hidden = false;

  logoPrevio: IDatosLogo = {
    nombre: '',
    extension: null,
    tamano: null,
    base64: '',
  };

  datosLogoSeleccionado: IDatosLogo = {
    nombre: '',
    extension: null,
    tamano: null,
    base64: '',
  };

  protected infoUsuario: any;

  private identificador: number;
  private nombre: string;

  errorMessage: string | null = null;

  /////////////////////////////////

  formObject = {
    optionSelected: new FormControl('agregar'),
    logo: new FormControl(),
  };

  constructor(
    private readonly aplicacionService: AdminAplicacionService,
    private readonly config: DynamicDialogConfig,
    private readonly dialogService: DialogService,
    private readonly modalNotificationService: ModalNotificationService,
    private readonly sanitizer: DomSanitizer,
    private readonly spinner: NgxSpinnerService,
    protected readonly ref: DynamicDialogRef
  ) {
    this.formGroup = new FormGroup(this.formObject);
  }

  ngOnInit(): void {
    this.setData();
  }

  setData() {
    if (this.config) {
      this.nombre = this.config.data.dataEnvio.noVAplicacion;
      this.identificador = this.config.data.dataEnvio.idNAplicacion;

      this.logoPrevio.base64 = this.config.data.dataEnvio.logo;
      this.logoPrevio.extension = this.config.data.dataEnvio.deVExtension;

      if (!this.logoPrevio.base64)
        this.optionSelectedField.disable();

      this.infoUsuario = this.config.data.usuarioSesion;
    }
  }

  clickSuccessAction() {
    if (this.optionSelectedField.value === 'agregar') {
      this.mostrarAlertConfirmacion('agregar');
    }
    if (this.optionSelectedField.value === 'eliminar') {
      this.mostrarAlertConfirmacion('eliminar');
    }
  }

  mostrarAlertConfirmacion(action: 'agregar' | 'eliminar') {
    let title = '';
    let description = '';

    if (action === 'agregar') {
      title = 'Registrar nuevo logo';
      description = `A continuación, se procederá a registrar los datos del nuevo logo de la aplicación <strong> ${this.nombre}</strong>. ¿Está seguro de realizar esta acción?`;
    } else if (action === 'eliminar') {
      title = 'Eliminar Logo';
      description = `A continuación, se procederá a eliminar el logo de la aplicación <strong> ${this.nombre}</strong>. ¿Está seguro de realizar esta acción?`;
    }

    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '750px',
      showHeader: false,
      data: {
        icon: 'question',
        title: title,
        confirm: true,
        description: description,
        confirmButtonText: 'Aceptar',
      },
    });

    this.refModal.onClose
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.spinner.show();

            if (action === 'agregar') {
              this.onAgregarLogo();
            } else if (action === 'eliminar') {
              this.onEliminarLogo();
            }
          }
        },
      });
  }

  onAgregarLogo() {
    const request: AgregarLogoAppReq = {
      idNAplicacion: this.identificador,
      noVLogo: this.datosLogoSeleccionado.nombre,
      nuNTamanio: this.datosLogoSeleccionado.tamano,
      deVExtension: this.datosLogoSeleccionado.extension === 'jpg' ? 'png' : this.datosLogoSeleccionado.extension,
      imagenLogo: this.datosLogoSeleccionado.base64,
      coVUsCreacion: this.infoUsuario?.usuario.usuario,
    }

    this.aplicacionService.agregarLogoAplicacion(request).subscribe({
      next: () => {
        setTimeout(() => {
          this.modalNotificationService.dialogSuccess(
            'Logo registrado',
            `El registro de los datos del nuevo logo de la aplicación <strong> ${this.nombre} </strong> se realizó de forma exitosa.`
          );

          this.ref.close('confirm');
        }, 300);
      },
      error: (err: string) => {
        console.error('Error en la solicitud [agregarLogo]: ', err);
      },
    });
  }

  onEliminarLogo() {
    const request: EliminarLogoAplicacioReq = {
      idNAplicacion: this.identificador,
      coVUsModificacion: this.infoUsuario.usuario.usuario,
    }

    this.aplicacionService.eliminarLogoAplicacion(request).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.modalNotificationService.dialogSuccess(
            'Logo eliminado',
            `La eliminación del logo de la aplicación <strong>" ${this.nombre}"</strong> se realizó de forma exitosa.`
          );

          this.ref.close('confirm');
        }, 300);
      },
      error: (err: string) => {
        console.error('Error en la solicitud [eliminarLogo]: ', err);
      },
    });
  }

  clickCancelAction() {
    this.closeModal();
  }

  closeModal() {
    this.ref.close();
  }

  get optionSelectedField(): AbstractControl {
    return this.formGroup.get('optionSelected');
  }

  get logoField(): AbstractControl {
    return this.formGroup.get('logo');
  }

  fileChangeEvent(event: any) {
    const file = event.target.files[0];

    // Inicializar valores
    this.datosLogoSeleccionado = { nombre: '', extension: null, tamano: null, base64: '' };
    this.croppedImage = null;
    this.imageChangedEvent = null;
    this.errorMessage = null;
    this.loading = false;

    if (file) {
      const validFormats = ['jpg', 'jpeg', 'png'];
      const extension = file.name.split('.').pop().toLowerCase();

      // Validar extensión del archivo
      if (!validFormats.includes(extension)) {
        this.errorMessage = 'Formato no permitido. Solo se aceptan archivos JPG, JPEG y PNG.';
        return;
      }

      // Validar tamaño del archivo (máximo 10 MB)
      const maxFileSizeMB = 10;
      const fileSizeMB = file.size / (1024 * 1024); // Convertir a MB

      if (fileSizeMB > maxFileSizeMB) {
        this.errorMessage = `El tamaño del archivo supera el límite permitido de ${maxFileSizeMB} MB.`;
        return;
      }

      // Guardar información del archivo seleccionado
      this.datosLogoSeleccionado.tamano = +fileSizeMB.toFixed(2); // Tamaño con dos decimales
      this.datosLogoSeleccionado.extension = extension;
      this.datosLogoSeleccionado.nombre = file.name.substring(0, file.name.lastIndexOf('.'));

      // Indicar que la imagen está siendo cargada
      this.loading = true;

      // Guardar el evento para procesamiento posterior (cropping, vista previa, etc.)
      this.imageChangedEvent = event;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');

    let extension = this.datosLogoSeleccionado.extension === 'jpg' ? 'png' : this.datosLogoSeleccionado.extension;
    let regex = new RegExp(`^data:image/${extension};base64,`, 'i');

    this.datosLogoSeleccionado.base64 = this.croppedImage.changingThisBreaksApplicationSecurity.replace(regex, '');
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    this.loading = false;
  }

  loadImageFailed() {
    this.croppedImage = null;
    this.datosLogoSeleccionado = { nombre: '', extension: null, tamano: null, base64: '' };
    this.errorMessage = 'Imagen no permitida, por favor ingrese otra imagen.';
  }

  triggerFileInput() {
    const fileInput = document.getElementById('file');

    if (fileInput) {
      this.errorMessage = null;
      fileInput.click();
    }
  }
}
