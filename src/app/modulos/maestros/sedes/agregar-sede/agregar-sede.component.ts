import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import {
  DistritoFiscal,
  DistritoGeografico,
  SedeBandeja,
} from '@interfaces/admin-sedes/admin-sedes';
import { AdminSedeService } from '@services/admin-sede/admin-sede.service';
import { MaestroService } from '@services/maestro/maestro.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Auth2Service } from '@services/auth/auth2.service';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';
import { EventService } from '../event.service';

@Component({
  selector: 'app-agregar-sede',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
  ],
  templateUrl: './agregar-sede.component.html',
  styleUrls: ['./agregar-sede.component.scss'],
})
export class AgregarSedeComponent implements OnInit {
  disFiscales: DistritoFiscal[] = [];
  distGeograficos: DistritoGeografico[] = [];
  infoUsuario;
  public existeSede;

  public formularioAgregarSede: FormGroup;

  error: any;

  refModal: DynamicDialogRef;
  refModalMensaje: DynamicDialogRef;

  constructor(
    private readonly fb: FormBuilder,
    public ref: DynamicDialogRef,
    public errorModalRef: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly maestroService: MaestroService,
    private readonly sedeService: AdminSedeService,
    private readonly spinner: NgxSpinnerService,
    public readonly dialogService: DialogService,
    private readonly userService: Auth2Service,
    private readonly eventService: EventService
  ) {
    this.formularioAgregarSede = this.fb.group({
      nombreSede: new FormControl(null, [
        Validators.required,
        //Validators.pattern(/^([a-z A-Z])*$/),
        Validators.minLength(2),
        Validators.maxLength(100),
        //this.noSoloEspacios(),
      ]),
      idDistritoFiscal: [null, Validators.required],
      idDistritoGeografico: [null],
      direccionSede: new FormControl(
        null //[Validators.required, //Validators.pattern(/^([a-zA-Z0-9 ])*$/), Validators.minLength(2), Validators.maxLength(100),]
        //this.noSoloEspacios()
      ),
    });
  }

  ngOnInit() {

    if (this.config.data?.distritos) {
      this.disFiscales = this.config.data.distritos.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
    }
    this.infoUsuario = this.userService.getUserInfo();
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

  //Limpia espacios
  private limpiarEspacios(texto: string): string {
    return texto.trim().replace(/\s+/g, ' ');
  }

  public icon(name: string): string {
    return `assets/icons/${name}.svg`;
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

  onSubmit() {
    let sede = this.obtenerSede();

    this.confirmaGuardar(sede);

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp == 'confirm') {
          this.crearSede(sede);
        }
      },
    });
  }

  confirmaGuardar(sede: SedeBandeja) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '828px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Registrar nueva sede',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description: `A continuación, se procederá a registrar los datos de la nueva sede <strong>${sede.nombreSede}</strong>. ¿Está seguro de realizar esta acción?`,
      },
    });
  }

  crearSede(sede: SedeBandeja) {
    this.sedeService.crearNuevaSede(sede).subscribe({
      next: (response) => {
        if (response.existe === '1') {
          this.existeSede = true;
          this.openModalSedeExiste();
        } else {
          this.existeSede = false;
          this.ref.close(response.message);
          this.ref = this.dialogService.open(AlertModalComponent, {
            width: '700px',
            showHeader: false,
            data: {
              icon: 'success',
              title: 'Sede registrada',
              confirmButtonText: 'Listo',
              description: `El registro de los datos de la nueva sede <strong>${sede.nombreSede}</strong> se realizó de forma exitosa.`,
            },
          });
          this.eventService.emitRefreshSedesEvent();
        }
      },
      error: (err) => {
        console.error('Error al crear la sede:', err);

        let errorMessage =
          'Ocurrió un error al crear la sede. Por favor, inténtelo nuevamente.';

        // Si el error tiene una estructura conocida
        if (err.error?.message) {
          errorMessage = err.error.message;
        }

        // Mostrar modal con el mensaje de error
        this.errorModalRef = this.dialogService.open(AlertModalComponent, {
          width: '600px',
          showHeader: false,
          data: {
            icon: 'error',
            title: 'Error',
            description: errorMessage,
            confirmButtonText: 'Listo',
          },
        });
      },
    });
  }

  openModalSedeExiste() {
    this.refModalMensaje = this.dialogService.open(ModalMensajeComponent, {
      width: '800px',
      contentStyle: { overflow: 'auto' },
      closable: false,
      showHeader: false,
      data: {
        icon: 'warning-red',
        title: 'SEDE YA EXISTE',
        subTitle:
          'La sede ya se encuentra registrada, por favor validar los datos.',
        textButtonSecondary: 'Cerrar',
        showOnlySecondaryButton: false,
      },
    });
  }

  //refactorizado
  private randomCodigoSede(): string {
    const chars = '0123456789';
    let result = '';
    const charsLength = chars.length;

    //crypto.getRandomValue: Se utiliza esta función para obtener un número aleatorio seguro criptográficamente en lugar de Math.random
    for (let i = 0; i < 5; i++) {
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      const index = randomValues[0] % charsLength;
      result += chars.charAt(index);
    }

    return result;
  }

  private obtenerSede(): SedeBandeja {
    let codigoSede = this.randomCodigoSede();
    let direccionSede = this.formularioAgregarSede.value.direccionSede?this.limpiarEspacios(
      this.formularioAgregarSede.value.direccionSede
    ):null
    let nuevaSede = {
      codSede: codigoSede,
      nombreSede: this.limpiarEspacios(
        this.formularioAgregarSede.value.nombreSede
      ),
      idDistritoFiscal: this.formularioAgregarSede.value.idDistritoFiscal,
      idUbigeo: this.formularioAgregarSede.value.idDistritoGeografico,
      direccionSede: direccionSede,
      usuarioCreador: this.infoUsuario?.usuario.usuario,
    };
    return nuevaSede;
  }

  public obtenerDistritoGeografico(event: any): void {
    this.spinner.show();
    this.maestroService.obtenerDistritoGeografico(event.value).subscribe({
      next: (response) => {
        // Ajusta la propiedad con la que ordenas según tu interfaz
        this.distGeograficos = response.sort((a, b) =>
          a.distritoGeografico.localeCompare(b.distritoGeografico)
        );
        this.spinner.hide();
      },
      error: (err) => {
        this.error = err;
        this.spinner.hide();
      },
    });
  }

  public close(): void {
    this.ref.close();
  }
}
