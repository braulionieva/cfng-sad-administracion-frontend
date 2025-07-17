import { ResetearContrasenaService } from './../../../core/services/resetear-contrasena/resetear-contrasena.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-resetear-contrasena',
  standalone: true,
  templateUrl: './resetear-contrasena.component.html',
  styleUrls: ['./resetear-contrasena.component.scss'],
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    RadioButtonModule,
    CheckboxModule,
    FormsModule,
    CommonModule
  ]
})
export class ResetearContrasenaComponent {

  refModal: DynamicDialogRef;

  resetearContrasenaForm: FormGroup;

  trabajor: any = {
    // nombre: "María Luz Perez Gamarra", tipoDoc:"DNI", nuDoc: "72956889", relacionLaboral: "Trabajador",
    // correoPersonal: "mdelgadillo@gmail.com", correoInstitucional: "mdelgadillo@mpfn.gob.pe"
  };

  correosTrabajador: any[] = [
    // { name: 'mdelgadillo@gmail.com', key: 'P' },
    // { name: 'mdelgadillo@mpfn.gob.pe', key: 'I' }
  ];

  usuario: any;

  nota: string = "Para realizar el reseteo de contraseña, se hace uso del correo personal o institucional del usuario. Por favor, verifique que estos datos sean correctos; caso contrario, realizar la corrección que corresponda, para garantizar un adecuado reseteo de contraseña.";
  error: any;

  constructor(public ref: DynamicDialogRef,
    public dialogService: DialogService,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private resetearContrasenaService: ResetearContrasenaService) {
    // Initialize the selectedCorreo if needed
    //this.selectedCorreo = this.trabajor.correoPersonal;

    this.resetearContrasenaForm = this.fb.group({
      correo: new FormControl(
        null,
        [
          Validators.required
        ]
      ),
      aceptaReseteo: new FormControl(
        false,
        [
          Validators.requiredTrue
        ]
      )
    });
  }

  ngOnInit() {
    this.usuario = this.config?.data;
    const request = { idUsuario: this.usuario?.idUsuario };
    this.resetearContrasenaService.getDatosUsuario(request).subscribe(
      {
        next: (response) => {
          this.trabajor = response;
          this.obtenerCorreosUsuario(this.usuario?.idUsuario);
        },
        error: (err) => {
          this.error = err;
        }
      });
  }

  obtenerCorreosUsuario(idUsuario: string) {
    const request = { idUsuario: idUsuario };
    this.resetearContrasenaService.getCorreosUsuario(request).subscribe(
      {
        next: (response) => {
          this.correosTrabajador = response.map((correo, index) => ({
            name: correo.correo,
            key: correo.correo
          }));
        },
        error: (err) => {
          this.error = err;
          console.error('Error al obtener sistemas de la categoria', err);
        }
      });
  }

  validaResetearContrasenaForm() {
    return this.resetearContrasenaForm.get('aceptaReseteo').value
      && this.resetearContrasenaForm.get('correo').value;
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
  }

  public close(): void {
    this.ref.close();
  }

  resetearContrasena() {
    if (this.resetearContrasenaForm.valid) {
      const usuario: string = this.trabajor?.coUsuario;
      this.refModal = this.dialogService.open(
        AlertModalComponent,
        {
          width: '750px',
          showHeader: false,
          data: {
            icon: 'question',
            title: 'RESETEAR CONTRASEÑA',
            confirm: true,
            description: 'A continuación, se procederá a <b>resetear</b> la contraseña del usuario \"' + usuario + '\". ¿Está seguro de realizar esta acción?',
            confirmButtonText: "Aceptar"
          }
        }
      );

      this.refModal.onClose.subscribe({
        next: (resp) => {
          if (resp === 'confirm') {
            this.guardarReseteoContrasena(usuario);
          }
        },
      });

      this.close();
    }
  }

  guardarReseteoContrasena(usuario: string) {
    //integrar con servicio de resetear contraseña de usuario
    console.log("Usuario data: ", this.usuario);
    const request = {
      coUser: this.trabajor?.coUsuario, idUsuario: this.usuario?.idUsuario,
      correo: this.resetearContrasenaForm.get('correo').value.name, nombrePersona: this.trabajor?.nombrePersona
    };
    this.resetearContrasenaService.resetearContrasena(request).subscribe(
      {
        next: (response) => {
          this.guardadoSatisfactorio(usuario);
          this.resetearContrasenaForm.reset();
        },
        error: (err) => {
          this.error = err;
          console.error('Error al resetear contraseña de usuario', err);
        }
      });
  }

  guardadoSatisfactorio(usuario: string) {
    this.refModal = this.dialogService.open(
      AlertModalComponent,
      {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'success',
          title: 'RESETEO REALIZADO CORRECTAMENTE',
          description: 'El reseteo de la contraseña para el usuario \"' + usuario + '\" se realizó correctamente.',
          confirmButtonText: 'Listo'
        }
      }
    );
    this.ref.close();
  }

  getNotaResetearContrasena() {
    return this.nota;
  }
}
