import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MyImageCropperComponent } from '@modulos/maestros/categorias/image-cropper/image-cropper.component';
import { Dimensions, ImageCroppedEvent, ImageTransform } from '@modulos/maestros/categorias/image-cropper/interfaces';
import { IDatosLogo } from '@interfaces/categorias/categorias';

import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { TablaComponent } from '@modulos/configuracion-plazos/tabla/tabla.component';

import { UsuarioService } from '@services/usuario/usuario.service';
import { RequestFoto } from '@interfaces/usuario/usuario';
import {Auth2Service} from "@services/auth/auth2.service";

@Component({
  standalone: true,
  selector: 'app-foto-usuario',
  templateUrl: './foto-usuario.component.html',
  styleUrls: [
    './foto-usuario.component.scss',
  ],
  imports: [
    CommonModule,
    ButtonModule,
    RadioButtonModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    AngularCropperjsModule,
    MyImageCropperComponent,
  ],
  providers: [TablaComponent],
})
export class FotoUsuarioComponent implements OnInit {
  public usuario: any
  public task: boolean = true;

  refModal: DynamicDialogRef;
  public formImgPerfil: FormGroup;
  //////////////////////////////
  imageChangedEvent: any = '';
  croppedImage: any;
  canvasRotation = 0;
  rotation?: number;
  translateH = 0;
  translateV = 0;
  scale = 1;
  //aspectRatio = 4 / 2.5;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {
    translateUnit: 'px',
  };
  loading = false;
  allowMoveImage = false;
  hidden = false;
  fotoActual: string = null;

  datosImgSeleccionada: IDatosLogo = {
    nombre: '',
    extension: null,
    tamano: null,
    base64: '',
  };


  formObject = {
    optionSelected: new FormControl('agregar'),
    logo: new FormControl(),
  };

  errorMessage: string | null = null;

  public usuarioSesion;

  constructor(
    protected readonly ref: DynamicDialogRef,
    private readonly fb: FormBuilder,
    private readonly config: DynamicDialogConfig,
    private readonly sanitizer: DomSanitizer,
    private readonly usuarioService: UsuarioService,
    private readonly dialogService: DialogService,
    private readonly userService: Auth2Service,

  ) {
    this.formImgPerfil = fb.group({
      optionSelected: ['ADD', Validators.required],
    });
  }

  ngOnInit(): void {
    this.usuario = this.config.data.usuarioSelected;

    if (!this.usuario.foto)
      this.formImgPerfil.get('optionSelected').disable();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usuarioSesion = this.userService.getUserInfo();
    }, 100);
  }

  protected seleccionarOpcion(opt: 'ADD' | 'DEL') {
    this.task = opt == 'ADD';
  }

  public close(): void {
    this.ref.close()
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  confirmaGuardar() {
    this.refModal = this.dialogService.open(AlertModalComponent,
      {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'question',
          title: 'Registrar foto de usuario',
          confirm: true,
          confirmButtonText: "Aceptar",
          description: `A continuación, se procederá a registrar la foto del usuario <strong>${this.usuario.nombreCompleto}. </strong>
          <br />¿Está seguro de realizar esta acción?`,
        }
      });
    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.registrarFoto();
        }
      },
    });
  }

  getIdExtension(extension: string): number {
    if (extension == 'jpg')
      return 3;

    if (extension == 'jpeg')
      return 9;

    if (extension == 'png')
      return 10;

    return 10;
  }

  async registrarFoto(): Promise<boolean> {
    let request: RequestFoto = {
      idUsuario: this.usuario.idUsuario,
      nombreFoto: this.datosImgSeleccionada.nombre,
      tamanioFoto: this.datosImgSeleccionada.tamano,
      idextensionFoto: this.getIdExtension(this.datosImgSeleccionada?.extension),
      foto: this.datosImgSeleccionada.base64,
      codigoUsuario: this.usuarioSesion?.usuario.usuario,
    }

    this.usuarioService.registrarFoto(request).subscribe({
      next: (response) => {
        this.informarRegistroExitoso();
      },
      error: (error) => {
        console.error("Registrar Foto:", error)
        return false;
      },
    });
    return false;
  }

  informarRegistroExitoso() {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Foto de usuario registrada',
        description: `El registro de la foto del usuario <b>
                            ${this.usuario?.nombreCompleto}</b> se realizó de forma exitosa.`,
        confirmButtonText: 'Listo'
      }
    })

    this.refModal.onClose.subscribe((data: any) => {
      this.close();
    });
  }

  confirmaEliminar() {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '600px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Eliminar foto de usuario',
        confirm: true,
        confirmButtonText: "Aceptar",
        description: `A continuación, se procederá a eliminar la foto del usuario <strong>${this.usuario.nombreCompleto}. </strong>
        <br />¿Está seguro de realizar esta acción?`,
      }
    });

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp === 'confirm') {
          this.eliminarFoto();
        }
      },
    });
  }
  async eliminarFoto(): Promise<boolean> {
    this.usuarioService.eliminarFoto(this.usuario.idUsuario,
      this.usuarioSesion?.usuario.usuario,
    ).subscribe({
      next: (response) => {
        this.informarEliminacionExitoso();
        this.close();
      },
      error: (error) => {
        return false;
      },
    });
    return false;
  }

  informarEliminacionExitoso() {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '700px',
      showHeader: false,
      data: {
        icon: 'success',
        title: 'Foto de usuario eliminada',
        description: `La eliminación de la foto del usuario <strong> ${this.usuario?.nombreCompleto}</strong> se realizó de forma exitosa.`,
        confirmButtonText: 'Listo'
      }
    });
  }

  clickCancelAction() {
    this.closeModal();
  }

  closeModal() {
    this.ref.close();
  }
  ///////////////////////////////////////////////////
  fileValidate(event: any) {
    if (!this.croppedImage)
      this.errorMessage = 'Seleccione una foto.'
  }


  fileChangeEvent(event: any) {
    const file = event.target.files[0];

    // Inicializar valores
    this.datosImgSeleccionada = { nombre: '', extension: null, tamano: null, base64: '' };
    this.croppedImage = null;
    this.imageChangedEvent = null;
    this.loading = false;
    this.errorMessage = null;

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
      this.datosImgSeleccionada.tamano = +fileSizeMB.toFixed(2); // Tamaño con dos decimales
      this.datosImgSeleccionada.extension = extension;
      this.datosImgSeleccionada.nombre = file.name.substring(0, file.name.lastIndexOf('.'));

      // Indicar que la imagen está siendo cargada
      this.loading = true;

      // Guardar el evento para procesamiento posterior (cropping, vista previa, etc.)
      this.imageChangedEvent = event;
    }
    else {
      this.errorMessage = 'Seleccione una foto.'
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');

    let extension = this.datosImgSeleccionada.extension === 'jpg' ? 'png' : this.datosImgSeleccionada.extension;
    let regex = new RegExp(`^data:image/${extension};base64,`, 'i');

    this.datosImgSeleccionada.base64 = this.croppedImage.changingThisBreaksApplicationSecurity.replace(regex, '');
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    this.loading = false;
  }

  loadImageFailed() {
    this.croppedImage = null;
    this.datosImgSeleccionada = {
      nombre: '',
      extension: null,
      tamano: null,
      base64: '',
    };
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
