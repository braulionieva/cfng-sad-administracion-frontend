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
  DynamicDialogConfig,
  DynamicDialogRef,
  DialogService,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Auth2Service } from '@services/auth/auth2.service';
import { AlertModalComponent } from '@components/alert-modal/alert-modal.component';
import { ModalMensajeComponent } from '@modulos/maestros/categorias/modals/modal-mensaje/modal-mensaje.component';
import { EventService } from '../event.service';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-editar-sede',
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
  templateUrl: './editar-sede.component.html',
  styleUrls: ['./editar-sede.component.scss'],
})
export class EditarSedeComponent implements OnInit {
  disFiscales: DistritoFiscal[] = [];
  distGeograficos: DistritoGeografico[] = [];

  public formularioEditarSede: FormGroup;

  sede: SedeBandeja;

  private primerRender: boolean = true;
  infoUsuario;
  public existeSede;

  error: any;
  initialFormValues: any;

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
    private readonly userService: Auth2Service,
    public readonly dialogService: DialogService,
    private readonly eventService: EventService
  ) {
    this.formularioEditarSede = this.fb.group({
      nombreSede: new FormControl(null, [
        Validators.required,
        //Validators.pattern(/^([a-z A-Z])*$/),
        Validators.minLength(2),
        Validators.maxLength(100),
        //this.noSoloEspacios(),
      ]),
      distritoFiscal: new FormControl<DistritoFiscal | null>(null, [
        Validators.required,
      ]),
      distritoGeografico: new FormControl<DistritoGeografico | null>(null),
      direccionSede: new FormControl(null),
    });
  }

  ngOnInit() {
    if (!this.config?.data) return;
    this.disFiscales = this.config.data?.distritos;
    this.setData(this.config.data.sede);
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

  private setData(data) {
    this.nombreField.patchValue(data.nombreSede);
    this.direccionField.patchValue(data.direccionSede);

    // distrito fiscal
    const distritoFiscalFiltrado = this.disFiscales.find(
      (item) => item.id == data.idDistritoFiscal
    );
    this.distritoFiscalField.patchValue(distritoFiscalFiltrado.id);

    // distrito geografico
    const hasUbigeo = this.config.data?.sede.idUbigeo > 0;
    if (hasUbigeo || this.distritoFiscalField.value)
      this.obtenerDistritoGeografico(distritoFiscalFiltrado.id);

    // Guardar los valores iniciales
    this.initialFormValues = this.formularioEditarSede.getRawValue();
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
    const currentFormValues = this.formularioEditarSede.getRawValue();

    if (isEqual(this.initialFormValues, currentFormValues)) {
      // Los valores son iguales; no se han realizado cambios efectivos
      this.dialogService.open(AlertModalComponent, {
        width: '600px',
        showHeader: false,
        data: {
          icon: 'info',
          title: 'Sin cambios',
          description: 'No se ha realizado ningún cambio en los datos.',
          confirmButtonText: 'Aceptar',
        },
      });
      return; // Salir sin enviar la solicitud de edición
    }

    let sede = this.obtenerSede();

    this.confirmaEditar(sede);

    this.refModal.onClose.subscribe({
      next: (resp) => {
        if (resp == 'confirm') {
          this.editarSede(sede);
        }
      },
    });
  }

  confirmaEditar(sede: SedeBandeja) {
    this.refModal = this.dialogService.open(AlertModalComponent, {
      width: '828px',
      showHeader: false,
      data: {
        icon: 'question',
        title: 'Editar datos de la sede',
        confirm: true,
        confirmButtonText: 'Aceptar',
        description: `A continuación, se procederá a modificar los datos de la sede <strong>${sede.nombreSede}</strong>. ¿Está seguro de realizar esta acción?`,
      },
    });
  }

  editarSede(sede: SedeBandeja) {
    this.sedeService.editarSede(sede).subscribe({
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
              title: 'Sede editada',
              confirmButtonText: 'Listo',
              description: `La actualización de los datos de la sede <strong>${sede.nombreSede}</strong> se realizó de forma exitosa.`,
            },
          });
          this.eventService.emitRefreshSedesEvent();
        }
      },
      error: (err) => {
        console.error('Error al editar la sede:', err);

        let errorMessage =
          'Ocurrió un error al editar la sede. Por favor, inténtelo nuevamente.';

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

  private obtenerSede(): SedeBandeja {
    let direccionSede = this.direccionField.value?this.limpiarEspacios(
      this.direccionField.value
    ):null

    let nuevaSede = {
      codSede: this.config.data?.sede.codSede,
      nombreSede: this.limpiarEspacios(this.nombreField.value),
      idDistritoFiscal: this.distritoFiscalField.value,
      idUbigeo: this.distritoGeograficoField.value,
      direccionSede: direccionSede,
      usuarioModificador: this.infoUsuario?.usuario.usuario,
    };
    return nuevaSede;
  }

  public obtenerDistritoGeografico(idDistritoFiscal: any): void {
    this.spinner.show();
    // resetear distritos fiscales
    this.distGeograficos = [];

    this.maestroService.obtenerDistritoGeografico(idDistritoFiscal).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.distGeograficos = response;

        if (this.distGeograficos.length <= 0 && this.primerRender) return;
        const distritoGeograficoFiltrado = this.distGeograficos.find(
          (item) => item.idUbigeo == this.config.data?.sede.idUbigeo
        );

        if (!distritoGeograficoFiltrado) return;
        this.distritoGeograficoField.patchValue(
          distritoGeograficoFiltrado?.idUbigeo
        );

        this.primerRender = false;
      },
      error: (err) => {
        this.error = err;
        console.error('Error al obtener servidores:', err);
        this.spinner.hide();
      },
    });
  }

  public close(): void {
    this.ref.close();
  }

  get nombreField(): AbstractControl {
    return this.formularioEditarSede.get('nombreSede');
  }
  get distritoFiscalField(): AbstractControl {
    return this.formularioEditarSede.get('distritoFiscal');
  }
  get distritoGeograficoField(): AbstractControl {
    return this.formularioEditarSede.get('distritoGeografico');
  }
  get direccionField(): AbstractControl {
    return this.formularioEditarSede.get('direccionSede');
  }
}
